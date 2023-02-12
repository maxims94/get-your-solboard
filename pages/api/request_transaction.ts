import { NextApiRequest, NextApiResponse } from "next"
import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js"
import { getOrCreateAssociatedTokenAccount, createTransferCheckedInstruction, getMint } from "@solana/spl-token"
import { GuestIdentityDriver, keypairIdentity, Metaplex, TransactionBuilder, NftBuildersClient } from "@metaplex-foundation/js"
import base58 from 'bs58'
import * as dotenv from "dotenv"
dotenv.config()

type InputData = {
  account: string,
  product: string,
  coupon: string
}

type PostResponseTx = {
  label: string
  data: string
}

export type PostResponse = {
  status: string,
  tx: PostResponseTx[]
}

export type PostError = {
  status: string,
  message: string
}

const NFT_URLS = require('nft_data/nft_urls.json')
const NFT_PRICES = require('nft_data/nft_prices.json')
const NFT_NAMES = require('nft_data/nft_names.json')

const COUPON_NAME_TO_AMOUNT: { [index: string]: number } = {
  'SolBoards Coupon (0.05 SOL)': 0.05,
  'SolBoards Coupon (0.1 SOL)': 0.1,
  'SolBoards Coupon (0.15 SOL)': 0.15
}

//
// Creates a simple test transaction for testing
//

async function postExecSimple(account: PublicKey, product: string, coupon: PublicKey | undefined): Promise<PostResponse> {

  // Init

  const shopPrivateKey = process.env.SHOP_PRIVATE_KEY
  if (!shopPrivateKey) throw new Error('SHOP_PRIVATE_KEY not found')

  const clusterUrl = process.env.CLUSTER_URL
  if (!clusterUrl) throw new Error('CLUSTER_URL not found')

  const shopKeypair = Keypair.fromSecretKey(base58.decode(shopPrivateKey))

  const connection = new Connection(clusterUrl)

  // Build Tx

  const sendSolTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: shopKeypair.publicKey,
      lamports: LAMPORTS_PER_SOL * 0.1
    })
  )

  // This is not a problem since the user will sign the transaction
  sendSolTx.feePayer = account

  // Shop merely receives the money => doesn't need to sign!

  const latestBlockhash = await connection.getLatestBlockhash()
  sendSolTx.recentBlockhash = latestBlockhash.blockhash

  const serializedTx = sendSolTx.serialize({ requireAllSignatures: false })

  const responseTxArr : PostResponseTx[] = [];

  const output:PostResponse = {
    status: 'success',
    tx: responseTxArr,
  }

  output.tx.push({
    label: 'test_tx',
    data: serializedTx.toString('base64')
  })

  return output
}

//
// Full
//

