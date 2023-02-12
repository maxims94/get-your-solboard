# Get Your SolBoard!

![Home screenshot](/img/home.png)

**This is an online shop for skateboards that runs on Solana and has a built-in loyalty programme.**

For each item ("SolBoard") you buy, you get an NFT of that item.

If you buy a pricy item, you additionally receive a coupon. It can be redeemed on your next purchase to get a discount.

Each coupon is stored as NFT in your wallet. At every purchase, you can choose which one (if any) to use.

This is my contribution to the [Encode x Solana hackathon](https://www.encode.club/encode-solana-hackathon).

**[Watch demo](https://loom.com)**

**Live**: [https://getyoursolboard.xyz](https://getyoursolboard.xyz)

## What is special about it?

![Checkout](/img/checkout.png)

You have a **choice**

## How does it work technically?

When the user opens the checkout window, the client fetches data from the blockchain on which coupons are available. The user can now choose between them. The effect of the chosen decision is displayed.

Once a decision has been made, the user clicks on "Pay" and a POST request is sent to an endpoint of the server. The server validates and process the request, possibly applying a discount on the requested items' price. It creates the respective transaction, serializes it and sends it back to the user.

The client deserializes the transaction, requests the user to sign it via the wallet software. Then, the transaction is sent to the blockchain.

Note that this is essentially a re-implementation of the implementation of Solana Pay, especially the part that happens on the wallet and the (de-/)serialization. This was necessary to write this custom architecture.

## Let's extend Solana Pay

Right now, when you scan the QR code and send your public key, both parties expect that a transaction will take place immediately after.

While this is appropriate in most cases, it limits the kinds of interactions that are possible between customer and merchant.

Sharing your public key means giving the other party access to your entire transaction history, your interests and preferences. Merchants could use it to offer a personalized shopping experience before the user has decided on any transaction.

An extended version could look like this: The merchant presents the customer with a QR code that encodes the URL of an endpoint. The customer's wallet sends its public key to this endpoint, so that the merchant recognizes this customer as the one that's currently being served. (In the case of a browser, the endpoint URL must include the user's session ID so that it can be associated with the public key). The customer now interacts with the merchant and eventually chooses a purchase option. The server creates a transaction, signs it and presents it to the customer as a second QR code. The customer reads it, approves it and sends it.

As side-effect, one would not need to install a browser wallet.

Consider a self-service kiosk (like those at McDonalds). A customer approaches it and scans a QR code. The public key is sent to a server, telling the server that "customer X is currently standing in front of machine Y". The machine now makes personalized offer, such as the option of spending loyalty points on a free meal. The customer takes that option and is shown another QR code. After scanning it and approving the transaction, the order goes through.

## Try it yourself

Link: [https://getyoursolboard.xyz](https://getyoursolboard.xyz)

### Desktop

1. Download [Phantom Wallet extension](https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa) for Chrome
2. Set up a new wallet
3. **Switch to devnet** (important!)
4. Go to the 'Store' section
5. Start purchasing SolBoards!

### Mobile

1. Install the [Phantom Wallet app](https://phantom.app/)
2. Set up a new wallet
3. **Switch to devnet** (important!)
4. Switch to the **in-app browser** (not your regular one!)
5. Inside of it, navigate to [https://getyoursolboard.xyz](https://getyoursolboard.xyz)
5. Start purchasing SolBoards!

### Remarks

Running into issues? You can also watch this [demo](loom.com).

**Please be patient.** Devnet can be sluggish sometimes. It usually works if you try again, though.

**Your wallet is topped up automatically.** You should alway have enough funds to buy more items.

If you run into a "Transaction expired" error, that's most likely because you're on mainnet! In this case, please switch to devnet.
