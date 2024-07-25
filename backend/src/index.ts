import { createApp } from "@deroll/app";
import {
  decodeFunctionData,
  parseAbi,
  stringToHex,
  getAddress,
  verifyMessage,
  stringToBytes,
} from "viem";
import { createRouter } from "@deroll/router";
import { createWallet } from "@deroll/wallet";
import {
  contractType,
  employmentAgreement,
  rentalAgreement,
  Signature,
  Status,
  termination,
  terminationReasons,
} from "./types";
// create application
const app = createApp({
  url:
    process.env.ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:8080/host-runner",
});
const wallet = createWallet();
const router = createRouter({ app });

type ContractStatus = {
  id: string;
  contractType: contractType;
  status: Status;
};

let AllContracts: Map<string, employmentAgreement | rentalAgreement> =
  new Map();

//let contractStatus: Map<string, ContractStatus> = new Map();
let contractsList: Map<string, Set<ContractStatus>> = new Map();
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
    console.log(address);
    return JSON.stringify({
      result: WhiteList.get(String(address)) != undefined,
    });
  }
);
router.add<{ address: string }>(
  "contracts/:address",
  ({ params: { address } }) => {
    if (contractsList.has(address)) {
      // Retrieve the Set from the Map
      const contractSet = contractsList.get(address);

      if (contractSet) {
        // Convert the Set to an array
        const contractArray = Array.from(contractSet);
        // Convert the array to a JSON string
        const jsonString = JSON.stringify(contractArray);

        // Send the JSON string as a response
        return jsonString;
      } else {
        console.log(' error: "no data found for this addres"');
        return JSON.stringify({});
      }
    }
    console.log(' error: "no data set found for this addres"');
    return JSON.stringify({});
  }
);
router.add<{}>("allcontracts", ({}) => {
  console.log(mapToJson);
  console.log(JSON.stringify(contractsList));
  return mapToJson(contractsList);
});

router.add<{ id: string }>("contract/:id", ({ params: { id } }) => {
  return JSON.stringify({
    result: AllContracts.get(id),
  });
});

function mapToJson(map: Map<string, Set<ContractStatus>>): string {
  // Convert the Map to an array of key-value pairs
  const array = Array.from(map.entries(), ([key, value]) => [
    key,
    Array.from(value),
  ]);
  // Convert the array to a JSON string
  return JSON.stringify(array);
}

const WhiteList = new Map<string, boolean>();
WhiteList.set("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", true);
WhiteList.set("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", true);
// define application ABI
const abi = parseAbi([
  "function checkWhiteList(address user)",
  "function addToWhiteList(address user)",
  "function createAgreement(string agreement)",
  "function acceptAgreement(string id,string signature)",
  "function endAgreement(string id,string signature)",
  "function terminateAgreement(string id,string signature,uint32 reason)",
]);

