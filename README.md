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

**I wanted to build a more interactive version of Solana Pay.**

In Solana Pay, you scan a QR code, wait for a moment and are presented with a final transaction that you need to approve. There's no space for user input! There is no real back and forth with the user. The server can't query them about their preferences or request additional inputs.

I wanted to enable such inputs by using a slightly different approach. First, the user identifies himself to the merchant through his public key. This allows the system to generate multiple options specific to that user and display them in the UI. The user then chooses between them. Depending on the choice, a different transaction is generated on the server and sent back for the user to sign.

This way, a lot more dynamic interactions between customer and merchant are possible. In particular, you can split up the payment process into multiple steps (with user input inbetween) rather than forcing the entire process into a single step.

In our case, this system allows the user to choose between different coupons (or choose no coupon at all):

![Checkout](/img/checkout.png)

Contrast this with the conventional scenario: there would be a system deciding for you to e.g. use a coupon for the current purchase. The entire process would be deterministic and you, as user, would be forced to agree to it.

## How does it work technically?

When the user opens the checkout window, the client fetches the user's coupons from the blockchain. The user can now choose between them. The consequences of the currently selected option are shown.

Once a decision has been made, the user clicks on the "Pay" button and a POST request is sent to the server. The server validates and process the request, possibly applying a discount on the calculated total. It creates the respective transaction, serializes it and sends it back to the user as POST response.

The client deserializes the transaction and requests the user to sign it via the wallet software. Once signed, the transaction is sent to the blockchain.

Note that I tried to do that with Solana Pay, but couldn't find a way to transfer the public key of the customer early enough to the frontend.

Ultimately I realized that **I was trying to force a technology onto a problem that it was not supposed to solve** -- and changed my approach!

This led to essentially a re-implementation of Solana Pay, especially the part that happens in the wallet software (e.g. POST request, (de-/)serialization). This was necessary to make this custom architecture possible.

## Let's extend Solana Pay

Right now, when you scan the QR code and send your public key, both parties expect that a transaction happens immediately after.

While this is appropriate in most cases, it limits the kinds of interactions that are possible between customer and merchant.

Sharing your public key means giving the other party access to your entire transaction history, your interests and preferences. Merchants could use it to offer a personalized shopping experience before the user has decided on any transaction.

To make this possible, the Solana Pay protocol would need to be extended.

It could work like this: The merchant presents the customer with a QR code that encodes the URL of an endpoint. The customer's wallet sends its public key to this endpoint, allowing the merchant to recognize this customer as the "current customer". (In the case of a browser, the endpoint URL must include the user's session ID so that it can be associated with the public key). The customer now interacts with the merchant and eventually chooses a purchase option. The server creates a transaction, signs it and presents it to the customer as a second QR code. The customer scans it, approves it and sends it to the network.

As side-effect, you would not need a browser wallet anymore. It would be sufficient to scan QR codes with your phone.

A small change in the protocol could go a long way in improving the customer's shopping experience.

### Example: Self-service kiosk

What would this look like from the customer's point of view at a self-service kiosk (like those at McDonalds)?

A customer approaches the machine and scans a public QR code. The customer's wallet sends its public key to a server, essentially telling the server that "customer X is currently standing in front of machine Y". The machine can now make personalized offers to the customer, such as the option of spending loyalty points on a free meal. The customer picks that option and is shown another QR code (this time, containing the requested transaction). After scanning it and approving the transaction, the order goes through.

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