async function postExec(account: PublicKey, product: string, coupon: any): Promise<PostResponse> {

  // Init

  const shopPrivateKey = process.env.SHOP_PRIVATE_KEY
  if (!shopPrivateKey) throw new Error("SHOP_PRIVATE_KEY not found")

  const clusterUrl = process.env.CLUSTER_URL
  if (!clusterUrl) throw new Error("CLUSTER_URL not found")

  const shopKeypair = Keypair.fromSecretKey(base58.decode(shopPrivateKey))
  const buyerPublicKey = account

  const connection = new Connection(clusterUrl)

  console.log("Shop pubkey:", shopKeypair.publicKey.toString())
  console.log("Buyer pubkey:", buyerPublicKey.toString())

  // Init Metaplex

  const metaplex = Metaplex
    .make(connection)
    .use(keypairIdentity(shopKeypair))

  const nfts = metaplex.nfts()

  const client = metaplex.nfts().builders()

  // Case analysis
  
  if (!(product in NFT_PRICES)) {
    throw new Error("Invalid product")
  }
  const productPrice = NFT_PRICES[product]

  let nftPrice: number = 0;
  let couponAmount: number = 0;
  let couponName: string = '';
  let couponUrl: string = '';

  let transactions;

  if (coupon === undefined) {

    // Case 1 & 2

    couponAmount = 0

    if (productPrice >= 0.5) {
        couponAmount = 0.05
        couponName = "SolBoards Coupon (0.05 SOL)"
        couponUrl = NFT_URLS["coupon_01_metadata"]
    }

    if (productPrice >= 0.6) {
        couponAmount = 0.1
        couponName = "SolBoards Coupon (0.1 SOL)"
        couponUrl = NFT_URLS["coupon_02_metadata"]
    }

    if (productPrice > 0.7) {
        couponAmount = 0.15
        couponName = "SolBoards Coupon (0.15 SOL)"
        couponUrl = NFT_URLS["coupon_03_metadata"]
    }

    nftPrice = productPrice

    if (couponAmount != 0) {
        console.log(`Case: Sell NFT (price: ${nftPrice}) and create coupon (amount: ${couponAmount})`)
        transactions = await sellNftAndCreateCouponTransaction(connection, client, shopKeypair, buyerPublicKey, nftPrice, product, couponUrl, couponName)
    } else {
        console.log(`Case: Sell NFT (price: ${nftPrice})`)
        transactions = await sellNftTransaction(connection, client, shopKeypair, buyerPublicKey, nftPrice, product)
    }

  } else {
    
    // Case 3

    console.log(`Case: Sell NFT and redeem coupon (final price: ${nftPrice})`)

    // Check validity of coupon NFT

    console.log("Validate coupon address:", coupon.toString())

    console.log("Check NFTs found by user...")
    
    const ownedNfts = await metaplex.nfts().findAllByOwner({ owner: buyerPublicKey });

    let couponNft;
    let couponAmount: number = 0;
    let couponName;

    for (let item of ownedNfts) {

      // console.log("Item mint address:", item.mintAddress.toString())
      
      if (item.model != 'metadata') {
        console.log("Unsupported model:", item.model)
        continue
      }

      if (!item.mintAddress.equals(coupon)) {
        continue
      }

      console.log("Mint address found!")

      if (!item.updateAuthorityAddress.equals(shopKeypair.publicKey)) {

        console.log("Not our NFT")
        throw new Error("Invalid Coupon NFT")

      }

      console.log("Our mint! ")

      if (!(item.name in COUPON_NAME_TO_AMOUNT)) {

        throw new Error("Invalid Coupon NFT")
        console.log("Wrong kind of NFT")

      }

      console.log("Right kind!")
      
      couponNft = item.mintAddress
      couponAmount = COUPON_NAME_TO_AMOUNT[item.name]
      couponName = item.name

      break;
    }

    if (couponNft === undefined) {
      console.log("Couldn't find coupon NFT")
      throw new Error("Invalid coupon")
    }

    console.log("VALID coupon found!")

    console.log("Mint address:", couponNft.toString())
    console.log("Name:", couponName)
    console.log("Amount:", couponAmount)

    nftPrice = Number((productPrice - couponAmount).toFixed(2))

    transactions = await sellNftAndRedeemCouponTransaction(connection, client, shopKeypair, buyerPublicKey, nftPrice, product, couponNft)
  }

  console.log(`Return ${transactions.length} transaction(s)`)

  const output:PostResponse = {
    status: 'success',
    tx: transactions
  }

  return output
}

function formatTransaction(transaction: Transaction, label: string) {

  const serializedTransaction = transaction.serialize({ requireAllSignatures: false })
  
  return {
    label: label,
    data: serializedTransaction.toString('base64')
  }
}

