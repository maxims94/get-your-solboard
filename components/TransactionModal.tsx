import styles from '../styles/Home.module.css'

import { useState } from 'react';
import { Modal, Button, Group, Text, Title, Radio } from '@mantine/core';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';

export default function TransactionModal() {
  const [opened, setOpened] = useState(false);
  const [value, setValue] = useState('react');
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const openTransaction = () => {

    if (!connection || !publicKey) {
      console.log("Not connected!")
      return null
    }

    setOpened(true)
  }

  const performTransaction = async () => {
    console.log("Perform Transaction")

    // TODO: Change state to "waiting for tx"

    const req_body = {
      account: 'HDqxxSCNY5goEtFxMJqN7wkXKNMDfxAFiSXhQ1wcg2pV',
      product: "skateboard_01",
      coupon:"null"
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

  return (
    <>
    
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title=""
        centered
        overlayColor={'#87ffa7'}
        overlayOpacity={0}
        overlayBlur={0}
      >
        <Title order={1}>Select coupon</Title>

        <Radio.Group
          value={value}
          onChange={setValue}
          name="favoriteFramework"
          orientation="vertical"
          label=""
        >
          <Radio value="null" label="No coupon" />
          <Radio value="accountkey1" label="Coupon 1" />
          <Radio value="accountkey2" label="Coupon 2" />
          <Radio value="accountkey3" label="Coupon 3" />
        </Radio.Group>


        <Title order={1}>Total</Title>
        <Text>With coupon: $10 - $2.5 = $7.5 in total </Text>
        <Text>Without coupon: $10 in total, but you get a coupon for $2 off the next time you buy</Text>

        <Group>
          <Button variant="outline" onClick={() => setOpened(false)}>
            Cancel
          </Button>
          <Button variant="filled" onClick={performTransaction}>
            Pay
          </Button>
        </Group>
      </Modal>
    
      <div className={styles.ShopItem}>
        <a href="#" onClick={openTransaction}>TestItem</a>
      </div>
    </>
  )
}
