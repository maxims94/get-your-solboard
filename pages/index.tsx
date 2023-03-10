import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState } from 'react';

import AppBar from '../components/AppBar'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import ShopArea from '../components/ShopArea'
import AccountArea from '../components/AccountArea'
import HowToArea from '../components/HowToArea'
import AboutArea from '../components/AboutArea'
import WalletContextProvider from '../components/WalletContextProvider'

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';

const DEMO_URL="https://www.loom.com/share/cdb80824582f4b66a18303f88e1c0f4a"

export default function HomePage() {

  const [areaId, setAreaId] = useState("store");
  const [ts, setTs] = useState(0)

  const onNavItemClick = (item: string) => {
    console.log(`Nav: go to ${item}`)

    if (item == 'screenshots') {
      window.open("https://google.com", "_blank")
    } else if (item == 'demo-video') {
      window.open(DEMO_URL, "_blank")
    } else {
      setAreaId(item)
      setTs(Date.now())
    }
  }

  let areaElement;

  if (areaId == "store") {
    areaElement = <ShopArea />
  }

  if (areaId == "account") {
    areaElement = <AccountArea ts={Date.now()}/>
  }

  if (areaId == "how-to") {
    areaElement = <HowToArea />
  }

  if (areaId == "about") {
    areaElement = <AboutArea />
  }

  return (
    <MantineProvider>
      <ModalsProvider>
        <div className={styles.App}>
          <Head>
            <title>Get Your SolBoard!</title>
            <meta
              name="description"
              content="Get Your SolBoard!"
            />
          </Head>
          <WalletContextProvider>
            <div>
              <AppBar onHeaderClick={() => onNavItemClick("store")}/>
              <NavBar onNavItemClick={onNavItemClick} currentArea={areaId}/>
              <div className={styles.AppBody}>
                <div className={styles.AppBodyContainer}>
                  {areaElement}
                </div>
              </div>
            </div>
            <Footer />
          </WalletContextProvider >
        </div>
      </ModalsProvider>
    </MantineProvider>
  );
}
