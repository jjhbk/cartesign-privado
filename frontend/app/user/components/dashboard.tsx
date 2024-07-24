"use client";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useWallets } from "@web3-onboard/react";
import Signature from "./signaturepad";
import { useEffect, useState } from "react";
import { ContractStatus, contractType } from "@/app/components/types";
import {
  LockClosedIcon,
  PlusCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import EmploymentAgreementForm from "./employment_agreement_form";
import RentalAgreementForm from "./rental_agreement_form";
export default function Dashboard() {
  const [connectedWallet] = useWallets();
  console.log(connectedWallet.accounts);

  const fetchContracts = async (): Promise<ContractStatus[]> => {
    // Replace this with your actual API call
    const response = [
      '{"id":"1","contractType":"Type A","status":"Active"}',
      '{"id":"2","contractType":"Type B","status":"Pending"}',
      '{"id":"3","contractType":"Type C","status":"Expired"}',
    ];

    return response.map((item) => JSON.parse(item));
  };

  const [contracts, setContracts] = useState<ContractStatus[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContractType, setSelectedContractType] =
    useState<contractType | null>(null);
  useEffect(() => {
    const getContracts = async () => {
      const data = await fetchContracts();
      setContracts(data);
    };
    getContracts();
  }, []);

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
            {contracts.map((contract) => (
              <tr key={contract.id}>
                <td className="py-2 px-4 border">{contract.id}</td>
                <td className="py-2 px-4 border">{contract.status}</td>
                <td className="py-2 px-4 border">{contract.contractType}</td>
                <td className="py-2 px-4 border">
                  <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded">
                    View
                  </button>
                </td>
              </tr>
            ))}
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
                <div className="sm:flex sm:items-start">
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
                        onClick={() =>
                          setSelectedContractType(contractType.employment)
                        }
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
                      >
                        Employment
                      </button>
                      <button
                        onClick={() =>
                          setSelectedContractType(contractType.rental)
                        }
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Rental
                      </button>
                    </div>
                    {selectedContractType !== null &&
                    selectedContractType == contractType.employment ? (
                      <EmploymentAgreementForm />
                    ) : (
                      <RentalAgreementForm />
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedContractType(null);
                          setIsModalOpen(false);
                        }}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
