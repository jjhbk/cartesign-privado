# Implement an ERC20 zk airdrop in 20 minutes with Polygon ID

Tutorial: https://0xpolygonid.github.io/tutorials/verifier/on-chain-verification/overview/

This tutorial uses [Hardhat](https://hardhat.org/) as a development environment and Polygon Mumbai testnet as the network.

## Polygon ID Wallet setup

1. Download the Polygon ID mobile app on the [Google Play](https://play.google.com/store/apps/details?id=com.polygonid.wallet) or [Apple app store](https://apps.apple.com/us/app/polygon-id/id1629870183)

2. Open the app and set a pin for security

3. Issue yourself a Credential of type `Kyc Age Credential Merklized` from the [Polygon ID Issuer Sandbox](https://issuer-ui.polygonid.me/)
   * Import json schema[v3](https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json)
   * Issue credential https://issuer-ui.polygonid.me/credentials/issue using the credential link and fetch credential to mobile 

## Instructions to compile and deploy the smart contract

1. Create a .env file in the root of this repo. Copy in .env.sample to add keys
    `touch .env`

2. Install dependencies
    `npm i`

3. Compile smart contracts
    `npx hardhat compile`

4. Deploy smart contracts
    `npx hardhat run --network amoy scripts/deploy.js`
 - console should log output similar to `ERC20zkAirdrop  contract address: 0x365D13748BEBcDaFEE12Fa18eA653f4E168A190c` with different address.
 - example contract creation: https://amoy.polygonscan.com/tx/0x1102ccb5d1e322c0bdf32d590695f3a70f7e2128061ee4325413297ff88034e8

5. Update the `ERC20VerifierAddress` variable in scripts/set-request.js with your deployed contract address

6. Run set-request to send the zk request to the smart contract
    `npx hardhat run --network amoy scripts/set-request.js`
    - Successful tx means the age query has been set up: https://amoy.polygonscan.com/tx/0x98e83a2aad5d41dc44fa03e0524848aeeabc8963ab36599fc3a0c8824d7ef722


## Claim airdrop from a frontend

1. Design a proof request (see my example in qrValueProofRequestExample.json)
    - Update the `contract_address` field to your deployed contract address

2. Create a frontend that renders the proof request in json format into a QR code. [Codesandbox example](https://codesandbox.io/s/zisu81?file=/index.js) A user should be able to scan the QR code from the Polygon ID app and trustlessly prove that they are old enough to claim the ERC20 airdrop without revealing their actual birthday.

## Deploy custom validators

1. Find the examples of deployed validators in the `./contracts/lib/validators` folder. You can modify based on your verification logic.

2. To deploy run `deployValidators`  `npx hardhat run --network mumbai scripts/deployValidators.js`

## current pre-deployed contracts


**mtp verifier address** - 0xF71d97Fc0262bB2e5B20912a6861da0B617a07Aa

**sig verifier address** - 0x8024014f73BcCAEe048784d835A36c49e96F2806

**default mtp validator** - 0x0682fbaA2E4C478aD5d24d992069dba409766121

**default sig validator** - 0x1E4a22540E293C0e5E8c33DAfd6f523889cFd878

**default state address** - 0x134B1BE34911E39A8397ec6289782989729807a4


