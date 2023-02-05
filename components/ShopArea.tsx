import styles from '../styles/Home.module.css'

import ShopItem from '../components/ShopItem'

const NFT_PRICES = require('nft_data/nft_prices.json')

export default function ShopArea() {
    return (
        <div className={styles.ShopArea}>
              <ShopItem officialName="Skateboard 01" shortName="skateboard_01" itemPrice={NFT_PRICES["skateboard_01"]} />
              <ShopItem officialName="Skateboard 02" shortName="skateboard_02" itemPrice={NFT_PRICES["skateboard_02"]} />
              <ShopItem officialName="Skateboard 03" shortName="skateboard_03" itemPrice={NFT_PRICES["skateboard_03"]} />
              <ShopItem officialName="Skateboard 04" shortName="skateboard_04" itemPrice={NFT_PRICES["skateboard_04"]} />
              <ShopItem officialName="Skateboard 05" shortName="skateboard_05" itemPrice={NFT_PRICES["skateboard_05"]} />
              <ShopItem officialName="Skateboard 06" shortName="skateboard_06" itemPrice={NFT_PRICES["skateboard_06"]} />
              <ShopItem officialName="Skateboard 07" shortName="skateboard_07" itemPrice={NFT_PRICES["skateboard_07"]} />
              <ShopItem officialName="Skateboard 08" shortName="skateboard_08" itemPrice={NFT_PRICES["skateboard_08"]} />
              <ShopItem officialName="Skateboard 09" shortName="skateboard_09" itemPrice={NFT_PRICES["skateboard_09"]} />
              <ShopItem officialName="Skateboard 10" shortName="skateboard_10" itemPrice={NFT_PRICES["skateboard_10"]} />
        </div>
    )
}
