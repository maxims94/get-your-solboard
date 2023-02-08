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
  const { publicKey, sendTransaction } = useWallet();

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

    let couponVar;

    if (selectedOption == "-1") {
      couponVar = "null"
    } else {
      couponVar = checkoutCouponList[Number(selectedOption)]['mintAddress']
    }

    const accountVar = publicKey.toBase58()
    const productVar = checkoutItemId

    //console.log(accountVar, productVar, couponVar)

    setCheckoutItemId(null)
    setCheckoutOpened(false)

    setNotifier({is_active: true, text: 'Request transaction from server...'})
    
    // TODO: Change state to "waiting for tx"
    // setIsWaiting(true)

    // TODO: timeout
    requestTransactionFromServer(accountVar, productVar, couponVar).then((res) => {
      console.log("request tx done")
      console.log("response: ", res)
      setNotifier({is_active: false, text: null})

      if (!('status' in res) || !('tx' in res)) {
        console.log("Invalid response from server")
        // setIsWaiting(false)
        // setNotification(failed)
        return
      }

      if (res.status == 'success') {

        if (res.tx.length == 0) {
          console.log("No transactions")
          return
        }

        // Send transactions to the wallet

        setNotifier({is_active: true, text: 'Sending transaction(s) to wallet...'})

        // Single TX for testing
        
        const tx_label = res.tx[0]['label']
        const tx_data = res.tx[0]['data']

        const tx_recovered = Transaction.from(
          Buffer.from(tx_data, "base64")
        )

        console.log(`Send tx '${tx_label}' to wallet`)

        sendTransaction(tx_recovered, connection).then((sig) =>{
          console.log("tx signature:", sig) 

          console.log("tx signature:", sig) 

          // Confirmation
          // const latestBlockhash = await connection.getLatestBlockhash()
          // await connection.confirmTransaction({ blockhash, lastValidBlockHeight, sig });

          // TODO: show pos notification
          setNotifier({is_active: false, text: null})
        })

        //prom = res.tx.map(function(tx_base64) {

        //  const tx_recovered = Transaction.from(
        //    Buffer.from(tx_base64, "base64")
        //  )

        //  console.log("Send tx to wallet")

        //  return sendTransaction(tx_recovered, connection)
        //})

        setNotifier({is_active: true, text: 'Waiting for approval...'})

        // TODO
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
      }
      
      if (res.status != 'success') {
        console.log("request tx failed!")
        // TODO: reset 
        // setIsWaiting(false)
        // setNotifire(failed)
      }
    })
  }

  const requestTransactionFromServer = async (accountVar, productVar, couponVar) => {
    console.log("Request Transaction")

    const req_body = {
      account: accountVar,
      product: productVar,
      coupon: couponVar
    }

    console.log("request body:", req_body)

    const res = await fetch('/api/request_transaction', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req_body)
    })

    const data = await res.json()
    
    return data
    
    // TODO: check status
    /*

    const tx_base64 = data.transaction

    const recoveredTransaction = Transaction.from(
      Buffer.from(tx_base64, "base64")
    )

    console.log("Send to wallet")

    sendTransaction(recoveredTransaction, connection)

    if ('coupon_transaction' in data) {
      console.log("Coupon tx found")

      const coupon_tx_base64 = data.coupon_transaction

      const recoveredCouponTransaction = Transaction.from(
        Buffer.from(coupon_tx_base64, "base64")
      )

      console.log("Send coupon tx to wallet")

      sendTransaction(recoveredCouponTransaction, connection)
    }
    */

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