async function sellNftTransaction(connection: Connection, client: NftBuildersClient, shopKeypair: Keypair, buyerPublicKey: PublicKey, nftPrice: number, product: string){

  console.log("Case: Sell NFT")

  console.log("Create transaction: Mint NFT for SOL")

  const transactionBuilder = new TransactionBuilder()
  
  // Transfer SOL

  console.log("Add: Transfer SOL")

  const sendSolInstruction = SystemProgram.transfer({
      fromPubkey: buyerPublicKey,
      toPubkey: shopKeypair.publicKey,
      lamports: LAMPORTS_PER_SOL * nftPrice
  })
  
  transactionBuilder.append({
    instruction: sendSolInstruction,
    signers: [new GuestIdentityDriver(buyerPublicKey)]
  })

  // Mint NFT

  console.log("Add: Mint NFT")

  const nftMintKeypair = Keypair.generate()

  console.log("Mint address:", nftMintKeypair.publicKey.toString())

  const nftTransactionBuilder = await client.create({
    uri: NFT_URLS[product + "_metadata"],
    name: NFT_NAMES[product],
    symbol: "SOLB",
    sellerFeeBasisPoints: 100,
    useNewMint: nftMintKeypair,
    isMutable: false,
    tokenOwner: buyerPublicKey,
    mintAuthority: shopKeypair
  })

  transactionBuilder.append(nftTransactionBuilder)

  // Convert to Transaction

  const latestBlockhash = await connection.getLatestBlockhash()
  const transaction = await transactionBuilder.toTransaction(latestBlockhash)

  transaction.feePayer = shopKeypair.publicKey

  transaction.sign(shopKeypair, nftMintKeypair)
  
  return [formatTransaction(transaction, 'mint_nft_for_sol')]
}

async function sellNftAndCreateCouponTransaction(connection: Connection, client: NftBuildersClient, shopKeypair: Keypair, buyerPublicKey: PublicKey, nftPrice: number, product: string, couponUrl: string, couponName: string) {


  console.log("Case: Sell NFT and create coupon")

  console.log("Create transaction: Mint NFT for SOL")

  // Split into two TX due to TX size limit
  
  const result = []

  const latestBlockhash = await connection.getLatestBlockhash()

  // First tx
  
  const transactionBuilder = new TransactionBuilder()

  // Transfer SOL

  console.log("Add: Transfer SOL")

  const sendSolInstruction = SystemProgram.transfer({
      fromPubkey: buyerPublicKey,
      toPubkey: shopKeypair.publicKey,
      lamports: LAMPORTS_PER_SOL * nftPrice
  })
  
  transactionBuilder.append({
    instruction: sendSolInstruction,
    signers: [new GuestIdentityDriver(buyerPublicKey)]
  })

  // Mint NFT

  console.log("Add: Mint NFT")

  const nftMintKeypair = Keypair.generate()

  console.log("Mint address:", nftMintKeypair.publicKey.toString())

  const nftTransactionBuilder = await client.create({
    uri: NFT_URLS[product + "_metadata"],
    name: NFT_NAMES[product],
    symbol: "SOLB",
    sellerFeeBasisPoints: 100,
    useNewMint: nftMintKeypair,
    isMutable: false,
    tokenOwner: buyerPublicKey,
    mintAuthority: shopKeypair
  })

  transactionBuilder.append(nftTransactionBuilder)
  
  // Convert to Transaction

  const transaction = await transactionBuilder.toTransaction(latestBlockhash)

  transaction.feePayer = shopKeypair.publicKey

  transaction.sign(shopKeypair, nftMintKeypair)

  result.push(formatTransaction(transaction, 'mint_nft_for_sol'))
  
  // Mint coupon NFT

  console.log("Create transaction: Mint coupon NFT")

  const couponNftMintKeypair = Keypair.generate()

  console.log("Coupon mint address:", couponNftMintKeypair.publicKey.toString())

  const couponNftTransactionBuilder = await client.create({
    uri: couponUrl,
    name: couponName,
    symbol: "COUP",
    sellerFeeBasisPoints: 0,
    useNewMint: couponNftMintKeypair,
    isMutable: false,
    tokenOwner: buyerPublicKey,
    mintAuthority: shopKeypair
  })

  // Convert to Transaction

  const couponTransaction = await couponNftTransactionBuilder.toTransaction(latestBlockhash)

  couponTransaction.feePayer = shopKeypair.publicKey

  couponTransaction.sign(shopKeypair, couponNftMintKeypair)

  result.push(formatTransaction(couponTransaction, 'mint_coupon_nft'))

  return result

}

