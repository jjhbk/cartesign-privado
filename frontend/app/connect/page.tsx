"use client";
import Image from "next/image";
import injectedModule from "@web3-onboard/injected-wallets";
import { init, useWallets } from "@web3-onboard/react";
import { ethers } from "ethers";
import { hexToString } from "viem";
import QRCode from "react-qr-code";
import { useState, useRef, FC } from "react";
import { v4 as uuidv4 } from "uuid";
import SignaturePad from "react-signature-canvas";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import configFile from "./config.json";
import { encodeFunctionData, parseAbi } from "viem";
import {
  advanceDAppRelay,
  advanceERC20Deposit,
  advanceERC721Deposit,
  advanceEtherDeposit,
  advanceInput,
} from "cartesi-client";
import "../globals.css";
import Modal from "./components/modal";
import { Input } from "./components/input";
import { Report } from "./components/reports";
import { Notice } from "./components/notices";
const config: any = configFile;
const injected = injectedModule();

init({
  wallets: [injected],
  chains: Object.entries(config).map(([k, v]: [string, any], i) => ({
    id: k,
    token: v.token,
    label: v.label,
    rpcUrl: v.rpcUrl,
  })),
  appMetadata: {
    name: "Cartesi-Privado Verifier",
    icon: "<svg>CarteSign<svg/>",
    description: "Cartesi Dapp with PrivadoID Verification",
    recommendedInjectedWallets: [
      { name: "MetaMask", url: "https://metamask.io" },
    ],
  },
});

const Network: FC = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();
  const [dappAddress, setDappAddress] = useState<string>(
    "0x48383296da5f7Ce3408Cf98445289daF48488607"
  );
  return (
    <div>
      {!wallet && (
        <button
          className="bg-sky-500 rounded-md p-2 text-sm shadow-sm focus:outline-none focus:ring  hover:bg-sky-700"
          onClick={() => connect()}
        >
          {connecting ? "connecting" : "connect"}
        </button>
      )}
      {wallet && (
        <div>
          <label>Switch Chain</label>
          {settingChain ? (
            <span>Switching chain...</span>
          ) : (
            <select
              onChange={({ target: { value } }) => {
                if (config[value] !== undefined) {
                  setChain({ chainId: value });
                } else {
                  alert("No deploy on this chain");
                }
              }}
              value={connectedChain?.id}
            >
              {chains.map(({ id, label }) => {
                return (
                  <option key={id} value={id}>
                    {label}
                  </option>
                );
              })}
            </select>
          )}
          <button onClick={() => disconnect(wallet)}>Disconnect Wallet</button>
          <div>
            Dapp Address:{" "}
            <input
              type="text"
              value={dappAddress}
              onChange={(e) => setDappAddress(e.target.value)}
            />
            <br />
            <br />
          </div>
        </div>
      )}
    </div>
  );
};
const dappAbi = parseAbi([
  "function checkWhiteList(address user)",
  "function addToWhiteList(address user)",
]);

export default function Home() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();
  const [qrvisible, setQrVisible] = useState(false);
  const [dappAddress, setDappAddress] = useState<string>(
    "0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e"
  ); //"0x48383296da5f7Ce3408Cf98445289daF48488607"
  const [connectedWallet] = useWallets();
  const addCustomInput = async (input: any) => {
    const provider = new ethers.providers.Web3Provider(
      connectedWallet.provider
    );

    console.log("adding input");
    const signer = await provider.getSigner();
    advanceInput(signer, dappAddress, input);
  };

  const inspectCall = async (path: string) => {
    let apiURL = "http://127.0.0.1:8080/inspect";
    const provider = new ethers.providers.Web3Provider(
      connectedWallet.provider
    );

    console.log("checking whitelist status");
    const signer = await provider.getSigner();
    if (connectedChain) {
      if (config[connectedChain.id]?.inspectAPIURL) {
        apiURL = `${config[connectedChain.id].inspectAPIURL}/inspect`;
      } else {
        console.error(
          `No inspect interface defined for chain ${connectedChain.id}`
        );
        return;
      }
    }
    let fetchData = fetch(`${apiURL}/${path}/${signer}`);
    fetchData
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const payload = JSON.parse(hexToString(data.reports[0]?.payload));
        if (payload?.result) {
          alert("You are a registered user on Cartesign");
        } else {
          alert(
            "you are not a registered user on Cartesign please verify your identity using Privado ID"
          );
        }
      });
  };
  const id = uuidv4();
  const [qrcode, setQrcode] = useState("");
  let padRef: any = useRef({});
  const [dataURL, setDataURL] = useState("");
  const cid = "bafybeib4p2flqhs2gqsgeygr5ugqusczdjz45prs3ssxzq7y7wdsa5oyo4";
  const clear = () => {
    padRef.current?.clear();
  };
  const trim = async () => {
    var url = "";
    url = padRef.current?.getCanvas().toDataURL("image/png");
    setDataURL(url);
    console.log(url);
  };
  return (
    <div className="bg-fixed  bg-red-200 dark:bg-slate-600 p-6  selection:bg-fuchsia-300 selection:text-fuchsia-900">
      <div>
        <h1 className="">Cartesi-Privado Verifier</h1>
        <Network />
        <br />
        {connectedWallet && (
          <div>
            <Input dappAddress="0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e" />
            <Report />
            <Notice />
            <button
              className="bg-sky-500 rounded-md p-2 text-sm shadow-sm focus:outline-none focus:ring  hover:bg-sky-700"
              onClick={() => {
                addCustomInput(
                  encodeFunctionData({
                    abi: dappAbi,
                    functionName: "addToWhiteList",
                    args: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
                  })
                );
              }}
            >
              addWhiteList
            </button>
            <button
              className="bg-sky-500 rounded-md p-2 text-sm shadow-sm focus:outline-none focus:ring  hover:bg-sky-700"
              onClick={() => {
                inspectCall(`whitelist`);
              }}
            >
              checkWhiteList
            </button>
            <Modal />
          </div>
        )}
        <div>
          <h2>
            Verify your Age Using Privado ID to start Interacting with Cartesi
            DApp greater than 18 years of age
          </h2>
          <div
            style={{
              backgroundColor: "white",
              width: 250,
              marginLeft: 50,
              marginRight: 50,
              alignItems: "center",
              alignContent: "center",
              alignSelf: "center",
            }}
            className="aspect-[3/1]"
          >
            <SignaturePad
              ref={padRef}
              canvasProps={{
                className: "sigCanvas",
                width: 250,
                height: 80,
                color: "red",
              }}
            />
          </div>
          <div className="sigPreview">
            <button
              className="bg-sky-500 rounded-md p-2 text-sm shadow-sm focus:outline-none focus:ring  hover:bg-sky-700"
              onClick={trim}
            >
              Register
            </button>
            <button
              className="bg-red-400 rounded-md p-2 text-sm shadow-sm hover:bg-red-600"
              onClick={clear}
            >
              Clear
            </button>
          </div>
          <div>
            {dataURL ? (
              <img
                className={"sigImage"}
                src={dataURL}
                alt="user generated signature"
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
