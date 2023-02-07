import styles from '../styles/Home.module.css'

import { useState } from 'react';
import { Modal, Button, Group, Text, Title, Radio } from '@mantine/core';

import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';

const NFT_PRICES = require('nft_data/nft_prices.json')
const NFT_NAMES = require('nft_data/nft_names.json')

export default function Checkout({ itemId, couponList, setNotifier, onSuccess, onFailure, onCancel }) {
    
  // The currently selected coupon as index in couponList
  // -1 = no coupon
  const [coupon, setCoupon] = useState('-1');

  const [getCouponMessage, setGetCouponMessage] = useState('');
  const [totalMessage, setTotalMessage] = useState('');

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();


  const performTransaction = async () => {
    console.log("Perform Transaction")

    // TODO: Change state to "waiting for tx"
    // let mintAddress = couponList[i]['mintAddress']; 

    const req_body = {
      account: 'HDqxxSCNY5goEtFxMJqN7wkXKNMDfxAFiSXhQ1wcg2pV',
      product: "skateboard_01",
      coupon: "null"
    }

    const res = await fetch('/api/request_transaction', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req_body)
    })

    const data = await res.json()

    console.log(data)

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

  }

  if (itemId == null) {
    return null
  }

  // Display checkout

  if (!connection || !publicKey) {
    console.log("Error: Not connected!")
    return null
  }

  const onCouponChange = (newCoupon) => {
    setCoupon(newCoupon)

    if (itemId == null) {
      throw 'No item'
    }

    const productPrice = NFT_PRICES[itemId]

    let couponDiscount = null
    if (newCoupon != '-1') {
      couponDiscount = couponList[newCoupon]['discount']
    }

    let getNewCouponDiscount = null
    if (newCoupon == '-1') {
      getNewCouponDiscount = 0
      if (productPrice >= 0.5) {
          getNewCouponDiscount = 0.05
      }
      if (productPrice >= 0.6) {
          getNewCouponDiscount = 0.1
      }
      if (productPrice > 0.7) {
          getNewCouponDiscount = 0.1
      }
    }

    setTotalMessage(null)
    setGetCouponMessage(null)

    if (couponDiscount == null) {
      setTotalMessage(<p>Total sum: <b>{productPrice} SOL</b>.</p>)
    } else {
      setTotalMessage(<p>Total sum: <b>{productPrice - couponDiscount} SOL</b> ({productPrice} SOL - {couponDiscount} SOL)</p>)
    }

    if (getNewCouponDiscount != null)
    {
      if (getNewCouponDiscount != 0) {
        setGetCouponMessage(<p>As a thank you, you get a coupon worth <b>{getNewCouponDiscount} SOL</b>!</p>)
      } else {
        setGetCouponMessage(<p>Unfortunately, you don't get a coupon with this purchase.</p>)
      }
    }
  }

  if (totalMessage == '') {
    onCouponChange(coupon)
  }

  return (

      <Modal
        opened={true}
        onClose={onCancel}
        title="Checkout"
        centered
        overlayColor={"black"}
        overlayOpacity={0.2}
        overlayBlur={0}
        shadow="0px 0px 1px 1px #228BE6"
      >

        <div className={styles.checkoutSection}>
          <Title order={2}>Coupon NFTs</Title>
          <p>View in Solana Explorer:</p>
          {
            couponList.map(function(item){

              let mintAddress = item['mintAddress']; 
              let name = item['name']; 

              return <p><a href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`} target="_blank">{name}</a></p>
            })
          }
        </div>

        <div className={styles.checkoutSection}>
          <Title order={2}>Select coupon</Title>

          <Radio.Group
            value={coupon}
            onChange={onCouponChange}
            name="couponSelection"
            orientation="vertical"
          >
            <Radio size="md" key="-1" value="-1" label="No coupon" />

            {
              couponList.map(function(item, i) {
                return <Radio size="md" key={String(i)} value={String(i)} label={`${item.name}`}/>
              })
            }

          </Radio.Group>
        </div>

        <div className={styles.checkoutSection}>

          <Title order={2}>Total</Title>

          <p>Selected item: <b>{NFT_NAMES[itemId]}</b></p>
          {totalMessage}
          {getCouponMessage}
        </div>

        <Group position="right">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="filled" color="dark" onClick={performTransaction}>Pay</Button>
        </Group>
      </Modal>
  )
}
