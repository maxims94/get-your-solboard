import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState } from 'react';

import AppBar from '../components/AppBar'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import ShopArea from '../components/ShopArea'
import WalletContextProvider from '../components/WalletContextProvider'

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';

export default function HomePage() {

  const [areaId, setAreaId] = useState("store");

  const onNavItemClick = (item) => {
    console.log("Nav: go to {item}")
    setAreaId(item)
  }

  let areaElement;

  if (areaId == "store") {
    areaElement = <ShopArea />
  }

  if (areaId == "account") {
    areaElement = <p>Account</p>
  }

  if (areaId == "how-to") {
    areaElement = <p>how to</p>
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
            <AppBar onHeaderClick={() => onNavItemClick("store")}/>
            <NavBar onNavItemClick={onNavItemClick} currentArea={areaId}/>
            <div className={styles.AppBody}>
              <div className={styles.AppBodyContainer}>
                {areaElement}
              </div>
            </div>
            <Footer />
          </WalletContextProvider >
        </div>
      </ModalsProvider>
    </MantineProvider>
  );
}
