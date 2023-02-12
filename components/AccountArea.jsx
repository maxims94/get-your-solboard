import styles from '../styles/Home.module.css'
import { Title } from '@mantine/core'

import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { useState } from 'react';

import { Metaplex } from "@metaplex-foundation/js"

import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import AccountItem from '../components/AccountItem'

const SHOP_PUBLIC_KEY = 'MD5FAwmMTQ5h5X4wcgkGFagCHrZ7JpVdDehE94db5rw'

const NFT_URLS = require('../nft_data/nft_urls.json')

export default function AccountArea({ ts }) {

  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [userBalance, setUserBalance] = useState();
  const [userItems, setUserItems] = useState();
  const [lastTs, setLastTs] = useState();

  if (!connection || !publicKey) {
    return (
      <div className={styles.Area}>
      <Title order={1}>Account</Title>
      <p>No wallet connected.</p>
      </div>
    )
  }

  const refreshUserBalance = async () => {
    console.log("refresh user balance")
    setUserBalance(undefined)

    try {
      setUserBalance(await connection.getBalance(publicKey))
    } catch(error) {
      console.log("refresh user balance failed:", String(error))
      setUserBalance(-1)
    }
  }

  const refreshUserItems = async () => {
    console.log("refresh user items")
    setUserItems(undefined)
    try {

      const metaplex = Metaplex.make(connection)
      const ownedNfts = await metaplex.nfts().findAllByOwner({ owner: publicKey })

      console.log(ownedNfts)

      let couponNft;
      let couponAmount;
      let couponName;

      const result = []

      for (const item of ownedNfts) {

        if (item.model != 'metadata') {
          console.log("Unsupported model:", item.model)
          continue
        }

        if (item.updateAuthorityAddress.toString() != SHOP_PUBLIC_KEY) {
          console.log("Not our NFT")
          continue
        }

        const uri = item.uri

        let shortName;

        for (const key in NFT_URLS) {
          if (NFT_URLS[key] == uri) {
            if (key.startsWith("skateboard")) {
              shortName = key.slice(0,13)
              break
            } else if (key.startsWith("coupon")) {
              shortName = "coupon"
              break
            }
          }
        }
        
        if (shortName === undefined) {
          console.log("ERROR:", `Couldn't find the short name of uri ${uri}`)
        }

        result.push({
          'mintAddress': item.mintAddress.toString(),
          'name': item.name,
          'shortName': shortName
        })
      }

      console.log(result)
      setUserItems(result)

    } catch(error) {
      console.log("refresh user items failed:", String(error))
      setUserItems(-1)
    }
  }

  if (ts != lastTs) {
    refreshUserBalance()
    refreshUserItems()
    setLastTs(ts)
  }

  const generateUserBalance = () => {
    if (userBalance === undefined) {
      return "loading..."
    }

    if (userBalance === -1) {
      return "failed"
    }

    return String(userBalance / LAMPORTS_PER_SOL) + " SOL"
  }

  const generateUserItems = () => {
    if (userItems === undefined) {
      return "loading..."
    }

    if (userBalance === -1) {
      return "failed"
    }

    const result = []

    if (!userItems.length) {
      return <p>No items found.</p>
    }

    for (const item of userItems) {
      result.push(
        <AccountItem key={item.mintAddress} name={item.name} mintAddress={item.mintAddress} shortName={item.shortName} />
      )
    }
    return result
  }


  return (
    <div className={styles.Area}>
    <Title order={1}>Account</Title>
    <Title order={2}>Your balance: {generateUserBalance()}</Title>

    <Title order={2}>Your items:</Title>
    {
      userItems === undefined ? <p>loading...</p> :
      userItems === -1 ? <p>failed</p> :
        <div className={styles.AccountAreaItems}>
        {generateUserItems()}
        </div>
    }
    </div>
  )
}

