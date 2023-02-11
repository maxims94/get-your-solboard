import styles from '../styles/Home.module.css'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import { Image } from '@mantine/core'

export default function AppBar({ onHeaderClick }) {

    return (
        <div className={styles.AppHeader}>
            <div className={styles.AppHeaderContainer}>
                <img src="solboards.png" alt="SolBoards" onClick={onHeaderClick} style={{cursor:"pointer"}}/>
                <WalletMultiButton />
            </div>
        </div>
    )
}
