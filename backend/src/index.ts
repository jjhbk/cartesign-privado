import { createApp } from "@deroll/app";
import {
  decodeFunctionData,
  encodeAbiParameters,
  encodePacked,
  parseAbi,
  stringToHex,
  getAddress,
} from "viem";
import { createRouter } from "@deroll/router";
import { createWallet } from "@deroll/wallet";
// create application
const app = createApp({ url: "http://127.0.0.1:8080/host-runner" });
const wallet = createWallet();
const router = createRouter({ app });
router.add<{ address: string }>(
  "wallet/:address",
  ({ params: { address } }) => {
    return JSON.stringify({
      balance: wallet.etherBalanceOf(address).toString(),
    });
  }
);
router.add<{ address: string }>(
  "whitelist/:address",
  ({ params: { address } }) => {
    return JSON.stringify({
      result: WhiteList.get(String(address)) != undefined,
    });
  }
);

const WhiteList = new Map<string, boolean>();
// define application ABI
const abi = parseAbi([
  "function checkWhiteList(address user)",
  "function addToWhiteList(address user)",
]);

// handle input encoded as ABI function call
app.addAdvanceHandler(async (data) => {
  try {
    const { functionName, args } = decodeFunctionData({
      abi,
      data: data.payload,
    });
    console.log(data.payload);
    switch (functionName) {
      case "checkWhiteList":
        const [user] = args;
        console.log(`checking whitelist status of user: ${user} `);
        if (WhiteList.get(String(user))) {
          app.createReport({
            payload: stringToHex(`user : ${user} is white listed`),
          });
        } else {
          app.createReport({
            payload: stringToHex(
              `user: ${user} is not whitelisted please verify your identity first using privado ID`
            ),
          });
        }
        return "accept";
      case "addToWhiteList":
        if (
          getAddress(data.metadata.msg_sender) ===
          getAddress("0x0Fb484F2057e224D5f025B4bD5926669a5a32786")
        ) {
          const [user] = args;

          console.log(`adding ${user} to whitelist`);
          WhiteList.set(user, true);
          app.createNotice({
            payload: stringToHex(`user: ${user} has been whitelisted`),
          });
          return "accept";
        }
        app.createReport({
          payload: stringToHex(
            `${data.metadata.msg_sender} your identity is not verified scan the qr code to verify your identity`
          ),
        });
        return "reject";
    }
  } catch (e) {
    return "reject";
  }
});
app.addAdvanceHandler(wallet.handler);
app.addInspectHandler(router.handler);

// start app
app.start().catch((e) => {
  console.log(e);
  process.exit(1);
});