async function sellNftAndRedeemCouponTransaction(connection: Connection, client: NftBuildersClient, shopKeypair: Keypair, buyerPublicKey: PublicKey, nftPrice: number, product: string, couponPublicKey: PublicKey) {

  console.log("Case: Sell NFT and redeem coupon")

  console.log("Create transaction: Mint NFT for SOL")
  
  const result = []

  const latestBlockhash = await connection.getLatestBlockhash()

  // Build TX

  const transactionBuilder = new TransactionBuilder()
  
  // Transfer SOL

  console.log("Add: Transfer SOL")

  const sendSolInstruction = SystemProgram.transfer({
      fromPubkey: buyerPublicKey,
      toPubkey: shopKeypair.publicKey,
      lamports: LAMPORTS_PER_SOL * nftPrice
  })
  
  transactionBuilder.append({
    instruction: sendSolInstruction,
    signers: [new GuestIdentityDriver(buyerPublicKey)]
  })

  // Mint NFT

  console.log("Add: Mint NFT")

  const nftMintKeypair = Keypair.generate()

  console.log("Mint address:", nftMintKeypair.publicKey.toString())

  const nftTransactionBuilder = await client.create({
    uri: NFT_URLS[product + "_metadata"],
    name: NFT_NAMES[product],
    symbol: "SOLB",
    sellerFeeBasisPoints: 100,
    useNewMint: nftMintKeypair,
    isMutable: false,
    tokenOwner: buyerPublicKey,
    mintAuthority: shopKeypair
  })

  transactionBuilder.append(nftTransactionBuilder)

  // Delete coupon NFT

  console.log("Add: Delete coupon NFT")

  const deleteTransactionBuilder = await client.delete({
    mintAddress: couponPublicKey,
    owner: new GuestIdentityDriver(buyerPublicKey)
  });

  transactionBuilder.append(deleteTransactionBuilder)
  
  // Convert to Transaction

  const transaction = await transactionBuilder.toTransaction(latestBlockhash)

  transaction.feePayer = shopKeypair.publicKey

  transaction.sign(shopKeypair, nftMintKeypair)

  result.push(formatTransaction(transaction, 'mint_nft_for_sol_del_coupon'))

  return result

  /*
  
  // Second TX
  
  console.log("Create transaction: Delete coupon NFT")

  // Delete coupon NFT

  console.log("Add: Delete coupon NFT")

  const deleteTransactionBuilder = await client.delete({
    mintAddress: couponPublicKey,
    owner: new GuestIdentityDriver(buyerPublicKey)
  });
  
  // Convert to Transaction

  const deleteTransaction = await deleteTransactionBuilder.toTransaction(latestBlockhash)

  deleteTransaction.feePayer = shopKeypair.publicKey

  deleteTransaction.sign(shopKeypair)

  result.push(formatTransaction(deleteTransaction, 'delete_coupon_nft'))

  */
}

async function post(
  req: NextApiRequest,
  res: NextApiResponse<PostResponse | PostError>
) {

  const { account, product, coupon } = req.body as InputData

  if (!account || !product || !coupon) {
    res.status(400).json({ status: 'error', message: "Invalid request" })
    return
  }

  console.log("Request:", req.body)

  try {
    const accountPubKey = new PublicKey(account)

    if (!(product in NFT_PRICES)) {
      throw 'Product not found'
    }

    let couponPubKey = coupon != 'null' ? new PublicKey(coupon) : undefined;

    const transactionOutputData = await postExec(accountPubKey, product, couponPubKey);
    //const transactionOutputData = await postExecSimple(accountPubKey, product, couponPubKey);

    res.status(200).json(transactionOutputData)
    return
  } catch (error) {
    console.error(error);

    const errorResponse: PostError = { status: 'error', message: 'Error creating transaction: ' + String(error)}
    res.status(500).json(errorResponse)
    return
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostResponse | PostError>
) {
  if (req.method === "POST") {
    return await post(req, res)
  } else {
    return res.status(405).json({ status: 'error', message: "Method not allowed" })
  }
}
