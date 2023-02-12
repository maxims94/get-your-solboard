import styles from '../styles/Home.module.css'
import { Title } from '@mantine/core'

export default function AboutArea() {

  return (
    <div className={styles.Area}>
      <Title order={1}>About</Title>

      <div className={styles.AreaSection}>
        <Title order={2}>What is this?</Title>
        <p>An online shop for skateboards based on Solana</p>
        <p>A hackathon project for this hackathon</p>
        <p>For technical details, see <a href="github.com">Github</a> page</p>
      </div>

      <div className={styles.AreaSection}>
        <Title order={2}>Why did you make this?</Title>
        <p>Explore possibilities with <a href="solana-pay.com">Solana Pay</a>, especially 2 steps instead of 1</p>
      </div>

      <div className={styles.AreaSection}>
        <Title order={2}>Who wrote this?</Title>
        <p>Written by Maxim Schmidt</p>
      </div>
    </div>
  )
}

