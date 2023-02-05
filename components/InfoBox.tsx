import styles from '../styles/Home.module.css'

export default function InfoBox() {
    return (
        <div className={styles.InfoBox}>
            <span className={styles.title}>How it works</span>
            <ol>
                <li>Download a wallet, like PhantomWallet</li>
                <li>Switch to devnet</li>
                <li>Get some SOL using a faucet, such as <a href="https://solfaucet.com/">this one</a></li>
                <li>Connect the wallet to this app</li>
                <li>Start buying!</li>
                <li>You will notice that, with every purchase, you also get an NFT of the item you've purchased.</li>
                <li>Also, for purchases &gt;= 0.5 SOL, you also get a coupon NFT! It can be redeemed at the next buy to get a discount.</li>
            </ol>
            <br />
            <br />
            <span className={styles.title}>Why did I make this?</span>
            <ol>
                <li>To learn practical skills with Solana</li>
                <li>To try to push the idea behind Solana Pay to its limits</li>
                <li>For fun!</li>
            </ol>
            <br />
            <br />
            <p>
                <a href="https://github.com/maxims94/get-your-solboard">GitHub</a> <a href="mailto:maxim.schmidt@tum.de">Email</a> <a href="https://twitter.com/maximschmidt94">Twitter</a>
            </p>
        </div>
    )
}
