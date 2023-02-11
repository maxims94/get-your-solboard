import styles from '../styles/Home.module.css'

export default function NavBar() {
    
    const onNavItemClick = (item) => {
      console.log(item) 
    }

    return (
        <div className={styles.NavBar}>
            <div className={styles.NavBarContainer}>

                <div class={styles.NavBarGroup}>
                  <a onClick={() => onNavItemClick("store")}>Store</a>
                  <a onClick={() => onNavItemClick("account")}>Account</a>
                </div>

                <div class={styles.NavBarGroup}>
                  <a onClick={() => onNavItemClick("how-to")}>How-to</a>
                  <a onClick={() => onNavItemClick("screenshots")}>Screenshots</a>
                  <a onClick={() => onNavItemClick("about")}>About</a>
                </div>
            </div>
        </div>
    )
}
