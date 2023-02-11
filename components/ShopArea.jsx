import styles from '../styles/Home.module.css'

import ShopItem from '../components/ShopItem'
import Checkout from '../components/Checkout'
import OverlayNotification from '../components/OverlayNotification'

import { useState } from 'react';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

import { Connection, clusterApiUrl, Keypair, PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

import { Title, Text } from '@mantine/core'

const SHOP_PUBLIC_KEY = 'MD5FAwmMTQ5h5X4wcgkGFagCHrZ7JpVdDehE94db5rw'
const NFT_PRICES = require('nft_data/nft_prices.json')

export default function ShopArea() {

  const [checkoutCouponList, setCheckoutCouponList] = useState([]);
  const [checkoutItemId, setCheckoutItemId] = useState(null);

  const [notification, setNotification] = useState({active: false, type: null, text: null});

  const setN = (active, type = null, text = null) => {
    setNotification({active, type, text, ts: Date.now()})
  }

  const [checkoutOpened, setCheckoutOpened] = useState(false);

  const { connection } = useConnection();
  const { publicKey, sendTransaction, signAllTransactions } = useWallet();

  const getCouponList = async (publicKey) => {
    console.log("Get coupon list");

    const apiUrl = clusterApiUrl('devnet');
    const connection = new Connection(apiUrl);

    const keypair = Keypair.generate();

    const metaplex = new Metaplex(connection);
    metaplex.use(keypairIdentity(keypair));

    const owner = publicKey

    const allNFTs = await metaplex.nfts().findAllByOwner({ owner });

    let result = []

    for(let i = 0; i < allNFTs.length; i++) {

      let item = allNFTs[i]

      if (item.updateAuthorityAddress.toBase58() != SHOP_PUBLIC_KEY) {
        continue
      }

      if (item.name == "SolBoards Coupon (0.05 SOL)") {
        result.push({
          'mintAddress': item.mintAddress.toBase58(),
          'name': item.name,
          'discount': 0.05
        })
      }

      if (item.name == "SolBoards Coupon (0.1 SOL)") {
        result.push({
          'mintAddress': item.mintAddress.toBase58(),
          'name': item.name,
          'discount': 0.1
        })
      }

      if (item.name == "SolBoards Coupon (0.15 SOL)") {
        result.push({
          'mintAddress': item.mintAddress.toBase58(),
          'name': item.name,
          'discount': 0.15
        })
      }
    }

    return result
  }

  const onShopItemClickTestN = () => {

    async function sleep(t) {
      return new Promise(resolve => setTimeout(resolve,t*1000))
    }
    
    (async () => {
      setN(true, "success", (<><Text>Checkout successful!</Text><Text>Go to 'Account' to view your purchased item!</Text></>))

      return

      setN(true, "loading", "Checking for coupons...")

      await sleep(2)

      setN(true, "success", "Success!")

      await sleep(2)

      setN(true, "failure", "Failure!")

    })()

  }

  const onShopItemClick = (itemId) => {

    if (!connection || !publicKey) {
      console.log("Not connected!")
      alert("Please connect a wallet!")
      //setN(true, "failure", "Please connect a wallet!")
      return null
    }

    prepareCheckout(itemId).then(
      () => {
        console.log("Prepare checkout successful")
      },
      error => {
        console.log("Prepare checkout failed:", String(error))
      }
    )

  }

  const prepareCheckout = async (itemId) => {
    setN(true, "loading", "Checking user balance...")

    const userBalance = await connection.getBalance(publicKey)

    console.log("User balance:", userBalance / LAMPORTS_PER_SOL)

    if (userBalance < 1 * LAMPORTS_PER_SOL) {

      console.log("Low user balance detected")

      console.log("Top up user account with 1 SOL")

      setN(true, "loading", "Top up wallet (1 SOL for free)...")

      const signature = await connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL);

      await connection.confirmTransaction(signature, "confirmed");
    }

    setN(true, "loading", "Checking for coupons...")

    const userCouponList = await getCouponList(publicKey)

    setCheckoutCouponList(userCouponList)

    setN(false)

    setCheckoutItemId(itemId)
    setCheckoutOpened(true)
  }

  // User closed the checkout window without sending a transaction
  const onCheckoutCancel = (event) => {
    console.log("Checkout cancelled")

    setCheckoutItemId(null)
    setCheckoutOpened(false)
    setCheckoutCouponList([])
  }
  
  // User confirmed the checkout
  const onCheckoutConfirm = (selectedOption) => {
    console.log("Checkout confirmed with option:", selectedOption)

    const selectedItemId = checkoutItemId

    setCheckoutItemId(null)
    setCheckoutOpened(false)
    setCheckoutCouponList([])

    performCheckout(selectedItemId, selectedOption).then(
      () => {
        console.log("Checkout successful!")
        //setN(true, "success", (<a href=''>test</a>))
        setN(true, "success", (<><Text>Checkout successful!</Text><Text>Go to 'Account' to view your purchased item!</Text></>))
      },
      error => {
        console.log("Checkout failed:", String(error))
        setN(true, "failure", "Error during checkout")
      }
    )
  }

  const performCheckout = async (selectedItemId, selectedOption) => {
    
    console.log("Request transaction from server")
    setN(true, "loading", "Request transaction from server...")

    // Build request

    let couponVar;

    if (selectedOption == "-1") {
      couponVar = "null"
    } else {
      couponVar = checkoutCouponList[Number(selectedOption)]['mintAddress']
    }

    const accountVar = publicKey.toBase58()
    const productVar = selectedItemId

    const requestBody = {
      account: accountVar,
      product: productVar,
      coupon: couponVar
    }

    console.log("request body:", requestBody)

    // Send request

    const responseRaw = await fetch('/api/request_transaction', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    
    const response = await responseRaw.json()

    setN(false)
    
    // Handle response
    
    console.log("response:", response)

    if (!('status' in response) || response.status != 'success') {
      throw Error("Request failed")
    }

    if (!('tx' in response)) {
      throw Error("Invalid server response")
    }

    if (response.tx.length == 0) {
      throw Error("No transactions")
    }

    // Recover transactions

    const labeledTransactions = response.tx.map(item => {
      return {
        label: item['label'],
        transaction: Transaction.from(
          Buffer.from(item['data'], "base64")
        )
      }
    })

    console.log("Labeled transactions:", labeledTransactions)

    // Sign transactions

    console.log("Sign transactions")

    // Get transactions that need to be signed

    const transactionsToSign = []
    const transactionsToSignIndices = []

    for(let i = 0; i < labeledTransactions.length; i++) {

      let item = labeledTransactions[i]

      if (item['label'] == 'mint_nft_for_sol' || item['label'] == 'delete_coupon_nft' || item['label'] == 'mint_nft_for_sol_del_coupon') {
        transactionsToSign.push(item['transaction'])  
        transactionsToSignIndices.push(i)  
      }
    }

    console.log("To sign:", transactionsToSign, transactionsToSignIndices)

    setN(true, "loading", "Waiting for your signature...")

    const signedTx = await signAllTransactions(transactionsToSign, connection)

    console.log("Signed:", signedTx)

    for(let j of transactionsToSignIndices) {
      labeledTransactions[j]['transaction'] = signedTx[j]
    }

    console.log("Labeled transactions (signed):", labeledTransactions)
    
    // Send transactions

    console.log("Send transactions")

    setN(true, "loading", "Sending transactions...")

    for(let item of labeledTransactions) {
      console.log("Current transaction:", item.label)

      let rawTransaction = item.transaction.serialize()
      let signature = await connection.sendRawTransaction(rawTransaction)

      console.log(signature)

      item['signature'] = signature
    }

    // Confirm transactions
    
    console.log("Confirm transactions")

    setN(true, "loading", "Confirming transactions...")

    for(let item of labeledTransactions) {

      console.log("Current transaction:", item.label)

      const { blockhash, lastValidBlockHeight} = await connection.getLatestBlockhash()

      const result = await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: item.signature }, "confirmed");

      console.log("Confirmation result: ", {result})

    }
    
  }

  const generateShopItem = (number) => {
    const number_str = String(number)
    const official_name = "SolBoard #" + number_str

    const number_str_padded = number_str.length == 1 ?  "0" + number_str : number_str
    const short_name = "skateboard_"+number_str_padded

    return (
      <ShopItem officialName={official_name} shortName={short_name} itemPrice={NFT_PRICES[short_name]} onClick={onShopItemClick} />
    )
  }

  return (
    <>
      <div className={styles.Area}>
        <Title order={1}>SolBoards</Title>
        <div className={styles.ShopAreaItems}>
          {generateShopItem(1)}
          {generateShopItem(2)}
          {generateShopItem(3)}
          {generateShopItem(4)}
          {generateShopItem(5)}
          {generateShopItem(6)}
          {generateShopItem(7)}
          {generateShopItem(8)}
          {generateShopItem(9)}
          {generateShopItem(10)}
        </div>
      </div>

      <OverlayNotification state={notification} />

      <Checkout itemId={checkoutItemId} opened={checkoutOpened} couponList={checkoutCouponList} onConfirm={onCheckoutConfirm} onCancel={onCheckoutCancel}/>
    </>
  )
}

