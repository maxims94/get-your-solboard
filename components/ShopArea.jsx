import styles from '../styles/Home.module.css'

import ShopItem from '../components/ShopItem'
import LoadingNotification from '../components/LoadingNotification'

const NFT_PRICES = require('nft_data/nft_prices.json')

import { useState } from 'react';

export default function ShopArea() {
    
    const [notifier, setNotifier] = useState({is_active: false, text: null});

    const generateShopItem = (number) => {
      const number_str = String(number)
      const official_name = "SolBoard #" + number_str

      const number_str_padded = number_str.length == 1 ?  "0" + number_str : number_str
      const short_name = "skateboard_"+number_str_padded

      return (
        <ShopItem officialName={official_name} shortName={short_name} itemPrice={NFT_PRICES[short_name]} setNotifier={setNotifier}/>
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
      </>
    )
}
