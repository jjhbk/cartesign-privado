import { Checkbox } from "@material-ui/core";
import { useState } from "react";

export enum Currency {
  USD = 1,
  INR,
  EUR,
}

export enum Status {
  Active = 1,
  InProcess,
  Inactive,
  Terminated,
}

export enum ContractType {
  Employment = 1,
  Rental,
}

export enum TerminationReasons {
  GrossMisconduct = 1,
  ViolationOfCompanyPolicy,
  Fraud,
  PoorPerformance,
  Redundancy,
  MutualAgreement,
  ContractExpired,
  Other,
}

export type User = {
  name: string;
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  wallet: string;
};

export type Signature = {
  name: string;
  title: string;
  timestamp: number;
  physical_signature: string;
  digital_signature: string;
};

export type Termination = {
  noticePeriodDays: number;
  reason: TerminationReasons;
  signatures: {
    contractor: Signature;
    contractee: Signature;
  };
};

export type Property = {
  address: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  total_area_sqft: number;
};

export type RentalAgreement = {
  agreementId: string;
  contractType: ContractType;
  contractCreator: string;
  status: Status;
  property: Property;
  contractor: User;
  contractee: User;
  leaseTerms: {
    startDate: string;
    endDate: string;
    rent: {
      amount: number;
      currency: Currency;
      dueDate: number;
    };
    securityDeposit: {
      amount: number;
      currency: Currency;
    };
    lateFee: {
      amount: number;
      currency: Currency;
      gracePeriod: number;
    };
  };
  utilities: {
    included: Array<string>;
    tenantResponsibilities: Array<string>;
  };
  maintenance: {
    landlordResponsibility: Array<string>;
    tenantResponsibility: Array<string>;
  };
  rules: {
    petsAllowed: boolean;
    smokingAllowed: boolean;
    sublettingAllowed: boolean;
  };
  termination: Termination;
  signatures: {
    contractorSignature: Signature;
    contracteeSignature: Signature;
  };
};

