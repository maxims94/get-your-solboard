import Head from 'next/head'
import styles from '../styles/Home.module.css'

import AppBar from '../components/AppBar'
import InfoBox from '../components/InfoBox'
import ShopArea from '../components/ShopArea'
import WalletContextProvider from '../components/WalletContextProvider'

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';

export default function HomePage() {
  return (
    <MantineProvider>
      <ModalsProvider>
        <div className={styles.App}>
          <Head>
            <title>Get your SolBoard!</title>
            <meta
              name="description"
              content="Get your SolBoard!"
            />
          </Head>
          <WalletContextProvider>
            <AppBar />
            <div className={styles.AppBody}>
              <div className={styles.AppBodyContainer}>
                <InfoBox />
                <ShopArea />
              </div>
            </div>
          </WalletContextProvider >
        </div>
      </ModalsProvider>
    </MantineProvider>
  );
}
