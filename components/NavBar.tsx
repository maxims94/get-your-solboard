import styles from '../styles/Home.module.css'

export default function NavBar({ onNavItemClick }) {
    
    return (
        <div className={styles.NavBar}>
            <div className={styles.NavBarContainer}>
                <div class={styles.NavBarGroup}>
                  <div onClick={() => onNavItemClick("store")}>Store</div>
                  <div onClick={() => onNavItemClick("account")}>Account</div>
                </div>
                <div class={styles.NavBarGroup}>
                  <div onClick={() => onNavItemClick("how-to")}>How-to</div>
                  <div onClick={() => onNavItemClick("screenshots")}>Screenshots</div>
                  <div onClick={() => onNavItemClick("about")}>About</div>
                </div>
            </div>
        </div>
    )
}
