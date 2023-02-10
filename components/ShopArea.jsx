import styles from '../styles/Home.module.css'

import ShopItem from '../components/ShopItem'
import LoadingNotification from '../components/LoadingNotification'
import AlertNotification from '../components/AlertNotification'
import Checkout from '../components/Checkout'

const NFT_PRICES = require('nft_data/nft_prices.json')

import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons';

import { useState } from 'react';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { Transaction } from '@solana/web3.js';

import { Connection, clusterApiUrl, Keypair, PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

const SHOP_PUBLIC_KEY = 'MD5FAwmMTQ5h5X4wcgkGFagCHrZ7JpVdDehE94db5rw'

export default function ShopArea() {

  const [checkoutCouponList, setCheckoutCouponList] = useState([]);
  const [checkoutItemId, setCheckoutItemId] = useState(null);
  const [notifier, setNotifier] = useState({is_active: false, text: null});
  const [alertState, setAlertState] = useState({text: null, is_error: true});
  //const [alertState, setAlertState] = useState({text: 'This is an error!', is_error: true});

  const [checkoutOpened, setCheckoutOpened] = useState(false);

  // Waiting to retrieve coupons, waiting to get a response from the server etc.
  // To prevent the user from calling twice
  const [isWaiting, setIsWaiting] = useState(false);

  const { connection } = useConnection();
  const { publicKey, sendTransaction, signAllTransactions } = useWallet();

  const getCouponList = async (publicKey) => {
    console.log("get coupon list");

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

  const onShopItemClick = (itemId) => {

    if (!connection || !publicKey) {
      console.log("Not connected!")
      alert("Connect a wallet and let's go!")
      return null
    }

    // TODO: If a transaction is being requested, disallow
    // if(isWaiting) { interrupt }

    setNotifier({is_active: true, text: 'Checking for coupons...'})

    getCouponList(publicKey).then(result => {
      setCheckoutCouponList(result)

      setNotifier({is_active: false, text: null})

      setCheckoutItemId(itemId)
      setCheckoutOpened(true)
    })
  }

  // User closed the checkout window without sending a transaction
  const onCheckoutCancel = (event) => {
    console.log("Checkout cancelled")
    setCheckoutItemId(null)
    setCheckoutOpened(false)
  }
  
  // User confirmed the checkout
  const onCheckoutConfirm = (selectedOption) => {
    console.log("Checkout confirmed with option:", selectedOption)

    const selectedItemId = checkoutItemId

    setCheckoutItemId(null)
    setCheckoutOpened(false)
    
    // TODO: Change state to "waiting for tx"
    // setIsWaiting(true)

    performCheckout(selectedItemId, selectedOption).then(
      () => {
        console.log("Checkout successful!")
      },
      error => {
        console.log("Checkout failed:", String(error))
      }
    ).finally(() => {
      //setIsWaiting(false)
    })
  }

  const performCheckout = async (selectedItemId, selectedOption) => {
    
    console.log("Request transaction from server")
    setNotifier({is_active: true, text: 'Request transaction from server...'})

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

    setNotifier({is_active: false, text: null})
    
    // Handle response
    
    console.log("response:", response)

    if (!('status' in response) || response.status != 'success') {
      // TODO Failure notification
      throw Error("Request failed")
    }

    if (!('tx' in response)) {
      throw Error("Invalid server response")
    }

    if (response.tx.length == 0) {
      console.log("No transactions")
      return
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

      if (item['label'] == 'mint_nft_for_sol' || item['label'] == 'redeem_coupon') {
        transactionsToSign.push(item['transaction'])  
        transactionsToSignIndices.push(i)  
      }
    }

    console.log("To sign:", transactionsToSign, transactionsToSignIndices)

    const signedTx = await signAllTransactions(transactionsToSign, connection)

    console.log("Signed:", signedTx)

    for(let j of transactionsToSignIndices) {
      labeledTransactions[j]['transaction'] = signedTx[j]
    }

    console.log("Labeled transactions (signed):", labeledTransactions)
    
    // Send transactions

    console.log("Send transactions")

    for(let item of labeledTransactions) {
      console.log("Current transaction:", item.label)

      let rawTransaction = item.transaction.serialize()
      let signature = await connection.sendRawTransaction(rawTransaction)

      console.log(signature)

      item['signature'] = signature
    }

    // Confirm transactions
    
    console.log("Confirm transactions")

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
      <div className={styles.ShopArea}>
        <div className={styles.ShopAreaContainer}>
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

      <LoadingNotification state={notifier} />
      <AlertNotification  state={alertState} />
      <Checkout itemId={checkoutItemId} opened={checkoutOpened} couponList={checkoutCouponList} onConfirm={onCheckoutConfirm} onCancel={onCheckoutCancel}/>
    </>
  )
}

