import Head from 'next/head'
import styles from '../styles/Home.module.css'

import AppBar from '../components/AppBar'
import InfoBox from '../components/InfoBox'
import ShopArea from '../components/ShopArea'
import WalletContextProvider from '../components/WalletContextProvider'

export default function HomePage() {
  return (
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
            <InfoBox />
            <ShopArea />
        </div>
      </WalletContextProvider >
    </div>
  );
}
