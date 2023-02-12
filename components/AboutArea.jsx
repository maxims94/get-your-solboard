import styles from '../styles/Home.module.css'
import { Title } from '@mantine/core'

export default function AboutArea() {

  return (
    <div className={styles.Area}>
      <Title order={1}>About</Title>

      <div className={styles.AreaSection}>
        <Title order={2}>What is this?</Title>
        <p>An online shop for skateboards that runs on Solana and has a built-in loyalty programme.</p>
        <p>This is my contribution to the Encode x Solana <a href="https://www.encode.club/encode-solana-hackathon">hackathon</a>.</p>
        <p>For more details, see this project's <a href="https://github.com/maxims94/get-your-solboard">GitHub</a> page.</p>
      </div>

      <div className={styles.AreaSection}>
        <Title order={2}>How does it work?</Title>
        <p>For each item ("SolBoard") you buy, you get an NFT of that item.</p>
        <p>If you buy a pricy item, you additionally receive a coupon. It can be redeemed on your next purchase to get a discount.</p>
        <p>Each coupon is stored as NFT in your wallet. At every purchase, you can choose which one (if any) to use.</p>
      </div>

      <div className={styles.AreaSection}>
        <Title order={2}>Why did you make this?</Title>
        <p><b>I wanted to build a more interactive version of <a href="https://solanapay.com/">Solana Pay</a>.</b></p>
        <p>In Solana Pay, you scan a QR code, wait for a moment and are presented with a final transaction that you need to approve.</p>
        <p>There's no space for user input!</p>
        <p>I wanted to change that by using a slightly different approach.</p>
        <p>First, the user identifies themselves to the merchant.</p>
        <p>This allows the system to generate multiple options <i>specific to that user</i>.</p>
        <p>The user then chooses between them.</p>
        <p>Depending on their choice, a different transaction is generated and presented.</p>
        <p>This way, a lot more dynamic interactions between customer and merchant are possible.</p>
        <p>In our case, this allows the user to choose between different coupons (or choose no coupon at all).</p>
      </div>

      <div className={styles.AreaSection}>
        <Title order={2}>Who made this?</Title>
        <p>Hi! My name is Maxim Schmidt. I'm a math / CS grad who is looking to enter the blockchain space. Feel free to <a href="mailto:maxim.schmidt@tum.de">reach out</a>.</p>
      </div>
    </div>
  )
}

