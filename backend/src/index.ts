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
import { send } from "process";
import { stat } from "fs";
// create application
const app = createApp({ url: "http://127.0.0.1:8080/host-runner" });
const wallet = createWallet();
const router = createRouter({ app });
type ContractStatus = {
  contractType: contractType;
  status: Status;
};

let AllContracts: Map<string, employmentAgreement | rentalAgreement> =
  new Map();
let TerminatedContracts: Map<string, employmentAgreement | rentalAgreement> =
  new Map();

let contractStatus: Map<string, ContractStatus> = new Map();
let contractorList: Map<string, Set<string>> = new Map();
let contracteeList: Map<string, Set<string>> = new Map();
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
          getAddress(sender) ===
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
        const [agreement] = args;
        let contract: employmentAgreement = JSON.parse(agreement);
        const valid = await verifyMessage({
          address: getAddress(String(contract.contractCreator)),
          message: contract.agreementId,
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
        contractStatus.set(contract.agreementId, {
          contractType: contract.contractType,
          status: Status.inProcess,
        });
        let list = contractorList.get(sender);
        if (!list) {
          list = new Set();
        }
        list.add(contract.agreementId);
        contractorList.set(sender, list);
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
        const [id, _signature] = args;
        const signature: Signature = JSON.parse(_signature);
        let signing_contract = AllContracts.get(id);
        const cstatus = contractStatus.get(id);
        if (
          !signing_contract ||
          !cstatus ||
          cstatus?.status != Status.inProcess
        ) {
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
          message: signing_contract.agreementId,
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
        cstatus.status = Status.active;
        contractStatus.set(signing_contract.agreementId, cstatus);
        let list = contracteeList.get(sender);
        if (!list) {
          list = new Set();
        }
        list.add(signing_contract.agreementId);
        contracteeList.set(sender, list);

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
        const [id, _signature, cause] = args;
        const signature: Signature = JSON.parse(_signature);
        const cstatus = contractStatus.get(id);
        let contractor_end_agreement = AllContracts.get(id);

        if (
          !cstatus ||
          cstatus.status !== Status.active ||
          !contractor_end_agreement
        ) {
          app.createReport({
            payload: stringToHex(
              `No active contract with id ${id} found with status ${cstatus?.status}`
            ),
          });
          return "reject";
        }

        const valid = await verifyMessage({
          address: getAddress(
            String(contractor_end_agreement.contractor.wallet)
          ),
          message: contractor_end_agreement.agreementId,
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
        AllContracts.set(
          contractor_end_agreement.agreementId,
          contractor_end_agreement
        );
        cstatus.status = Status.inActive;
        contractStatus.set(contractor_end_agreement.agreementId, cstatus);

        app.createNotice({
          payload: stringToHex(
            `contract ended with id ${contractor_end_agreement.agreementId} need contractee signature for termination`
          ),
        });
        return "accept";
      }
      case "terminateAgreement":
        const [id, _signature] = args;
        const signature: Signature = JSON.parse(_signature);
        const cstatus = contractStatus.get(id);
        let terminate_agreement = AllContracts.get(id);

        if (
          !cstatus ||
          cstatus.status != Status.inActive ||
          !terminate_agreement
        ) {
          app.createReport({
            payload: stringToHex(
              `No inActive contract with id ${id} found, with status ${cstatus?.status}`
            ),
          });
          return "reject";
        }

        const valid = await verifyMessage({
          address: getAddress(String(terminate_agreement.contractee.wallet)),
          message: terminate_agreement.agreementId,
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

        TerminatedContracts.set(
          terminate_agreement.agreementId,
          terminate_agreement
        );
        AllContracts.delete(terminate_agreement.agreementId);

        cstatus.status = Status.terminated;
        contractStatus.set(terminate_agreement.agreementId, cstatus);

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
