import styles from '../styles/Home.module.css'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
// TODO!
import Image from 'next/image'

export default function AppBar() {
    return (
        <div className={styles.AppHeader}>
            <div style={{padding:20}}>
                <img src="/solboards.png" />
            </div>
            <WalletMultiButton />
        </div>
    )
}
