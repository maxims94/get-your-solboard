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

import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

const SHOP_PUBLIC_KEY = 'MD5FAwmMTQ5h5X4wcgkGFagCHrZ7JpVdDehE94db5rw'

export default function ShopArea() {

  const [checkoutCouponList, setCheckoutCouponList] = useState([]);
  const [checkoutItemId, setCheckoutItemId] = useState(null);
  const [notifier, setNotifier] = useState({is_active: false, text: null});
  const [alertState, setAlertState] = useState({is_active: false, text: null});

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const getCouponList = async (publicKey) => {
    console.log("get coupon list");

    const apiUrl = clusterApiUrl('devnet');
    const connection = new Connection(apiUrl);

    const keypair = Keypair.generate();

    const metaplex = new Metaplex(connection);
    metaplex.use(keypairIdentity(keypair));

    const owner = new PublicKey(publicKey)

    const allNFTs = await metaplex.nfts().findAllByOwner({ owner });

    console.log(allNFTs);

    let result = []

    for(let i = 0; i < allNFTs.length; i++) {

      let item = allNFTs[i]

      console.log(item.name)

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

    console.log(result)

    return result
  }

  const onShopItemClick = (itemId) => {

    if (!connection || !publicKey) {
      console.log("Not connected!")
      alert("Connect to a wallet and let's go!")
      return null
    }

    setNotifier({is_active: true, text: 'Checking for coupons...'})

    getCouponList(publicKey).then(result => {
      setCheckoutCouponList(result)

      setNotifier({is_active: false, text: ''})

      setCheckoutItemId(itemId)
    })
  }

  const onCancel = () => {
    setCheckoutItemId(null)
  }
  
  const onSuccess = () => {
    // alertstate
    setCheckoutItemId(null)
  }

  const onFailure = () => {
    setCheckoutItemId(null)
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
      <AlertNotification state={alertState} />
      <Checkout itemId={checkoutItemId} couponList={checkoutCouponList} onSuccess={onSuccess} onFailure={onFailure} onCancel={onCancel}/>
    </>
  )
}

