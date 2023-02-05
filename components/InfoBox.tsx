import styles from '../styles/Home.module.css'

export default function InfoBox() {
    return (
        <div className={styles.InfoBox}>
            <span className={styles.title}>How it works</span>
            <ol>
                <li>Get a wallet</li>
                <li>Switch to devnet</li>
                <li>Get some SOL</li>
                <li>Connect the wallet</li>
                <li>Start buying</li>
            </ol>
        </div>
    )
}
