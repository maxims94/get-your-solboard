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
          <li>Set up a new wallet</li>
          <li><b>Switch to devnet</b> (important!)</li>
          <li>Switch to the <b>in-app browser</b> (not your regular one!)</li>
          <li>Open this website in it</li>
          <li>Start purchasing SolBoards!</li>
        </ol>
      </div>

      <div className={styles.AreaSection}>
        <Title order={2}>Remarks</Title>
        <p>Running into issues? You can also watch this <a href="https://www.loom.com/share/cdb80824582f4b66a18303f88e1c0f4a" target="_blank">demo</a>.</p>
        <p><b>Please be patient.</b> Devnet can be sluggish sometimes. It usually works if you try again, though.</p>
        <p><b>Your wallet is topped up automatically.</b> You should alway have enough funds to buy more items.</p>
        <p>If you run into a "Transaction expired" error, that's most likely because you're on mainnet! In this case, please switch to devnet.</p>
      </div>
    
    </div>
  )
}
