import styles from '../styles/Home.module.css'

import TransactionModal from '../components/TransactionModal'

export default function ShopArea() {
    return (
        <div className={styles.ShopArea}>
              <TransactionModal />
        </div>
    )
}
