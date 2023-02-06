import styles from '../styles/Home.module.css'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
// TODO!
import Image from 'next/image'

export default function AppBar() {
    return (
        <div className={styles.AppHeader}>
            <div className={styles.AppHeaderContainer}>
                <img src="/solboards.png" />
                <WalletMultiButton />
            </div>
        </div>
    )
}
