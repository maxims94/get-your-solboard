import styles from '../styles/Home.module.css'

import { Divider, Image, Flex, Alert } from '@mantine/core';

import { useState } from 'react';
import { Modal, Button, Group, Text, Title, Radio } from '@mantine/core';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';

import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";

const NFT_PRICES = require('nft_data/nft_prices.json')

export default function ShopItem({ officialName, shortName, itemPrice }) {

  const [opened, setOpened] = useState(false);
  const [coupon, setCoupon] = useState('react');
  const [total, setTotal] = useState(0);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [couponList, setCouponList] = useState([]);

  const getCouponList = async (publicKey) => {
    console.log("get coupon list");

    const apiUrl = clusterApiUrl('devnet');
    const connection = new Connection(apiUrl);

    const keypair = Keypair.generate();

    const metaplex = new Metaplex(connection);
    metaplex.use(keypairIdentity(keypair));

    const owner = new PublicKey(publicKey)

    const allNFTs = await metaplex.nfts().findAllByOwner({owner});

    console.log(allNFTs);

    let result = []

    allNFTs.forEach(item => {
        console.log(item.name)
        if (item.name == "SolBoards Coupon (0.05 SOL)" || item.name == "SolBoards Coupon (0.1 SOL)" || item.name == "SolBoards Coupon (0.15 SOL)") {
            console.log("APPEND")
           result.push({
            'value': item.mintAddress,
            'name': item.name,
            'label': item.name
           })
        }
    })

    return result
  }

  const openTransaction = () => {

    if (!connection || !publicKey) {
      console.log("Not connected!")
      alert("Connect to a wallet (e.g. PhantomWallet) and let's go!")
      return null
    }

    getCouponList(publicKey).then(tmpCouponList => {
        setCouponList(tmpCouponList)
        
        setTotal(NFT_PRICES[shortName])

        setOpened(true)

    })
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

  const radioOptions = [<Radio value="null" label="No coupon" />]
  for (let i = 0; i < couponList.length; i++) {
    radioOptions.push(<Radio value={couponList[i]['value']} label={couponList[i]['label']}/>)
  }

  return (
    <>
    
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Checkout"
        centered
        overlayColor={'#87ffa7'}
        overlayOpacity={0}
        overlayBlur={0}
      >
        <Title order={2}>Select coupon</Title>
        <Radio.Group
          value={coupon}
          onChange={setCoupon}
          name="couponSelection"
          orientation="vertical"
        >
            {radioOptions}
          
        </Radio.Group>

        <br />
        <br />
        <Title order={2}>Total</Title>

        <Text>Your current total is {total} SOL (but may be less due to coupons)</Text>

        <br />
        <br />

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
        <Flex mih={50}
            gap="md"
            justify="flex-start"
            align="flex-start"
            direction="column"
            wrap="wrap"
            >

            <div style={{marginRight:20, marginBottom:20, borderRadius: 10, border: "1px solid #96daff",
  padding: 20}}>
                <a href="#">
                <Image onClick={openTransaction} src={"/" + shortName + ".png"} alt={officialName} width={200}/>
                </a>
                <Text>{officialName} ({itemPrice} SOL)</Text>
            </div>
        </Flex>
      </div>
    </>
  )
}
