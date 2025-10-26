import React from "react";
import { useAuth } from "../hooks/useAuth";
import { CurrencyRupeeIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

const SalaryInfo = () => {
  const { user } = useAuth();

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0);

  const isPaid = user?.salary?.status === "paid";

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Salary Information</h1>

      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-8 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <CurrencyRupeeIcon className="w-10 h-10 text-indigo-600" />
            <div>
              <p className="text-gray-500 font-medium">Current Salary</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(user?.salary?.amount)}</p>
            </div>
          </div>
          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold text-sm ${
              isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {isPaid ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationCircleIcon className="w-5 h-5" />}
            <span>{isPaid ? "Paid" : "Due"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            <p className="text-gray-500 font-medium">Payment Method</p>
            <p className="mt-2 font-semibold text-gray-900">{user?.salary?.method || "Bank Transfer"}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            <p className="text-gray-500 font-medium">Last Payment Date</p>
            <p className="mt-2 font-semibold text-gray-900">{user?.salary?.lastPaid || "Not available"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryInfo;
