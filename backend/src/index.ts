import { createApp } from "@deroll/app";
import {
  decodeFunctionData,
  parseAbi,
  stringToHex,
  getAddress,
  verifyMessage,
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
} from "./types";
// create application
const app = createApp({ url: "http://127.0.0.1:8080/host-runner" });
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
let contractsList: Map<string, Set<String>> = new Map();
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
router.add<{ address: string }>(
  "contracts/:address",
  ({ params: { address } }) => {
    return JSON.stringify({
      result: contractsList.get(String(address)),
    });
  }
);

const WhiteList = new Map<string, boolean>();
WhiteList.set("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", true);
WhiteList.set("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", true);
// define application ABI
const abi = parseAbi([
  "function checkWhiteList(address user)",
  "function addToWhiteList(address user)",
  "function createAgreement(string agreement)",
  "function acceptAgreement(string id,string signature)",
  "function endAgreement(string id,string signature,uint32 reason)",
  "function terminateAgreement(string id,string signature)",
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
         ( getAddress(sender) ==
          getAddress("0x0Fb484F2057e224D5f025B4bD5926669a5a32786") ) {
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
        if (!WhiteList.get(String(sender))) {
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
          signature: stringToHex(
            String(contract.signatures.contractorSignature.digital_signature)
          ),
        });

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
        /*     contractStatus.set(contract.agreementId, {
          contractType: contract.contractType,
          status: Status.inProcess,
        });*/
        let list = contractsList.get(sender);
        if (!list) {
          list = new Set();
        }
        let contractdetails: ContractStatus = {
          id: contract.agreementId,
          status: contract.status,
          contractType: contract.contractType,
        };
        list.add(JSON.stringify(contractdetails));
        contractsList.set(sender, list);
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
        if (!WhiteList.get(String(sender))) {
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
          signature: stringToHex(String(signature.digital_signature)),
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
        //   cstatus.status = Status.active;
        //     contractStatus.set(signing_contract.agreementId, cstatus);
        let list = contractsList.get(sender);
        if (!list) {
          list = new Set();
        }
        let contractdetails: ContractStatus = {
          id: signing_contract.agreementId,
          status: signing_contract.status,
          contractType: signing_contract.contractType,
        };
        list.add(JSON.stringify(contractdetails));

        contractsList.set(sender, list);

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
        if (!WhiteList.get(String(sender))) {
          app.createReport({
            payload: stringToHex(
              `user: ${sender} is not whitelisted please verify your identity first using privado ID`
            ),
          });
          return "reject";
        }
        const [id, _signature, cause] = args;
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
            String(contractor_end_agreement.contractor.wallet)
          ),
          message: signature.physical_signature,
          signature: stringToHex(String(signature.digital_signature)),
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
        contractor_end_agreement.termination.Signatures.contractor = signature;
        contractor_end_agreement.termination.reason = cause;
        contractor_end_agreement.status = Status.inActive;
        AllContracts.set(
          contractor_end_agreement.agreementId,
          contractor_end_agreement
        );
        // cstatus.status = Status.inActive;
        //contractStatus.set(contractor_end_agreement.agreementId, cstatus);

        app.createNotice({
          payload: stringToHex(
            `contract ended with id ${contractor_end_agreement.agreementId} need contractee signature for termination`
          ),
        });
        return "accept";
      }
      case "terminateAgreement":
        if (!WhiteList.get(String(sender))) {
          app.createReport({
            payload: stringToHex(
              `user: ${sender} is not whitelisted please verify your identity first using privado ID`
            ),
          });
          return "reject";
        }
        const [id, _signature] = args;
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
          address: getAddress(String(terminate_agreement.contractee.wallet)),
          message: signature.physical_signature,
          signature: stringToHex(String(signature.digital_signature)),
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
        terminate_agreement.termination.Signatures.contractee = signature;
        terminate_agreement.status = Status.terminated;
        AllContracts.set(terminate_agreement.agreementId, terminate_agreement);
        //AllContracts.delete(terminate_agreement.agreementId);

        // cstatus.status = Status.terminated;
        // contractStatus.set(terminate_agreement.agreementId, cstatus);

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
