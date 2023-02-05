import styles from '../styles/Home.module.css'

import { useState } from 'react';
import { Modal, Button, Group, Text, Title, Radio } from '@mantine/core';

export default function TransactionModal() {
  const [opened, setOpened] = useState(false);
  const [value, setValue] = useState('react');

  const openTransaction = event => {
    event.preventDefault()
    setOpened(true)
  }

  const performTransaction = async (event) => {
    event.preventDefault()
    console.log("Perform Transaction")

    const res = await fetch(`/api/request_transaction`)
    const data = await res.json()
    console.log(data)
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
  );
}
