# Solana NFT Mint
This is an overview of the process for creating VerifiedInk NFTs on the Solana blockchain.

## Overview
VerifiedInk NFTs are minted on the Solana Blockchain. We mint the NFT on demand since there is a non-trivial cost to minting (~$2). Once we mint the NFT, we transfer it to the user's wallet which we maintain for them. From there the user can either tranfer the NFT to their own wallet or put it up for sale.

## Account/Wallet Structure
Accounts and Wallets are synonymous on Solana. VerifiedInk has four main accounts:
1. VERIFIED_SVC_ACCOUNT - This is the account that does most of the on-chain actions.
2. VERIFIED_AUCTION_HOUSE_ACCOUNT - This is the account that handles the auction house which is our marketplace.
3. VERIFIED_AH_FEE_PAYER_ACCOUNT - This is the account that handles the fees for the VerifiedInk NFTs.
4. VERIFIED_TREASURY_ACCOUNT - This is the account that receives VerifiedInk's share of royalties (6%).

We also create a wallet for every user who creates NFTs (Custodied Wallet). In the future we might also create wallets for users who buy with fiat, but to start the only way to buy will be through Solana. We store the private keys in supabase encrypted with a salt and a common key. When we want to take actions on behalf of the users we decrypt the keys (but never on the client side).

## Minting NFTs
Currently an NFT is minted by calling `NFTMintMaster(nft_id, serial_no)`. This first checks to ensure the NFT hasn't already been minted, and  if not, constructs the NFT. 
NFTMintMaster calls a few other functions to both generate metadata and upload it to arweave which is a distributed storage system (like s3).

## Placing NFTs up for sale
This is done using the Auciton House program on Solana: [docs](https://docs.metaplex.com/auction-house/definition). 

I'd like the interface to be a bit cleaner than it is today, but there are basically 3 functions:
1. Sell (`mint/marketplace.ts`) - can only be called by the owner of the NFT from Verified Ink
2. BuyAndExecute (`mint/marketplace-front-end.ts`) - can only be called by an external wallet holder
3. Cancel Sale (`mint/marketplace.ts`) -can only be called by the owner of the NFT

We store information about each bid and offer in Supabase as well as in the auction house program.

## Withdrawing NFTs
We want to enable users to take possession of their NFTs by transferring them to their own wallet.

## Withdrawing Royalties
Users should be able to withdraw their royalties from their custodied wallet.



# AuctionHouse setup
This is done outside of this codebase. It sets up the auction house program.

1. Get keypair and store in ~/.config/solana/vfd_svc.json (just take secret key)
  ```
  const keypair = await web3.Keypair.fromSecretKey(base58.decode(verifiedSolSvcKey));
  console.log(keypair)
  ```
2. Initialize an auction house
```
ts-node ~/metaplex-foundation/metaplex/js/packages/cli/src/auction-house-cli.ts create_auction_house --keypair ~/.config/solana/vfd_svc.json devnet -ccsp false -rso false

```
Output `zfQkKkdNbZB6Bnqe4ynEyT7gjHSd28mjj1xqPEVMAgT`

Production `Fmi98rgkH9jU4mEwp9ZEkaNMEdWpj97U9xXuRcVjCP9p`


