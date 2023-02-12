import styles from '../styles/Home.module.css'

import { Image } from '@mantine/core';

import { useState } from 'react';

export default function AccountItem({ name, mintAddress, shortName }) {

  const openExplorer = () => {
    window.open(`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`, "_blank")
  }

  const getName = () => {
    if (!(name.startsWith("SolBoards Coupon"))) {
      return name
    } else {
      return name.slice(10,name.length)
    }
  }

  return (
    <div onClick={openExplorer} className={styles.AccountItem}>
      <div className={styles.AccountItemInner}>
        <Image src={"/" + shortName + ".png"} alt={name} width={200} height={200} fit="contain" />
        <div className={styles.AccountItemDesc}>
          <div className={styles.AccountItemName}>{getName()}</div>
          <div className={styles.AccountItemAddress}>
            {`[${mintAddress.slice(0,5)}]`}
          </div>
        </div>
      </div>
    </div>
  )
}
