import { bundlrStorage, keypairIdentity, Metaplex, toMetaplexFile } from "@metaplex-foundation/js"
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js"
import base58 from "bs58"
import * as dotenv from "dotenv"
import * as fs from "fs"
dotenv.config()

// SolBoards
//const NFT_METADATA = {
//  name: "SolBoard #10",
//  symbol: "SOLB",
//  description: "A skateboard from a different galaxy",
//  image: "https://arweave.net/0Ea4mHHeF7S8In0RVi4oABnfj5f-njSYP4zxHP4U7oY"
//}

// Coupons
const NFT_METADATA = {
  name: "SolBoard Coupon",
  symbol: "COUP",
  description: "A coupon for SolBoards",
  discount: 0.15,
  image: "https://arweave.net/LeSmi13WFyCkAGeRlng79LUlaRGYg5q64OqK10_Fraw"
}

async function main() {

  const shopPrivateKey = process.env.SHOP_PRIVATE_KEY
  if (!shopPrivateKey) throw new Error('SHOP_PRIVATE_KEY not found')

  const clusterUrl = process.env.CLUSTER_URL
  if (!clusterUrl) throw new Error('CLUSTER_URL not found')

  const bundlrAddress = "https://devnet.bundlr.network"

  const shopKeypair = Keypair.fromSecretKey(base58.decode(shopPrivateKey))

  const connection = new Connection(clusterUrl)

  const metaplex = Metaplex
    .make(connection)
    .use(keypairIdentity(shopKeypair))
    .use(bundlrStorage({
      address: bundlrAddress,
      providerUrl: clusterUrl,
      timeout: 60000
    }))

  const uploadedMetadata = await metaplex.nfts().uploadMetadata(NFT_METADATA)

  console.log(`Uploaded metadata: ${uploadedMetadata.uri}`)
}

main()
  .then(() => {
    console.log("Done!")
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
