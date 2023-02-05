# Get your SolBoard!

An onlineshop for skateboards on Solana with a loyalty programme. The special thing about is that, during the checkout, you can select from a coupon NFTs that you have in your wallet and reedem them to get a discount. **You do that in the same interface**. This is achieved by inventing an architecture that is similar to Solana Pay, but also crucially different (see below).

This is my contribution to the Encode X Solana Hackathon 2023

## How does it work?

It's an online store for (really cool) Stakeboards

You can only pay in SOL

For every skateboard you purchase, you get an NFT of that skateboard for free

## What is special about it?

You can choose between the coupons that you own **in the same window** as you're making the purchase.

Note that I tried to do that with Solana Pay, but couldn't find a way to transfer the public key of the customer early enough to the frontend. Ultimately I realized that **I was trying to force a technology onto a problem that it was not supposed to solve** -- and changed it!

As a reminder: How does Solana Pay work? The server posts a link to an endpoint in the form of a QR code. The user scans it with their wallet. The wallet sends a POST request to the server with the pubkey of the user. The server then responds with a personalized transaction.

What is the problem with this? **You can't introduce multiple steps**. Once the server has received the pubkey, it is forced to create a transaction immediately -- there is no real bidirectional interaction or back and forth with the user; the server can't query them about their preferences. And if you try to circumvent that (like I tried in multiple failed attempts), then the architecture becomes unwiedly and complicated and you end up setting up a persistence layer just to store user sessions. Makes no sense.

How to solve it? **Get the wallet out of the way** and instead send POST requests to the server directly, containing all of the user's preferences. This leverages Solana's capability to do offline transactions. At the very end, when the user agrees to it, they can sign the (final) transaction.

## Mechanism of the loyalty programme

If the price of the item that you buy is high enough, you get a coupon that you can redeem for a discount.

For example, if you buy a skateboard for 1 SOL, you get a coupon for 0.15 SOL. You can use this to purchase the cheapest stakeboard (which is at 0.25 SOL) at 0.1 SOL instead.

However, if you use a coupon in a transaction, you are not eligible to receive a coupon

This is a way to reward brand loyalty

