import styles from '../styles/Home.module.css'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import { Image } from '@mantine/core'

export default function AppBar() {
    return (
        <div className={styles.AppHeader}>
            <div className={styles.AppHeaderContainer}>
                <img src="solboards.png" alt="SolBoards" />
                <WalletMultiButton />
            </div>
        </div>
    )
}
