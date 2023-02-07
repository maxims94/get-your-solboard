import styles from '../styles/Home.module.css'

import { Image } from '@mantine/core';

import { useState } from 'react';

const NFT_PRICES = require('nft_data/nft_prices.json')

export default function ShopItem({ officialName, shortName, itemPrice, onClick }) {

  return (
    <div className={styles.ShopItem}>
      <div className={styles.ShopItemInner}>
        <Image onClick={() => onClick(shortName)} src={"/" + shortName + ".png"} alt={officialName} width={200} height={200} fit="contain" />
        <div className={styles.ShopItemDesc}>
          <div className={styles.ShopItemName}>{officialName}</div>
          <div className={styles.ShopItemPrice}>
            {itemPrice}
            <Image src={"/solana-sol-logo.svg"} alt={officialName} width={18} height={18} fit="contain" />
          </div>
        </div>
      </div>
    </div>
  )
}
