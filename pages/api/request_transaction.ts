import { NextApiRequest, NextApiResponse } from "next"
import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js"
import { getOrCreateAssociatedTokenAccount, createTransferCheckedInstruction, getMint } from "@solana/spl-token"
import { GuestIdentityDriver, keypairIdentity, Metaplex } from "@metaplex-foundation/js"
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

// Creates a simple test transaction
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

  sendSolTx.feePayer = account

  // Shop doesn't need to sign

  const latestBlockhash = await connection.getLatestBlockhash()
  sendSolTx.recentBlockhash = latestBlockhash.blockhash

  console.log(sendSolTx.recentBlockhash)

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

/*
async function postExec(account: PublicKey, product: string, coupon: any): Promise<PostResponse> {

  // Init

  const shopPrivateKey = process.env.SHOP_PRIVATE_KEY
  if (!shopPrivateKey) throw new Error('SHOP_PRIVATE_KEY not found')

  const clusterUrl = process.env.CLUSTER_URL
  if (!clusterUrl) throw new Error('CLUSTER_URL not found')

  const shopKeypair = Keypair.fromSecretKey(base58.decode(shopPrivateKey))

  const connection = new Connection(clusterUrl)

  // Init Metaplex

  const metaplex = Metaplex
    .make(connection)
    .use(keypairIdentity(shopKeypair))

  const nfts = metaplex.nfts()

  // Build transaction

  const mintKeypair = Keypair.generate()

  // TODO: it should NOT create a Collection NFT!
  const transactionBuilder = await nfts.builders().create({
    uri: NFT_URLS[product + "_metadata"],
    name: NFT_NAMES[product],
    tokenOwner: account,
    updateAuthority: shopKeypair,
    sellerFeeBasisPoints: 100,
    useNewMint: mintKeypair,
  })

  // Case: No coupon

  if (coupon === undefined) {

    const sendSolInstruction = SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: shopKeypair.publicKey,
        lamports: LAMPORTS_PER_SOL * NFT_PRICES[product]
    })

    const identitySigner = new GuestIdentityDriver(account)

    transactionBuilder.prepend({
        instruction: sendSolInstruction,
        signers: [identitySigner]
    })

  } else {
    // TODO
    // Check that coupon exists; retrieve its discount
    
    // SOL transaction with discount

    // Burn the coupon
  }

  // Mint coupon
  // Only if not a coupon is being used right now
  // And the discount depends on the price (may be 0!)

  let couponTransactionBuilder;
  let mintCouponKeypair;
  
  if (coupon === undefined) {

    let discount = 0
    const productPrice = NFT_PRICES[product]
    // const productPrice = 0.7
    let couponName = '';
    let couponUri = '';

    if (productPrice >= 0.5) {
        discount = 0.05
        couponName = "SolBoards Coupon (0.05 SOL)"
        couponUri = NFT_URLS["coupon_01_metadata"]
    }

    if (productPrice >= 0.6) {
        discount = 0.1
        couponName = "SolBoards Coupon (0.1 SOL)"
        couponUri = NFT_URLS["coupon_02_metadata"]
    }

    if (productPrice > 0.7) {
        discount = 0.1
        couponName = "SolBoards Coupon (0.15 SOL)"
        couponUri = NFT_URLS["coupon_03_metadata"]
    }

    if (discount != 0) {

        console.log("create coupon")

        mintCouponKeypair = Keypair.generate()

        couponTransactionBuilder = await nfts.builders().create({
            uri: couponUri,
            name: couponName,
            tokenOwner: account,
            updateAuthority: shopKeypair,
            sellerFeeBasisPoints: 0,
            useNewMint: mintCouponKeypair,
        })
    } else {
        console.log("no discount")
    }

  }

  // Serialize

  let output = {'transaction': '', 'coupon_transaction': ''}
  
  const latestBlockhash = await connection.getLatestBlockhash()
  const transaction = await transactionBuilder.toTransaction(latestBlockhash)

  transaction.feePayer = account

  transaction.sign(shopKeypair, mintKeypair)

  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false
  })
  const transaction_base64 = serializedTransaction.toString('base64')

  output['transaction'] = transaction_base64

  // Serialize (coupon)

  if (couponTransactionBuilder !== undefined) {

    console.log("Create coupon transaction")

    const latestBlockhash = await connection.getLatestBlockhash()
    const couponTransaction = await couponTransactionBuilder.toTransaction(latestBlockhash)

    couponTransaction.feePayer = account

    couponTransaction.sign(shopKeypair, mintCouponKeypair as Keypair)

    const serializedCouponTransaction = couponTransaction.serialize({
        requireAllSignatures: false
    })
    const coupon_transaction_base64 = serializedCouponTransaction.toString('base64')

    output['coupon_transaction'] = coupon_transaction_base64

  }

  return output
}
*/

async function post(
  req: NextApiRequest,
  res: NextApiResponse<PostResponse | PostError>
) {

  console.log(req.body)

  const { account, product, coupon } = req.body as InputData

  if (!account || !product || !coupon) {
    res.status(400).json({ status: 'error', message: "Invalid request" })
    return
  }

  try {
    const accountPubKey = new PublicKey(account)

    if (!(product in NFT_PRICES)) {
      throw 'Product not found'
    }

    let couponPubKey = coupon != 'null' ? new PublicKey(coupon) : undefined;

    //const transactionOutputData = await postExec(accountPubKey, product, couponPubKey);
    const transactionOutputData = await postExecSimple(accountPubKey, product, couponPubKey);

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