// handle input encoded as ABI function call
app.addAdvanceHandler(async (data) => {
  try {
    const { functionName, args } = decodeFunctionData({
      abi,
      data: data.payload,
    });
    console.log(data.payload);
    const sender = data.metadata.msg_sender;

    switch (functionName) {
      case "checkWhiteList": {
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
          return "reject";
        }
        return "accept";
      }
      case "addToWhiteList": {
        if (
          getAddress(sender) ==
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
      case "createAgreement": {
        if (!WhiteList.get(getAddress(String(sender)).toString())) {
          app.createReport({
            payload: stringToHex(
              `user: ${sender} is not whitelisted please verify your identity first using privado ID`
            ),
          });
          return "reject";
        }
        const [agreement] = args;

        let contract: employmentAgreement = JSON.parse(agreement);
        const valid = await verifyMessage({
          address: getAddress(String(contract.contractCreator)),
          message: contract.signatures.contractorSignature.physical_signature,
          signature: <`0x${string}`>(
            contract.signatures.contractorSignature.digital_signature
          ),
        });
        console.log("creating and agreement", agreement, valid);

        if (
          getAddress(String(contract.contractCreator)) !== getAddress(sender) ||
          !valid
        ) {
          app.createReport({
            payload: stringToHex(
              `only contract${contract.contractCreator} creator can sign the input transaction instead received input from ${sender}`
            ),
          });
          return "reject";
        }

        /**  After checking necessary conditions we must
         * update signature timestamps inside the contract
         * update contract status
         * update active/intermediate contracts map
         * update contract status map
         * update the address based list for contractors && contractees
         */

        contract.signatures.contractorSignature.timestamp =
          data.metadata.timestamp;
        contract.status = Status.inProcess;
        AllContracts.set(contract.agreementId, contract);

        let list = contractsList.get(
          contract.contractCreator.toString().toLowerCase()
        );
        if (!list || list?.size == 0) {
          list = new Set();
        }
        let contractdetails: ContractStatus = {
          id: contract.agreementId,
          contractType: contract.contractType,
          status: Status.initialized,
        };

        list.add(contractdetails);
        contractsList.set(
          contract.contractCreator.toString().toLowerCase(),
          list
        );
        console.log(list, contractsList, sender, contract.contractee.wallet);

        let list1 = contractsList.get(
          contract.contractee.wallet.toString().toLowerCase()
        );
        if (!list1 || list1?.size == 0) {
          list1 = new Set();
        }

        list1.add(contractdetails);
        contractsList.set(
          contract.contractee.wallet.toString().toLowerCase(),
          list1
        );
        console.log(list1, contractsList);

        app.createNotice({
          payload: stringToHex(
            `contract created with id ${contract.agreementId}:${JSON.stringify(
              contract
            )}`
          ),
        });
        return "accept";
      }
      case "acceptAgreement": {
        if (!WhiteList.get(getAddress(String(sender)).toString())) {
          app.createReport({
            payload: stringToHex(
              `user: ${sender} is not whitelisted please verify your identity first using privado ID`
            ),
          });
          return "reject";
        }
        const [id, _signature] = args;
        const signature: Signature = JSON.parse(_signature);
        let signing_contract = AllContracts.get(id);
        const cstatus = signing_contract?.status;
        if (!signing_contract || !cstatus || cstatus != Status.inProcess) {
          app.createReport({
            payload: stringToHex(
              `contract with id ${id} not found with status ${cstatus} & type ${signing_contract?.contractType}`
            ),
          });
          return "reject";
        }

        if (
          getAddress(String(sender)) !==
          getAddress(String(signing_contract?.contractee.wallet))
        ) {
          app.createReport({
            payload: stringToHex(
              `contract with id ${id} is not authorized for your account with address ${sender}`
            ),
          });
          return "reject";
        }

        const valid = await verifyMessage({
          address: getAddress(String(signing_contract.contractee.wallet)),
          message: signature.physical_signature,
          signature: <`0x${string}`>signature.digital_signature,
        });
        if (!valid) {
          app.createReport({
            payload: stringToHex(
              `contract with id ${id} is not authorized for your account with address ${sender}`
            ),
          });
          return "reject";
        }

        signature.timestamp = data.metadata.timestamp;
        signing_contract.signatures.contracteeSignature = signature;
        signing_contract.status = Status.active;
        AllContracts.set(signing_contract.agreementId, signing_contract);

        app.createNotice({
          payload: stringToHex(
            `contract with id ${signing_contract.agreementId}:${JSON.stringify(
              signing_contract
            )} is now active`
          ),
        });
        return "accept";
      }

      case "endAgreement": {
        if (!WhiteList.get(getAddress(String(sender)).toString())) {
          app.createReport({
            payload: stringToHex(
              `user: ${sender} is not whitelisted please verify your identity first using privado ID`
            ),
          });
          return "reject";
        }
        const [id, _signature] = args;
        const signature: Signature = JSON.parse(_signature);
        let contractor_end_agreement = AllContracts.get(id);
        const cstatus = contractor_end_agreement?.status; //contractStatus.get(id);

        if (
          !cstatus ||
          cstatus !== Status.active ||
          !contractor_end_agreement
        ) {
          app.createReport({
            payload: stringToHex(
              `No active contract with id ${id} found with status ${cstatus}`
            ),
          });
          return "reject";
        }

        const valid = await verifyMessage({
          address: getAddress(
            String(contractor_end_agreement.contractee.wallet)
          ),
          message: signature.physical_signature,
          signature: <`0x${string}`>signature.digital_signature,
        });
        if (!valid) {
          app.createReport({
            payload: stringToHex(
              `contract with id ${id} is not authorized for your account with address ${sender}`
            ),
          });
          return "reject";
        }

        signature.timestamp = data.metadata.timestamp;
        contractor_end_agreement.termination.Signatures.contractee = signature;
        contractor_end_agreement.status = Status.inActive;
        AllContracts.set(
          contractor_end_agreement.agreementId,
          contractor_end_agreement
        );

        app.createNotice({
          payload: stringToHex(
            `contract ended with id ${contractor_end_agreement.agreementId} need contractee signature for termination`
          ),
        });
        return "accept";
      }
      case "terminateAgreement":
        if (!WhiteList.get(getAddress(String(sender)).toString())) {
          app.createReport({
            payload: stringToHex(
              `user: ${sender} is not whitelisted please verify your identity first using privado ID`
            ),
          });
          return "reject";
        }
        const [id, _signature, reason] = args;
        const signature: Signature = JSON.parse(_signature);
        let terminate_agreement = AllContracts.get(id);
        const cstatus = terminate_agreement?.status;

        if (!cstatus || cstatus != Status.inActive || !terminate_agreement) {
          app.createReport({
            payload: stringToHex(
              `No inActive contract with id ${id} found, with status ${cstatus}`
            ),
          });
          return "reject";
        }

        const valid = await verifyMessage({
          address: getAddress(String(terminate_agreement.contractor.wallet)),
          message: signature.physical_signature,
          signature: <`0x${string}`>signature.digital_signature,
        });
        if (!valid) {
          app.createReport({
            payload: stringToHex(
              `contract with id ${id} is not authorized for your account with address ${sender}`
            ),
          });
          return "reject";
        }

        signature.timestamp = data.metadata.timestamp;
        terminate_agreement.termination.Signatures.contractor = signature;
        terminate_agreement.status = Status.terminated;
        terminate_agreement.termination.reason = reason;
        AllContracts.set(terminate_agreement.agreementId, terminate_agreement);

        app.createNotice({
          payload: stringToHex(
            `contract terminated with id ${
              terminate_agreement.agreementId
            }:${JSON.stringify(terminate_agreement)}`
          ),
        });
        return "accept";
    }
  } catch (e) {
    console.log("error is", e);
    app.createReport({ payload: stringToHex(String(e)) });
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
