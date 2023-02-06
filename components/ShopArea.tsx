import styles from '../styles/Home.module.css'

import ShopItem from '../components/ShopItem'

const NFT_PRICES = require('nft_data/nft_prices.json')

export default function ShopArea() {
    return (
        <div className={styles.ShopArea}>
        <div className={styles.ShopAreaContainer}>
              <ShopItem officialName="SolBoard #1" shortName="skateboard_01" itemPrice={NFT_PRICES["skateboard_01"]} />
              <ShopItem officialName="SolBoard #2" shortName="skateboard_02" itemPrice={NFT_PRICES["skateboard_02"]} />
              <ShopItem officialName="SolBoard #3" shortName="skateboard_03" itemPrice={NFT_PRICES["skateboard_03"]} />
              <ShopItem officialName="SolBoard #4" shortName="skateboard_04" itemPrice={NFT_PRICES["skateboard_04"]} />
              <ShopItem officialName="SolBoard #5" shortName="skateboard_05" itemPrice={NFT_PRICES["skateboard_05"]} />
              <ShopItem officialName="SolBoard #6" shortName="skateboard_06" itemPrice={NFT_PRICES["skateboard_06"]} />
              <ShopItem officialName="SolBoard #7" shortName="skateboard_07" itemPrice={NFT_PRICES["skateboard_07"]} />
              <ShopItem officialName="SolBoard #8" shortName="skateboard_08" itemPrice={NFT_PRICES["skateboard_08"]} />
              <ShopItem officialName="SolBoard #9" shortName="skateboard_09" itemPrice={NFT_PRICES["skateboard_09"]} />
              <ShopItem officialName="SolBoard #10" shortName="skateboard_10" itemPrice={NFT_PRICES["skateboard_10"]} />
        </div>
        </div>
    )
}
