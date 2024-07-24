"use client";
import { useSetChain, useWallets } from "@web3-onboard/react";
import Signature from "./signaturepad";
import { useEffect, useState, useContext, createContext } from "react";
import {
  ContractStatus,
  contractType,
  employmentAgreement,
  rentalAgreement,
  Status,
} from "@/app/components/types";
import { PlusCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import EmploymentAgreementForm from "./employment_agreement_form";
import RentalAgreementForm from "./rental_agreement_form";
import RentalAgreementCard from "./rental_agreement_card";
import sample_rental_agreement from "./sample_rent_alagreement.json";
import EmploymentAgreementCard from "./employment_agreement_card";
import { ethers } from "ethers";
import { InspectCall } from "../page";
import { ContractType } from "hardhat/internal/hardhat-network/stack-traces/model";
export type SigContextType = {
  sigpadData: string;
  setSigpadData: (d: string) => void;
};
export type FormDataContextType = {
  finalFormData: any;
  setFinalFormData: (d: any) => void;
};
export type ModalContextType = {
  isModalOpen: boolean;
  setIsModalOpen: (d: boolean) => void;
};
export const SignaturepadContext = createContext<SigContextType>({
  sigpadData: "",
  setSigpadData: (d: string) => {},
});
export const FormDataContext = createContext<FormDataContextType>({
  finalFormData: {},
  setFinalFormData: (d: any) => {},
});

export const ModalContext = createContext<ModalContextType>({
  isModalOpen: false,
  setIsModalOpen: (d: boolean) => {},
});
export default function Dashboard(props: any) {
  const [connectedWallet] = useWallets();
  const [{ connectedChain }] = useSetChain();
  const actionMap = ["", "Sign", "End", "Terminate", "View"];
  const [sigpadData, setSigpadData] = useState<string>("");
  const [finalFormData, setFinalFormData] = useState<any>({});
  const provider = new ethers.providers.Web3Provider(connectedWallet.provider);
  const fetchContracts = async (id: string) => {
    const _signer = await provider.getSigner();
    const address = await _signer.getAddress();
    console.log(_signer, address, id);
    const response = await InspectCall(`contracts/${address}`, id);
    setContracts(response);
    console.log("response is ", response);
    return response;
  };

  const [contracts, setContracts] = useState<ContractStatus[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [currentContractStatus, setcurrentContractStatus] =
    useState<ContractStatus>();
  const [currentContract, setCurrentContract] = useState<
    employmentAgreement | rentalAgreement
  >();
  const [selectedContractType, setSelectedContractType] =
    useState<contractType | null>(null);
  useEffect(() => {
    if (connectedChain) fetchContracts(connectedChain?.id);
  }, [connectedWallet, connectedChain]);
  const handleViewAgreement = async (contractstatus: ContractStatus) => {
    if (!connectedChain) {
      alert(`no chain connected`);
      return;
    }
    setIsViewModalOpen(true);
    setSelectedContractType(contractstatus.contractType);
    setcurrentContractStatus(contractstatus);
  };
  const handleSignAgreement = (contract: ContractStatus) => {
    console.log("signing the document");
  };
  const handleEndAgreement = (contract: ContractStatus) => {
    console.log("ending agreement");
  };
  const handleTerminateAgreement = (contract: ContractStatus) => {
    console.log("terminating the agreement");
  };
  const handleAgreementAction = (contract: ContractStatus) => {
    switch (actionMap[contract.status]) {
      case "Sign":
        handleSignAgreement(contract);
        break;
      case "End":
        handleEndAgreement(contract);
        break;
      case "Terminate":
        handleTerminateAgreement(contract);
        break;
      default:
        handleViewAgreement(contract);
        break;
    }
  };
  return (
    <div className="overflow-y-auto">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Contracts</h1>
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4">Contract ID</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Type</th>
              <th className="py-2 px-4">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {contracts.length > 0
              ? contracts.map((_contractStatus) => (
                  <tr key={_contractStatus.id}>
                    <td className="py-2 px-4 border">{_contractStatus.id}</td>
                    <td className="py-2 px-4 border">
                      {Status[_contractStatus.status]}
                    </td>
                    <td className="py-2 px-4 border">
                      {contractType[_contractStatus.contractType]}
                    </td>
                    <td className="py-2 px-4 border">
                      <div className="flex flex-row justify-between">
                        <button
                          onClick={() => {
                            handleViewAgreement(_contractStatus);
                          }}
                          className=" bg-green-500 mx-2 px-5 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setcurrentContractStatus(_contractStatus);
                            setIsSignModalOpen(true);
                          }}
                          className="bg-sky-500 px-5 hover:bg-sky-700 text-white font-bold py-1 px-2 rounded"
                        >
                          {actionMap[_contractStatus.status]}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              : "No contracts to display"}
          </tbody>
        </table>

        <button
          onClick={() => setIsModalOpen(true)}
          className="floating-btn  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded-full fixed bottom-20 right-1/2 transform translate-x-1/2"
        >
          <PlusCircleIcon className="h-20 w-20 text-blue-500 stroke-slate-100 " />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-cyan-200 rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="bg-cyan-300 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start justify-center">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <div className="box-border bg-cyan-400 p-2 border-2 border-collapse  border-cyan-400 mt-3 flex flex-row justify-between text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3
                        className="text-lg leading-6 font-medium text-gray-900 self-center"
                        id="modal-title"
                      >
                        Create New Contract
                      </h3>
                      <XCircleIcon
                        onClick={() => {
                          setIsModalOpen(false);
                          setSelectedContractType(null);
                        }}
                        className="h-8 w-8 hover:scale-150 stroke-slate-500"
                      />
                    </div>
                    <div className="mt-2 flex flex-row justify-evenly">
                      <button
                        onClick={() => {
                          setSelectedContractType(contractType.employment);
                        }}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
                      >
                        Employment
                      </button>
                      <button
                        onClick={() => {
                          setSelectedContractType(contractType.rental);
                        }}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Rental
                      </button>
                    </div>
                    <FormDataContext.Provider
                      value={{ finalFormData, setFinalFormData }}
                    >
                      <SignaturepadContext.Provider
                        value={{ sigpadData, setSigpadData }}
                      >
                        <ModalContext.Provider
                          value={{ isModalOpen, setIsModalOpen }}
                        >
                          {selectedContractType !== null &&
                          selectedContractType == contractType.employment ? (
                            <EmploymentAgreementForm />
                          ) : (
                            <RentalAgreementForm />
                          )}
                        </ModalContext.Provider>
                      </SignaturepadContext.Provider>
                    </FormDataContext.Provider>
                    <div className="flex items-center justify-between mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedContractType(null);
                          setIsModalOpen(false);
                        }}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isViewModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-cyan-200 rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="bg-cyan-300 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start justify-center">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <div className="mt-3 flex flex-row justify-between text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3
                        className="text-lg leading-6 font-medium text-gray-900 self-center"
                        id="modal-title"
                      >
                        Contract Details
                      </h3>
                      <XCircleIcon
                        onClick={() => {
                          setIsViewModalOpen(false);
                          setSelectedContractType(null);
                        }}
                        className="h-8 w-8 hover:scale-150 stroke-slate-500"
                      />
                    </div>
                    <div className="flex justify-center">
                      {selectedContractType == contractType.employment ? (
                        <EmploymentAgreementCard
                          chainId={
                            connectedChain != null
                              ? connectedChain.id
                              : "0x7a69"
                          }
                          agreementId={currentContractStatus?.id}
                        />
                      ) : (
                        <RentalAgreementCard
                          agreement={currentContract as rentalAgreement}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsViewModalOpen(false);
                          setSelectedContractType(null);
                        }}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSignModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-cyan-200 rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="bg-cyan-300 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start justify-center">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <div className="mt-3 flex flex-row justify-between text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3
                        className="text-lg leading-6 font-medium text-gray-900 self-center"
                        id="modal-title"
                      >
                        Sign Contract
                      </h3>
                      <XCircleIcon
                        onClick={() => {
                          setIsSignModalOpen(false);
                        }}
                        className="h-8 w-8 hover:scale-150 stroke-slate-500"
                      />
                    </div>
                    <SignaturepadContext.Provider
                      value={{ sigpadData, setSigpadData }}
                    >
                      <Signature />
                    </SignaturepadContext.Provider>
                    <div className="flex items-center justify-between mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (currentContractStatus) {
                            handleAgreementAction(currentContractStatus);
                          }
                          setIsSignModalOpen(false);
                        }}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() =>
          console.log("the details are", finalFormData, sigpadData)
        }
      >
        Get Details
      </button>
    </div>
  );
}