import React from "react";

const KpiCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex items-center space-x-4 transition-transform transform hover:scale-105 duration-200">
      {icon && (
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white text-2xl shadow-md">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
};

export default KpiCard;
