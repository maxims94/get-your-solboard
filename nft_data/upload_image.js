import { bundlrStorage, keypairIdentity, Metaplex, toMetaplexFile } from "@metaplex-foundation/js"
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js"
import base58 from "bs58"
import * as dotenv from "dotenv"
import * as fs from "fs"
dotenv.config()

const NFT_IMAGE_PATH = "nft_data/img/coupon.png"
const NFT_FILE_NAME = "coupon.png"

async function main() {

  const shopPrivateKey = process.env.SHOP_PRIVATE_KEY
  if (!shopPrivateKey) throw new Error('SHOP_PRIVATE_KEY not found')

  const clusterUrl = process.env.CLUSTER_URL
  if (!clusterUrl) throw new Error('CLUSTER_URL not found')

  const bundlrAddress = "https://devnet.bundlr.network"

  const shopKeypair = Keypair.fromSecretKey(base58.decode(shopPrivateKey))

  const connection = new Connection(clusterUrl)

  const nfts = Metaplex
    .make(connection)
    .use(keypairIdentity(shopKeypair))
    .use(bundlrStorage({
      address: bundlrAddress,
      providerUrl: clusterUrl,
      timeout: 60000
    }))

  const imageBuffer = fs.readFileSync(NFT_IMAGE_PATH)
  const file = toMetaplexFile(imageBuffer, NFT_FILE_NAME)

  const imageUri = await nfts.storage().upload(file);

  console.log('Uploaded image: ', imageUri)
}

main()
  .then(() => {
    console.log("Done!")
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
