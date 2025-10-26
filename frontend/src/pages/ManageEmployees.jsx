import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import shopService from "../services/shopService";
import Modal from "../components/Modal.jsx";

const ManageEmployees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [modalError, setModalError] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    salary: { amount: "" },
  });

  const fetchEmployees = useCallback(async () => {
    if (!user?.shopId) return;
    try {
      setLoading(true);
      const data = await shopService.getEmployees(user.shopId);
      setEmployees(data);
    } catch (err) {
      setPageError("Failed to fetch employees.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount") {
      setFormData((prev) => ({
        ...prev,
        salary: { ...prev.salary, amount: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setModalError("");
    try {
      await shopService.addEmployee(user.shopId, {
        ...formData,
        salary: { amount: parseFloat(formData.salary.amount) },
      });
      setIsAddModalOpen(false);
      fetchEmployees();
    } catch (err) {
      setModalError(err.response?.data?.message || "An unknown error occurred.");
    }
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    setModalError("");
    try {
      const updatedSalary = {
        amount: parseFloat(formData.salary.amount),
        status: "pending",
      };
      await shopService.updateEmployee(user.shopId, selectedEmployee._id, {
        salary: updatedSalary,
      });
      setIsEditModalOpen(false);
      fetchEmployees();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to update salary.");
    }
  };

  const handleRemoveEmployee = async (employeeId) => {
    if (window.confirm("Are you sure you want to remove this employee?")) {
      try {
        await shopService.removeEmployee(user.shopId, employeeId);
        fetchEmployees();
      } catch (err) {
        setPageError("Failed to remove employee.");
      }
    }
  };

  const handlePaySalary = async (employee) => {
    try {
      await shopService.updateEmployee(user.shopId, employee._id, {
        salary: { status: "paid" },
      });
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetAllSalaries = async () => {
    if (
      window.confirm(
        'Are you sure you want to reset all employee salaries to "Due"?'
      )
    ) {
      try {
        const updatePromises = employees.map((emp) =>
          shopService.updateEmployee(user.shopId, emp._id, {
            salary: { status: "pending" },
          })
        );
        await Promise.all(updatePromises);
        fetchEmployees();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openEditModal = (employee) => {
    setModalError("");
    setSelectedEmployee(employee);
    setFormData({ salary: { amount: employee.salary.amount } });
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setModalError("");
    setFormData({ name: "", email: "", password: "", salary: { amount: "" } });
    setIsAddModalOpen(true);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500 font-medium">
        Loading employee data...
      </div>
    );
  if (pageError)
    return (
      <div className="text-red-500 text-center font-semibold mt-10">
        {pageError}
      </div>
    );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Modals */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          {modalError && (
            <p className="text-red-600 bg-red-50 p-2 rounded-md text-sm font-medium">
              {modalError}
            </p>
          )}
          <inputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            placeholder="John Doe"
          />
          <inputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleFormChange}
            placeholder="john@example.com"
          />
          <inputField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleFormChange}
            placeholder="••••••••"
          />
          <inputField
            label="Salary (₹)"
            name="amount"
            type="number"
            value={formData.salary.amount}
            onChange={handleFormChange}
            placeholder="5000"
          />
          <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-xl transition">
            Add Employee
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Salary for ${selectedEmployee?.name}`}
      >
        <form onSubmit={handleEditEmployee} className="space-y-4">
          {modalError && (
            <p className="text-red-600 bg-red-50 p-2 rounded-md text-sm font-medium">
              {modalError}
            </p>
          )}
          <inputField
            label="New Salary (₹)"
            name="amount"
            type="number"
            value={formData.salary.amount}
            onChange={handleFormChange}
          />
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl transition">
            Save Changes
          </button>
        </form>
      </Modal>

      {/* Header + Actions */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold text-gray-800">Manage Employees</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleResetAllSalaries}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium transition"
          >
            Reset All to Due
          </button>
          <button
            onClick={openAddModal}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-medium transition"
          >
            + Add New Employee
          </button>
        </div>
      </div>

      {/* Employee Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {["Name", "Email", "Salary", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr
                key={employee._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-800">
                  {employee.name}
                </td>
                <td className="px-6 py-4 text-gray-500">{employee.email}</td>
                <td className="px-6 py-4 text-gray-700">
                  ₹{(employee.salary.amount || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 inline-flex text-xs font-semibold leading-5 rounded-full ${
                      employee.salary.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {employee.salary.status === "paid" ? "Paid" : "Due"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-3 text-sm font-medium">
                  {employee.salary.status === "pending" && (
                    <button
                      onClick={() => handlePaySalary(employee)}
                      className="text-green-600 hover:text-green-900 transition"
                    >
                      Pay Salary
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(employee)}
                    className="text-teal-600 hover:text-teal-900 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveEmployee(employee._id)}
                    className="text-red-600 hover:text-red-900 transition"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {employees.length === 0 && (
          <p className="text-center p-6 text-gray-500">
            No employees found. Add one to get started!
          </p>
        )}
      </div>
    </div>
  );
};

// Reusable input component for cleaner forms
const inputField = ({ label, name, value, onChange, type = "text", placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
    />
  </div>
);

export default ManageEmployees;
