const { ethers } = require("hardhat");
const SelfhostedDappFactory = require("../abi/SelfHostedApplicationFactory.json");
async function main() {
  const owner = "0x08208F5518c622a0165DBC1432Bc2c361AdFFFB1";
  let selfhostedDappFactory = await ethers.getContractAt(
    SelfhostedDappFactory.abi,
    SelfhostedDappFactory.address
  );
  let templateHash =
    "0x7e10b44028f7d0a427621bac2461119898cc1ac5b113793948d7b13ff4d0b414";
  //"0xa3625cde0d024fcdd29f261dcd0cc258da460c333a4cb68f3e9c6041593b92c1";
  // "0x93f8f5f722948e286f29b86da3f7af8750cdcff98a2a960ad998fc6f14d9700c";
  // "0x9addf0ebe8de0968abee8e2ecc16fda2ba85257ab42d516163ea066500baecca";
  let salt =
    "0x2bd1d9310a50a756340555f3735deeb04dcf73c898471d82db13510998097d3d";
  //"0x53b5732403fceada576945e3ce5f62a28c547855ecd10d39074d6e92ef6e0dff"; //"0xf7096865b1ec95308c42683047354dee91e13eb5d07248f30a4c81a3557ce9a3";
  try {
    /* const txId = await selfhostedDappFactory.deployContracts(
      owner,
      owner,
      templateHash,
      salt,
      { gasLimit: 3500000 }
    );*/
    const txId = await selfhostedDappFactory.calculateAddresses(
      owner,
      owner,
      templateHash,
      salt,
      { gasLimit: 1500000 }
    );

    console.log("dapp created set: ", txId);
  } catch (e) {
    console.log("error: ", e);
  }
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
