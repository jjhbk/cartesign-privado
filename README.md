# Cartesign-Privado

A decentralized E-Signature based contract management platform with secure handwritten biometrics.
This project uses [PrivadoID](https://www.privado.id/) for authenticating users by doing a ZK proof based KYC & [Cartesi](https://cartesi.io/) to handle the complex contract management logic in a secure + decentralized fasion.

[Live - App](https://cartesign-privado-frontend.vercel.app/)

## Deploying DApp application

### build the Cartesi Dapp

`cd backend && cartesi build`

### Create Template Hash

`cartesi deploy --hosting self-hosted --webapp https://sunodo.io/deploy`

### deploy to the dapp to the Polygon Amoy testnet

`replace the variables 'templateHash' && 'salt' in scripts/deploy_dapp.js`

```
cd on-chain-verification

npx hardhat run ./scripts/deploy_dapp.js --network amoy

```

## Polygon ID Wallet setup

1. Download the Polygon ID mobile app on the [Google Play](https://play.google.com/store/apps/details?id=com.polygonid.wallet) or [Apple app store](https://apps.apple.com/us/app/polygon-id/id1629870183)

2. Open the app and set a pin for security

3. Issue yourself a Credential of type `Kyc Age Credential Merklized` from the [Polygon ID Issuer Sandbox](https://issuer-ui.polygonid.me/)
   - Import json schema[v3](https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json)
   - Issue credential https://issuer-ui.polygonid.me/credentials/issue using the credential link and fetch credential to mobile

## Frontend

### Install & run

```
cd frontend
yarn
yarn run dev
```

### Deployments

[backend](https://3c0209203a21-4663034037928092558.ngrok-free.app/)

[frontend](https://cartesign-privado-frontend.vercel.app/)

[frontend-live-repo](https://github.com/jjhbk/cartesign-privado-frontend)