const RentalAgreementForm = () => {
  const [formData, setFormData] = useState<RentalAgreement>({
    agreementId: "",
    contractType: ContractType.Rental,
    contractCreator: "",
    status: Status.Active,
    property: {
      address: "",
      property_type: "",
      bedrooms: 0,
      bathrooms: 0,
      total_area_sqft: 0,
    },
    contractor: {
      name: "",
      contact: {
        address: "",
        phone: "",
        email: "",
      },
      wallet: "",
    },
    contractee: {
      name: "",
      contact: {
        address: "",
        phone: "",
        email: "",
      },
      wallet: "",
    },
    leaseTerms: {
      startDate: "",
      endDate: "",
      rent: {
        amount: 0,
        currency: Currency.USD,
        dueDate: 1,
      },
      securityDeposit: {
        amount: 0,
        currency: Currency.USD,
      },
      lateFee: {
        amount: 0,
        currency: Currency.USD,
        gracePeriod: 0,
      },
    },
    utilities: {
      included: [],
      tenantResponsibilities: [],
    },
    maintenance: {
      landlordResponsibility: [],
      tenantResponsibility: [],
    },
    rules: {
      petsAllowed: false,
      smokingAllowed: false,
      sublettingAllowed: false,
    },
    termination: {
      noticePeriodDays: 0,
      reason: TerminationReasons.Other,
      signatures: {
        contractor: {
          name: "",
          title: "",
          timestamp: Date.now(),
          physical_signature: "",
          digital_signature: "",
        },
        contractee: {
          name: "",
          title: "",
          timestamp: Date.now(),
          physical_signature: "",
          digital_signature: "",
        },
      },
    },
    signatures: {
      contractorSignature: {
        name: "",
        title: "",
        timestamp: Date.now(),
        physical_signature: "",
        digital_signature: "",
      },
      contracteeSignature: {
        name: "",
        title: "",
        timestamp: Date.now(),
        physical_signature: "",
        digital_signature: "",
      },
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    console.log(name, value, type);

    const nameParts = name.split(".");

    const updateNestedState = (
      parts: string[],
      state: any,
      newValue: any
    ): any => {
      if (parts.length === 1) {
        if (type == "checkbox") {
          newValue = !state[parts[0]];
        }
        return {
          ...state,
          [parts[0]]: newValue,
        };
      }

      return {
        ...state,
        [parts[0]]: updateNestedState(
          parts.slice(1),
          state[parts[0]],
          newValue
        ),
      };
    };
    setFormData((prevState) => updateNestedState(nameParts, prevState, value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="container mx-auto p-4">
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-4">Rental Agreement Form</h2>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="agreementId"
          >
            Agreement ID
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="agreementId"
            type="text"
            name="agreementId"
            value={formData.agreementId}
            onChange={handleChange}
            placeholder="Enter Agreement ID"
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contractType"
          >
            Contract Type
          </label>
          <select
            id="contractType"
            name="contractType"
            value={formData.contractType}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={ContractType.Employment}>Employment</option>
            <option value={ContractType.Rental}>Rental</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contractCreator"
          >
            Contract Creator
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contractCreator"
            type="text"
            name="contractCreator"
            value={formData.contractCreator}
            onChange={handleChange}
            placeholder="Enter Contract Creator"
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="status"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={Status.Active}>Active</option>
            <option value={Status.InProcess}>In Process</option>
            <option value={Status.Inactive}>Inactive</option>
            <option value={Status.Terminated}>Terminated</option>
          </select>
        </div>

        <h3 className="text-xl font-bold mb-2">Property Information</h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="propertyAddress"
          >
            Address
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="propertyAddress"
            type="text"
            name="property.address"
            value={formData.property.address}
            onChange={handleChange}
            placeholder="Enter Property Address"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="propertyType"
          >
            Property Type
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="propertyType"
            type="text"
            name="property.property_type"
            value={formData.property.property_type}
            onChange={handleChange}
            placeholder="Enter Property Type"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="propertyBedrooms"
          >
            Bedrooms
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="propertyBedrooms"
            type="number"
            name="property.bedrooms"
            value={formData.property.bedrooms}
            onChange={handleChange}
            placeholder="Enter Number of Bedrooms"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="propertyBathrooms"
          >
            Bathrooms
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="propertyBathrooms"
            type="number"
            name="property.bathrooms"
            value={formData.property.bathrooms}
            onChange={handleChange}
            placeholder="Enter Number of Bathrooms"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="propertyTotalArea"
          >
            Total Area (sqft)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="propertyTotalArea"
            type="number"
            name="property.total_area_sqft"
            value={formData.property.total_area_sqft}
            onChange={handleChange}
            placeholder="Enter Total Area in sqft"
          />
        </div>

        <h3 className="text-xl font-bold mb-2">Contractor Information</h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contractorName"
          >
            Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contractorName"
            type="text"
            name="contractor.name"
            value={formData.contractor.name}
            onChange={handleChange}
            placeholder="Enter Contractor Name"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contractorPhone"
          >
            Phone
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contractorPhone"
            type="text"
            name="contractor.contact.phone"
            value={formData.contractor.contact.phone}
            onChange={handleChange}
            placeholder="Enter Contractor Phone"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contractorEmail"
          >
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contractorEmail"
            type="email"
            name="contractor.contact.email"
            value={formData.contractor.contact.email}
            onChange={handleChange}
            placeholder="Enter Contractor Email"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contractorAddress"
          >
            Address
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contractorAddress"
            type="text"
            name="contractor.contact.address"
            value={formData.contractor.contact.address}
            onChange={handleChange}
            placeholder="Enter Contractor Address"
          />
        </div>

        <h3 className="text-xl font-bold mb-2">Contractee Information</h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contracteeName"
          >
            Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contracteeName"
            type="text"
            name="contractee.name"
            value={formData.contractee.name}
            onChange={handleChange}
            placeholder="Enter Contractee Name"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contracteePhone"
          >
            Phone
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contracteePhone"
            type="text"
            name="contractee.contact.phone"
            value={formData.contractee.contact.phone}
            onChange={handleChange}
            placeholder="Enter Contractee Phone"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contracteeEmail"
          >
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contracteeEmail"
            type="email"
            name="contractee.contact.email"
            value={formData.contractee.contact.email}
            onChange={handleChange}
            placeholder="Enter Contractee Email"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contracteeAddress"
          >
            Address
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contracteeAddress"
            type="text"
            name="contractee.contact.address"
            value={formData.contractee.contact.address}
            onChange={handleChange}
            placeholder="Enter Contractee Address"
          />
        </div>

        <h3 className="text-xl font-bold mb-2">Lease Terms</h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="leaseStartDate"
          >
            Start Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="leaseStartDate"
            type="date"
            name="leaseTerms.startDate"
            value={formData.leaseTerms.startDate}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="leaseEndDate"
          >
            End Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="leaseEndDate"
            type="date"
            name="leaseTerms.endDate"
            value={formData.leaseTerms.endDate}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="rentAmount"
          >
            Rent Amount
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="rentAmount"
            type="number"
            name="leaseTerms.rent.amount"
            value={formData.leaseTerms.rent.amount}
            onChange={handleChange}
            placeholder="Enter Rent Amount"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="rentCurrency"
          >
            Rent Currency
          </label>
          <select
            id="rentCurrency"
            name="leaseTerms.rent.currency"
            value={formData.leaseTerms.rent.currency}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={Currency.USD}>USD</option>
            <option value={Currency.INR}>INR</option>
            <option value={Currency.EUR}>EUR</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="rentDueDate"
          >
            Rent Due Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="rentDueDate"
            type="number"
            name="leaseTerms.rent.dueDate"
            value={formData.leaseTerms.rent.dueDate}
            onChange={handleChange}
            placeholder="Enter Rent Due Date"
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="securityDepositAmount"
          >
            Security Deposit Amount
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="securityDepositAmount"
            type="number"
            name="leaseTerms.securityDeposit.amount"
            value={formData.leaseTerms.securityDeposit.amount}
            onChange={handleChange}
            placeholder="Enter Security Deposit Amount"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="securityDepositCurrency"
          >
            Security Deposit Currency
          </label>
          <select
            id="securityDepositCurrency"
            name="leaseTerms.securityDeposit.currency"
            value={formData.leaseTerms.securityDeposit.currency}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={Currency.USD}>USD</option>
            <option value={Currency.INR}>INR</option>
            <option value={Currency.EUR}>EUR</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="lateFeeAmount"
          >
            Late Fee Amount
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="lateFeeAmount"
            type="number"
            name="leaseTerms.lateFee.amount"
            value={formData.leaseTerms.lateFee.amount}
            onChange={handleChange}
            placeholder="Enter Late Fee Amount"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="lateFeeCurrency"
          >
            Late Fee Currency
          </label>
          <select
            id="lateFeeCurrency"
            name="leaseTerms.lateFee.currency"
            value={formData.leaseTerms.lateFee.currency}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={Currency.USD}>USD</option>
            <option value={Currency.INR}>INR</option>
            <option value={Currency.EUR}>EUR</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="gracePeriod"
          >
            Grace Period
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="gracePeriod"
            type="number"
            name="leaseTerms.lateFee.gracePeriod"
            value={formData.leaseTerms.lateFee.gracePeriod}
            onChange={handleChange}
            placeholder="Enter Grace Period"
          />
        </div>

        <h3 className="text-xl font-bold mb-2">Utilities</h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="utilitiesIncluded"
          >
            Included Utilities (comma separated)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="utilitiesIncluded"
            type="text"
            name="utilities.included"
            value={formData.utilities.included.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                utilities: {
                  ...formData.utilities,
                  included: e.target.value
                    .split(",")
                    .map((item) => item.trim()),
                },
              })
            }
            placeholder="Enter Included Utilities"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="tenantResponsibilities"
          >
            Tenant Responsibilities (comma separated)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="tenantResponsibilities"
            type="text"
            name="utilities.tenantResponsibilities"
            value={formData.utilities.tenantResponsibilities.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                utilities: {
                  ...formData.utilities,
                  tenantResponsibilities: e.target.value
                    .split(",")
                    .map((item) => item.trim()),
                },
              })
            }
            placeholder="Enter Tenant Responsibilities"
          />
        </div>

        <h3 className="text-xl font-bold mb-2">Maintenance</h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="landlordResponsibility"
          >
            Landlord Responsibilities (comma separated)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="landlordResponsibility"
            type="text"
            name="maintenance.landlordResponsibility"
            value={formData.maintenance.landlordResponsibility.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                maintenance: {
                  ...formData.maintenance,
                  landlordResponsibility: e.target.value
                    .split(",")
                    .map((item) => item.trim()),
                },
              })
            }
            placeholder="Enter Landlord Responsibilities"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="tenantResponsibility"
          >
            Tenant Responsibilities (comma separated)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="tenantResponsibility"
            type="text"
            name="maintenance.tenantResponsibility"
            value={formData.maintenance.tenantResponsibility.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                maintenance: {
                  ...formData.maintenance,
                  tenantResponsibility: e.target.value
                    .split(",")
                    .map((item) => item.trim()),
                },
              })
            }
            placeholder="Enter Tenant Responsibilities"
          />
        </div>

        <h3 className="text-xl font-bold mb-2">Rules</h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="petsAllowed"
          >
            Pets Alloweds
          </label>
          <input
            checked={formData.rules.petsAllowed}
            id="checked-checkbox"
            name="rules.petsAllowed"
            type="checkbox"
            value="off"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="smokingAllowed"
          >
            Smoking Allowed
          </label>
          <input
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            id="smokingAllowed"
            type="checkbox"
            name="rules.smokingAllowed"
            checked={formData.rules.smokingAllowed}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="sublettingAllowed"
          >
            Subletting Allowed
          </label>
          <input
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            id="sublettingAllowed"
            type="checkbox"
            name="rules.sublettingAllowed"
            checked={formData.rules.sublettingAllowed}
            onChange={handleChange}
          />
        </div>

        <h3 className="text-xl font-bold mb-2">Termination Information</h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="noticePeriodDays"
          >
            Notice Period (days)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="noticePeriodDays"
            type="number"
            name="termination.noticePeriodDays"
            value={formData.termination.noticePeriodDays}
            onChange={handleChange}
            placeholder="Enter Notice Period in Days"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="terminationReason"
          >
            Termination Reason
          </label>
          <select
            id="terminationReason"
            name="termination.reason"
            value={formData.termination.reason}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={TerminationReasons.GrossMisconduct}>
              Gross Misconduct
            </option>
            <option value={TerminationReasons.ViolationOfCompanyPolicy}>
              Violation of Company Policy
            </option>
            <option value={TerminationReasons.Fraud}>Fraud</option>
            <option value={TerminationReasons.PoorPerformance}>
              Poor Performance
            </option>
            <option value={TerminationReasons.Redundancy}>Redundancy</option>
            <option value={TerminationReasons.MutualAgreement}>
              Mutual Agreement
            </option>
            <option value={TerminationReasons.ContractExpired}>
              Contract Expired
            </option>
            <option value={TerminationReasons.Other}>Other</option>
          </select>
        </div>

        <h3 className="text-xl font-bold mb-2">Signatures</h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contractorSignature"
          >
            Contractor Signature
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contractorSignature"
            type="text"
            name="signatures.contractorSignature.name"
            value={formData.signatures.contractorSignature.name}
            onChange={handleChange}
            placeholder="Enter Contractor Signature"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contracteeSignature"
          >
            Contractee Signature
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contracteeSignature"
            type="text"
            name="signatures.contracteeSignature.name"
            value={formData.signatures.contracteeSignature.name}
            onChange={handleChange}
            placeholder="Enter Contractee Signature"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default RentalAgreementForm;
