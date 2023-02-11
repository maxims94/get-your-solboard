import styles from '../styles/Home.module.css'
import { Title } from '@mantine/core'

export default function HowToArea({ ts }) {

  return (
    <div className={styles.Area}>
      <Title order={1}>How-to</Title>
      <ol>
        <li>Download Phantom Wallet for Chrome or as App</li>
        <li>Create a new wallet</li>
        <li>Switch to devnet</li>
        <li>Go to the Store</li>
        <li>Start purchasing SolBoards</li>
      </ol>
    </div>
  )
}

