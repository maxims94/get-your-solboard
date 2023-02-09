import { NextApiRequest, NextApiResponse } from "next"
import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js"
import { getOrCreateAssociatedTokenAccount, createTransferCheckedInstruction, getMint } from "@solana/spl-token"
import { GuestIdentityDriver, keypairIdentity, Metaplex, TransactionBuilder } from "@metaplex-foundation/js"
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

async function sellNftTransaction(transactionBuilder: TransactionBuilder, shopKeypair: Keypair, buyerPublicKey: PublicKey, nftPrice: number) {

  console.log("Create transaction: Sell NFT")
  
  // Transfer SOL

  console.log("Transfer SOL")

  const sendSolInstruction = SystemProgram.transfer({
      fromPubkey: buyerPublicKey,
      toPubkey: shopKeypair.publicKey,
      lamports: LAMPORTS_PER_SOL * nftPrice
  })
  
  transactionBuilder.append({
    instruction: sendSolInstruction,
    signers: [new GuestIdentityDriver(buyerPublicKey)]
  })

  /*
  
  // Mint NFT

  console.log("Mint main NFT")

  const nftMintKeypair = Keypair.generate()

  console.log("Mint address:", nftMintKeypair.publicKey.toString())

  const nftTransactionBuilder = await client.create({
    uri: NFT_URLS[product + "_metadata"],
    name: NFT_NAMES[product],
    sellerFeeBasisPoints: 100,
    useNewMint: nftMintKeypair,
    isMutable: false,
    tokenOwner: buyerPublicKey,
    mintAuthority: shopKeypair
  })

  console.log("Keys:", nftTransactionBuilder.getInstructionsWithSigners().map(record => record.key))

  transactionBuilder.append(nftTransactionBuilder)

  console.log("Instruction count: ", transactionBuilder.getInstructionCount())

  // Convert to Transaction

  // Convert TransactionBuilder to Transaction object
  const latestBlockhash = await connection.getLatestBlockhash()
  const transaction = await transactionBuilder.toTransaction(latestBlockhash)

  // Shop pays fees
  transaction.feePayer = shopKeypair.publicKey

  // Sign
  transaction.sign(shopKeypair, nftMintKeypair)
  */
}

async function sellNftAndCreateCouponTransaction() {

  return new Transaction()
  /*


        mintCouponKeypair = Keypair.generate()

        couponTransactionBuilder = await nfts.builders().create({
            uri: couponUri,
            name: couponName,
            tokenOwner: account,
            updateAuthority: shopKeypair,
            sellerFeeBasisPoints: 0,
            useNewMint: mintCouponKeypair,
        })
  */
}

async function sellNftAndRedeemCouponTransaction() {

  return new Transaction()
  /*
  //
  // Redeem coupon TX
  // [Transfer SOL, mint NFT, burn coupon]
  //

  console.log("Redeem coupon (transfer SOL, mint NFT and burn coupon)")
  console.log("Build transaction")

  const client = metaplex.nfts().builders() // NftBuildersClient

  const transactionBuilder = new TransactionBuilder()
  
  // Transfer SOL

  console.log("Transfer SOL")

  const sendSolInstruction = SystemProgram.transfer({
      fromPubkey: buyerKeypair.publicKey,
      toPubkey: ownerKeypair.publicKey,
      lamports: LAMPORTS_PER_SOL * 0.1
  })
  
  transactionBuilder.append({
    instruction: sendSolInstruction,
    signers: [buyerKeypair]
  })

  console.log("Instruction count: ", transactionBuilder.getInstructionCount())
  
  // Mint purchased NFT

  console.log("Mint NFT")

  const nftMintKeypair = Keypair.generate()

  console.log("Mint address:", nftMintKeypair.publicKey.toString())

  const nftTransactionBuilder = await client.create({
    uri: "https://arweave.net/t1w7odrzZgTBXResWuDfsnHx6AGVo0EYTzRQyFgjXJc",
    name: "nft",
    sellerFeeBasisPoints: 100,
    useNewMint: nftMintKeypair,
    isMutable: false,
    tokenOwner: buyerKeypair.publicKey
  })

  console.log("Keys:", nftTransactionBuilder.getInstructionsWithSigners().map(record => record.key))

  transactionBuilder.append(nftTransactionBuilder)

  console.log("Instruction count: ", transactionBuilder.getInstructionCount())

  // Delete coupon NFT

  console.log("Delete coupon NFT")

  const deleteTransactionBuilder = await client.delete({
    mintAddress: couponPublicKey,
    owner: buyerKeypair
  });

  transactionBuilder.append(deleteTransactionBuilder)

  console.log("Keys:", deleteTransactionBuilder.getInstructionsWithSigners().map(record => record.key))

  console.log("Instruction count: ", transactionBuilder.getInstructionCount())

  console.log("Keys:", transactionBuilder.getInstructionsWithSigners().map(record => record.key))

  // Send transaction

  console.log("Send transaction...")

  const latestBlockhash = await connection.getLatestBlockhash()
  const transaction = await transactionBuilder.toTransaction(latestBlockhash)

  transaction.feePayer = ownerKeypair.publicKey
  */
}

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

  const transactionBuilder = new TransactionBuilder()

  // Case analysis
  
  if (!(product in NFT_PRICES)) {
    throw new Error("Invalid product")
  }
  const productPrice = NFT_PRICES[product]

  let nftPrice;
  let couponAmount;
  let couponName;
  let couponUrl;

  let transaction;
  let tx_label;

  if (coupon === undefined) {

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
        transaction = await sellNftAndCreateCouponTransaction()
        tx_label = 'sell_nft_and_create_coupon'
    } else {
        console.log(`Case: Sell NFT (price: ${nftPrice})`)
        transaction = await sellNftTransaction()
        tx_label = 'sell_nft'
    }

  } else {

    // Check validity of coupon

    // Get NFT info: name must be SolBoards, updateauthority must be shop, owner must be the user
    //

    //discoutn = f(name)
    couponAmount = 0
    nftPrice = productPrice - couponAmount

    console.log(`Case: Sell NFT and redeem coupon (final price: ${nftPrice})`)

    transaction = await sellNftAndRedeemCouponTransaction()
    tx_label = 'sell_nft_and_redeem_coupon'
    
  }

  const serializedTransaction = transaction.serialize({ requireAllSignatures: false })

  const output:PostResponse = {
    status: 'success',
    tx: [{
      label: tx_label,
      data: serializedTransaction.toString('base64')
    }],
  }

  return output
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
