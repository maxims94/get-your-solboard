import styles from '../styles/Home.module.css'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import { Image } from '@mantine/core'

export default function AppBar({ onHeaderClick }) {

    return (
        <div className={styles.AppHeader}>
            <div className={styles.AppHeaderContainer}>
                <img src="logo.svg" alt="SolBoards" onClick={onHeaderClick} style={{cursor:"pointer"}}/>
                <div className={styles.walletButtonContainer}>
                  <WalletMultiButton/>
                </div>
            </div>
        </div>
    )
}
