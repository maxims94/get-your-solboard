import Head from 'next/head'
import styles from '../styles/Home.module.css'

import AppBar from '../components/AppBar'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import ShopArea from '../components/ShopArea'
import WalletContextProvider from '../components/WalletContextProvider'

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';

export default function HomePage() {

  const onNavItemClick = (item) => {
    console.log(item) 
  }

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
            <NavBar onNavItemClick={onNavItemClick} />
            <div className={styles.AppBody}>
              <div className={styles.AppBodyContainer}>
                <ShopArea />
              </div>
            </div>
            <Footer />
          </WalletContextProvider >
        </div>
      </ModalsProvider>
    </MantineProvider>
  );
}
