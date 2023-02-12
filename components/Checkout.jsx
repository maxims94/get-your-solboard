import styles from '../styles/Home.module.css'

import { useState } from 'react';
import { Modal, Button, Group, Text, Title, Radio, Image } from '@mantine/core';

import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";

const NFT_PRICES = require('nft_data/nft_prices.json')
const NFT_NAMES = require('nft_data/nft_names.json')

export default function Checkout({ itemId, opened, couponList, onConfirm, onCancel }) {
    
  // The currently selected coupon as index in couponList
  // -1 = no coupon
  const [coupon, setCoupon] = useState('-1');

  const [couponMessage, setCouponMessage] = useState();
  const [totalMessage, setTotalMessage] = useState();

  const [prevItemId, setPrevItemId] = useState()

  if (itemId == null) {
    return null
  }

  // Display checkout

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
    setCouponMessage(null)

    if (couponDiscount == null) {
      setTotalMessage(<p>Total sum: <b>{productPrice} SOL</b></p>)
    } else {
      setTotalMessage(<p>Total sum: <b>{(productPrice - couponDiscount).toFixed(2)} SOL</b> ({productPrice} SOL - {couponDiscount} SOL)</p>)
    }

    if (newCoupon == '-1')
    {
      if (getNewCouponDiscount != 0) {
        setCouponMessage(<p>As a thank you, you'll get a coupon worth <b>{getNewCouponDiscount} SOL</b>!</p>)
      } else {
        setCouponMessage(<p>Unfortunately, you don't get a coupon with this purchase.</p>)
      }
    } else {
      const explorer_link = `https://explorer.solana.com/address/${couponList[newCoupon]['mintAddress']}?cluster=devnet`

      setCouponMessage(
        <p>With this purchase, you will redeem this coupon. Its NFT will be burnt.</p>
        //<p>With this purchase, you will redeem <a href={explorer_link} target="_blank" className={styles.checkoutNormalLink}>this</a> coupon. The NFT will be burnt.</p>
      )
    }
  }

  // This means that the state won't be reset if you select the same item
  if (itemId != prevItemId) {
    setPrevItemId(itemId)
    onCouponChange('-1')
  }

  /*
  if (totalMessage === undefined) {
    onCouponChange(coupon)
  }
  */

  return (

      <Modal
        opened={opened}
        onClose={onCancel}

        title={<Title order={2}>Checkout</Title>}
        centered
        overlayColor={"black"}
        overlayOpacity={0.2}
        overlayBlur={0}
        shadow="0px 0px 1px 1px #228BE6"
      >

        <div className={styles.checkoutSection}>
          <Title order={3}>Select coupon</Title>
          <Radio.Group
            value={coupon}
            onChange={onCouponChange}
            name="couponSelection"
            orientation="vertical"
          >
            <Radio size="md" key="-1" value="-1" label="No coupon"/>
            
            {
              couponList.map(function(item, i) {

                const explorer_link = `https://explorer.solana.com/address/${item['mintAddress']}?cluster=devnet`

                return [
                  <Radio
                    size="md"
                    key={item['mintAddress']}
                    value={String(i)}
                    label={`${item.name}`}
                    description={
                      <a
                        href={explorer_link}
                        target="_blank"
                        className={styles.checkoutSelectCouponExplorerLink}
                      >
                      Address: {item.mintAddress.slice(0,10)}
                      </a>
                    }
                  />
                ]
              })
            }

          </Radio.Group>
        </div>

        <div className={styles.checkoutSection}>

          <Title order={3}>Summary</Title>

          <p>Selected item: <b>{NFT_NAMES[itemId]}</b></p>
          {totalMessage}
          {couponMessage}
        </div>

        <Group position="right">
          <Button variant="default" onClick={onCancel} sx={{ "&:active": {transform: "none"} }}>
            Cancel
          </Button>
          <Button
            variant="filled"
           // color="dark"
            onClick={() => onConfirm(coupon)}

            sx={{ 
              "&:active": {transform: "none"},
              "background-color": "#101010",
              "&:hover": {"background-color": "black"},
            }}
           >
              <Image src="solana-pay-logo-white.svg" alt="Pay" height={20} />
           </Button>
        </Group>
      </Modal>
  )
}
