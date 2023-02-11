import styles from '../styles/Home.module.css'

export default function NavBar({ onNavItemClick, currentArea }) {
    
    const NAV_ID_TO_NAME = {
      "store": "Store",
      "account": "Account",
      "how-to": "How-to",
      "screenshots": "Screenshots",
      "about": "About",
      "demo-video": "Demo-Video"
    }

    const generateNavItem = (areaId) => {

      return currentArea != areaId ? (
        <div onClick={() => onNavItemClick(areaId)}>{NAV_ID_TO_NAME[areaId]}</div>
      ) :
        <div className={styles.currentPage} onClick={() => onNavItemClick(areaId)}>{NAV_ID_TO_NAME[areaId]}</div>
    }

    return (
        <div className={styles.NavBar}>
            <div className={styles.NavBarContainer}>
                <div class={styles.NavBarGroup}>
                  {generateNavItem("store")}
                  {generateNavItem("account")}
                </div>
                <div class={styles.NavBarGroup}>
                  {generateNavItem("demo-video")}
                  {generateNavItem("how-to")}
                  {generateNavItem("about")}
                </div>
            </div>
        </div>
    )
}
