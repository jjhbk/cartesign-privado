"use client";
import injectedModule from "@web3-onboard/injected-wallets";
import { init, useWallets } from "@web3-onboard/react";
import { ethers } from "ethers";
import { hexToString } from "viem";
import { useState, useRef, FC, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import configFile from "./config.json";
import { parseAbi } from "viem";
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
import EmploymentAgreementForm from "./components/employment_agreement_form";
import RentalAgreementForm from "./components/rental_agreement_form";
import { useRouter } from "next/navigation";
import { HomeIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { Network } from "./components/network";
import Dashboard from "./components/dashboard";
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

const dappAbi = parseAbi([
  "function checkWhiteList(address user)",
  "function addToWhiteList(address user)",
]);

export default function Home() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();
  const [qrvisible, setQrVisible] = useState(false);
  const [isWhiteListed, setIsWhiteListed] = useState(false);
  const [contracts, setContracts] = useState(undefined);
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
    console.log(signer);
    advanceInput(signer, dappAddress, input);
  };

  const router = useRouter();

  const inspectCall = async (path: string) => {
    let apiURL = "http://127.0.0.1:8080/inspect";
    const provider = new ethers.providers.Web3Provider(
      connectedWallet.provider
    );
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    console.log(`checking ${path} status`);
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
    let fetchData = fetch(`${apiURL}/${path}/${address}`);
    fetchData
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const payload = JSON.parse(hexToString(data.reports[0]?.payload));
        if (path == "whitelist") {
          if (payload?.result) {
            console.log("whitelist status is:", payload?.result);

            alert("You are a registered user on Cartesign");
            setIsWhiteListed(true);
          } else {
            alert(
              "you are not a registered user on Cartesign please verify your identity using Privado ID"
            );
          }
        } else if (path == "contracts") {
          console.log("contracts are:", payload?.result);
          setContracts(payload?.result);
        }
      });
  };
  const id = uuidv4();
  const [qrcode, setQrcode] = useState("");

  const cid = "bafybeib4p2flqhs2gqsgeygr5ugqusczdjz45prs3ssxzq7y7wdsa5oyo4";

  useEffect(() => {
    if (connectedWallet) {
      inspectCall("whitelist");
      inspectCall("contracts");
    }
  }, [connectedWallet, isWhiteListed]);
  return (
    <div className="w-screen overflow-y-auto  h-dvh  bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 ">
      <div className="relative  divide-y divide-dashed divide-blue-400 flex flex-col">
        <div className="flex justify-between  flex-row w-full">
          <img
            className=" rounded-full h-32 w-32"
            src="https://jjhbk.github.io/assets/images/cartesign_logo.png"
          />
          <h1 className="font-bold font-sans text-2xl self-center justify-self-center">
            Cartesi-Privado Verifier
          </h1>
          <Link href={"/"}>
            <HomeIcon className="h-20 w-20 active:scale-110 text-blue-300 " />
          </Link>
        </div>

        <div className="p-6">
          <Network />
          <br />

          {!isWhiteListed && connectedWallet && (
            <div>
              <Modal dapp={dappAddress} show={!isWhiteListed} />
            </div>
          )}
        </div>
        {isWhiteListed && connectedWallet && <Dashboard />}
      </div>
    </div>
  );
}
