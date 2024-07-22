import { useState } from "react";

export enum Currency {
  USD = 1,
  INR,
  EUR,
}

export enum Frequency {
  Weekly = 1,
  Biweekly,
  Monthly,
  Annualy,
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

export type EmploymentAgreement = {
  agreementId: string;
  contractType: ContractType;
  contractCreator: string;
  status: Status;
  contractor: User;
  contractee: User;
  position: {
    title: string;
    department: string;
    startDate: string;
    endDate: string;
    fulltime: boolean;
  };
  compensation: {
    salary: {
      amount: number;
      currency: Currency;
      frequency: Frequency;
    };
    bonuses: {
      eligibility: boolean;
      details: string;
      amount: number;
    };
    benefits: {
      healthInsurance: boolean;
      retirementPlan: boolean;
      paidTimeOff: {
        days: number;
        type: Frequency;
      };
    };
  };
  responsibilities: Array<string>;
  termination: Termination;
  signatures: {
    contractorSignature: Signature;
    contracteeSignature: Signature;
  };
};

const EmploymentAgreementForm = () => {
  const [formData, setFormData] = useState<EmploymentAgreement>({
    agreementId: "",
    contractType: ContractType.Rental,
    contractCreator: "",
    status: Status.Inactive,
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
    position: {
      title: "",
      department: "",
      startDate: "",
      endDate: "",
      fulltime: false,
    },
    compensation: {
      salary: {
        amount: 0,
        currency: Currency.USD,
        frequency: Frequency.Monthly,
      },
      bonuses: {
        eligibility: false,
        details: "",
        amount: 0,
      },
      benefits: {
        healthInsurance: false,
        retirementPlan: false,
        paidTimeOff: {
          days: 0,
          type: Frequency.Annualy,
        },
      },
    },
    responsibilities: [],
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
    let checked_value = false;
    if (type == "checkbox") {
      if (value == "on") {
        checked_value = true;
      } else {
        checked_value = false;
      }
    }
    const newValue = type === "checkbox" ? checked_value : value;

    setFormData((prevState) =>
      updateNestedState(nameParts, prevState, newValue)
    );
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
        <h2 className="text-2xl font-bold mb-4">Employment Agreement Form</h2>

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
            <option value={Status.Inactive}>Inactive</option>
          </select>
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

        <h3 className="text-xl font-bold mb-2">Position Information</h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="positionTitle"
          >
            Title
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="positionTitle"
            type="text"
            name="position.title"
            value={formData.position.title}
            onChange={handleChange}
            placeholder="Enter Position Title"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="positionDepartment"
          >
            Department
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="positionDepartment"
            type="text"
            name="position.department"
            value={formData.position.department}
            onChange={handleChange}
            placeholder="Enter Position Department"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="positionStartDate"
          >
            Start Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="positionStartDate"
            type="date"
            name="position.startDate"
            value={formData.position.startDate}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="positionEndDate"
          >
            End Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="positionEndDate"
            type="date"
            name="position.endDate"
            value={formData.position.endDate}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="positionFulltime"
          >
            Full-time
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="positionFulltime"
            type="checkbox"
            name="position.fulltime"
            checked={formData.position.fulltime}
            onChange={handleChange}
          />
        </div>

        <h3 className="text-xl font-bold mb-2">Compensation Information</h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="salaryAmount"
          >
            Salary Amount
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="salaryAmount"
            type="number"
            name="compensation.salary.amount"
            value={formData.compensation.salary.amount}
            onChange={handleChange}
            placeholder="Enter Salary Amount"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="salaryCurrency"
          >
            Salary Currency
          </label>
          <select
            id="salaryCurrency"
            name="compensation.salary.currency"
            value={formData.compensation.salary.currency}
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
            htmlFor="salaryFrequency"
          >
            Salary Frequency
          </label>
          <select
            id="salaryFrequency"
            name="compensation.salary.frequency"
            value={formData.compensation.salary.frequency}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={Frequency.Weekly}>Weekly</option>
            <option value={Frequency.Biweekly}>Bi-weekly</option>
            <option value={Frequency.Monthly}>Monthly</option>
            <option value={Frequency.Annualy}>Annually</option>
          </select>
        </div>

        <h3 className="text-xl font-bold mb-2">Bonuses</h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="bonusEligibility"
          >
            Eligibility
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="bonusEligibility"
            type="checkbox"
            name="compensation.bonuses.eligibility"
            checked={formData.compensation.bonuses.eligibility}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="bonusDetails"
          >
            Details
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="bonusDetails"
            type="text"
            name="compensation.bonuses.details"
            value={formData.compensation.bonuses.details}
            onChange={handleChange}
            placeholder="Enter Bonus Details"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="bonusAmount"
          >
            Amount
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="bonusAmount"
            type="number"
            name="compensation.bonuses.amount"
            value={formData.compensation.bonuses.amount}
            onChange={handleChange}
            placeholder="Enter Bonus Amount"
          />
        </div>

        <h3 className="text-xl font-bold mb-2">Benefits</h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="healthInsurance"
          >
            Health Insurance
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="healthInsurance"
            type="checkbox"
            name="compensation.benefits.healthInsurance"
            checked={formData.compensation.benefits.healthInsurance}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="retirementPlan"
          >
            Retirement Plan
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="retirementPlan"
            type="checkbox"
            name="compensation.benefits.retirementPlan"
            checked={formData.compensation.benefits.retirementPlan}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="paidTimeOffDays"
          >
            Paid Time Off Days
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="paidTimeOffDays"
            type="number"
            name="compensation.benefits.paidTimeOff.days"
            value={formData.compensation.benefits.paidTimeOff.days}
            onChange={handleChange}
            placeholder="Enter Paid Time Off Days"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="paidTimeOffFrequency"
          >
            Paid Time Off Frequency
          </label>
          <select
            id="paidTimeOffFrequency"
            name="compensation.benefits.paidTimeOff.type"
            value={formData.compensation.benefits.paidTimeOff.type}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={Frequency.Weekly}>Weekly</option>
            <option value={Frequency.Biweekly}>Bi-weekly</option>
            <option value={Frequency.Monthly}>Monthly</option>
            <option value={Frequency.Annualy}>Annually</option>
          </select>
        </div>

        <h3 className="text-xl font-bold mb-2">Responsibilities</h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="responsibilities"
          >
            List Responsibilities (comma separated)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="responsibilities"
            type="text"
            name="responsibilities"
            value={formData.responsibilities.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                responsibilities: e.target.value
                  .split(",")
                  .map((res) => res.trim()),
              })
            }
            placeholder="Enter Responsibilities"
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

export default EmploymentAgreementForm;
