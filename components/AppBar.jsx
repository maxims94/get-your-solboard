import styles from '../styles/Home.module.css'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import { Image } from '@mantine/core'

export default function AppBar({ onHeaderClick }) {

    return (
        <div className={styles.AppHeader}>
            <div className={styles.AppHeaderContainer}>
                <Image src="logo.svg" width={525} alt="SolBoards" onClick={onHeaderClick} style={{cursor:"pointer"}}/>
                <WalletMultiButton />
            </div>
        </div>
    )
}
