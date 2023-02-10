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

import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
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
    
    // Handle response
    
    console.log("response:", response)

    setNotifier({is_active: false, text: null})

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

    // Get transaction
    
    const transactionLabels = response.tx.map(item => item['label'])
    console.log("Tx labels:", transactionLabels)

    const transactions = response.tx.map(item => {
      return Transaction.from(
        Buffer.from(item['data'], "base64")
      )
    })

    let sig;

    try {

      sig = await signAllTransactions(transactions, connection)

    } catch (error) {

      const msg = "Error while signing transactions: " + String(error)

      console.log(msg)

      throw Error(error)
    }
    // Single TX
    
    /*
    const tx_label = response.tx[0]['label']
    const tx_data = response.tx[0]['data']

    const tx_recovered = Transaction.from(
      Buffer.from(tx_data, "base64")
    )

    console.log(`Send tx '${tx_label}' to wallet`)

    let sig;

    try {

      sig = await sendTransaction(tx_recovered, connection)

    } catch (error) {

      const msg = "Error while sending transaction to wallet: " + String(error)

      console.log(msg)

      // TODO: failure notification
      throw Error(error)
    }
    */

    // Transaction successful
    
    console.log("Transaction signature:", sig) 

    // TODO: show pos notification
    setNotifier({is_active: false, text: null})

    // Confirm transaction
    
    console.log(`Confirm tx '${tx_label}`)
    // TODO: loading
    setNotifier({is_active: true, text: "Confirming transactions..."})
    
    try {

      const { blockhash, lastValidBlockHeight} = await connection.getLatestBlockhash()

      const result = await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: sig });

      console.log("Confirmation result: ", {result})

      setNotifier({is_active: false, text: null})

    } catch (error) {

      const msg = "Error while confirming transactions: " + String(error)

      console.log(msg)

      // TODO: failure notification
      throw Error(error)
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

