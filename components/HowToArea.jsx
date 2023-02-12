import styles from '../styles/Home.module.css'
import { Title } from '@mantine/core'

export default function HowToArea() {

  return (
    <div className={styles.Area}>
      <Title order={1}>How-to</Title>
      
      <div className={styles.AreaSection}>
        <Title order={2}>Desktop</Title>
        <ol>
          <li>Download <a href="https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa" target="_blank">Phantom Wallet extension</a> for Chrome</li>
          <li>Set up a new wallet</li>
          <li><b>Switch to devnet</b> (important!)</li>
          <li>Go to the 'Store' section</li>
          <li>Start purchasing SolBoards!</li>
        </ol>
      </div>

      <div className={styles.AreaSection}>
        <Title order={2}>Mobile</Title>
        <ol>
          <li>Install the <a href="https://phantom.app/" target="_blank">Phantom Wallet app</a></li>
          <li>Create a new wallet</li>
          <li><b>Switch to devnet</b> (important!)</li>
          <li>Switch to the <b>in-app browser</b> (not your regular one!)</li>
          <li>Open this website in it</li>
          <li>Start purchasing SolBoards!</li>
        </ol>
      </div>

      <div className={styles.AreaSection}>
        <Title order={2}>Remarks</Title>
        <p>Running into issues? You can also watch this <a href="loom.com" target="_blank">demo</a>.</p>
        <p><b>Please be patient.</b> Devnet can be sluggish sometimes. It usually works if you try again, though.</p>
        <p><b>Your wallet is topped up automatically.</b> You should alway have enough funds to buy more items.</p>
        <p>If you run into a "Transaction expired" error, that's most likely because you're on mainnet! In this case, please switch to devnet.</p>
      </div>
    
    </div>
  )
}

/*
    return (
        <div className={styles.InfoBox}>
          <div className={styles.InfoBoxContainer}>
            <h3>See what it does</h3>
            <p>To see some screenshots, click <a href="TODO">here</a>.</p>
          </div>
          <div className={styles.InfoBoxContainer}>
            <h3>Test it yourself</h3>
            <ol>
                <li>Download a wallet, like PhantomWallet</li>
                <li>Switch to devnet</li>
                <li>Get some SOL using a faucet, such as <a href="https://solfaucet.com/">this one</a></li>
                <li>Connect the wallet to this app</li>
                <li>Start buying!</li>
                <li>You will notice that, with every purchase, you also get an NFT of the item you've purchased.</li>
                <li>Also, for purchases &gt;= 0.5 SOL, you also get a coupon NFT! It can be redeemed at the next buy to get a discount.</li>
            </ol>
          </div>
          <div className={styles.InfoBoxContainer}>
            <h3>Why did I make this?</h3>
            <ol>
                <li>This is my contribution to the <a href="https://www.encode.club/encode-solana-hackathon">Encode x Solana hackathon</a></li>
                <li>To learn how to use Solana</li>
                <li>To push the idea behind Solana Pay to its limits</li>
                <li>For fun!</li>
            </ol>
          </div>
        </div>
    )
  */
