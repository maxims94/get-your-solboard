import styles from '../styles/Home.module.css'
import { Title } from '@mantine/core'

import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { useState } from 'react';

import { Metaplex } from "@metaplex-foundation/js"

import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const SHOP_PUBLIC_KEY = 'MD5FAwmMTQ5h5X4wcgkGFagCHrZ7JpVdDehE94db5rw'

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

    }
  }

  const refreshUserItems = async () => {
    console.log("refresh user items")
    setUserItems(undefined)
    try {

      const metaplex = Metaplex.make(connection)
      const ownedNfts = await metaplex.nfts().findAllByOwner({ owner: publicKey })

      let couponNft;
      let couponAmount;
      let couponName;

      const result = []

      for (let item of ownedNfts) {

        console.log(item)
        console.log(String(item))

        
        if (item['model'] == 'nft') {

          if (item.updateAuthorityAddress.toString() != SHOP_PUBLIC_KEY) {
            console.log("Not this shop's NFT")
            continue
          }

          result.push({
            'mintAddress': item.address.toString(),
            'name': item.name,
          })

        } else if (item['model'] == 'metadata') {

          if (item.updateAuthorityAddress.toString() != SHOP_PUBLIC_KEY) {
            console.log("Not this shop's NFT")
            continue
          }

          result.push({
            'mintAddress': item.address.toString(),
            'name': item.name,
          })
        
        } else {
          console.log("Unknown model:", item['model'])
        }
      }
      
      console.log(result)
      setUserItems(result)

    } catch(error) {
      console.log("refresh user items failed:", String(error))

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

    for (const item of userItems) {
      console.log(item.mintAddress)
      result.push(
        <p key={item.mintAddress}>{item.name}, {item.mintAddress}</p>
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
        generateUserItems()
      }
    </div>
  )
}

