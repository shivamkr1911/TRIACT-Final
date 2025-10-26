import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserIcon, EnvelopeIcon, LockClosedIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import authService from "../services/authService";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "owner",
    shopId: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const { name, email, password, role, shopId } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const userData = { name, email, password, role };
      if (role === "employee") {
        if (!shopId) {
          setError("Shop ID is required for employees.");
          return;
        }
        userData.shopId = shopId;
      }

      await authService.register(userData);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition duration-300">
        <h2 className="text-3xl font-extrabold text-center text-gray-800">
          Create your TRIACT account
        </h2>

        {error && (
          <p className="text-red-600 bg-red-100 border-l-4 border-red-500 p-3 rounded-md">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-600 bg-green-100 border-l-4 border-green-500 p-3 rounded-md">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="relative">
            <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              required
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              minLength="6"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
            />
          </div>

          {/* Role */}
          <div className="relative">
            <BuildingStorefrontIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              name="role"
              value={role}
              onChange={onChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
            >
              <option value="owner">Shop Owner</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          {/* Shop ID (conditional) */}
          {role === "employee" && (
            <div className="relative">
              <input
                type="text"
                name="shopId"
                value={shopId}
                onChange={onChange}
                required
                placeholder="Shop ID (Ask owner)"
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:from-indigo-600 hover:to-indigo-800 transition"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-center text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:text-indigo-500"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
