import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import shopService from "../services/shopService";

const CreateShopForm = () => {
  const { user, token, logout } = useAuth();
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isShopCreated, setIsShopCreated] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!shopName) {
      setError("Shop name is required.");
      return;
    }
    try {
      await shopService.createShop(token, { shopName, address });
      setIsShopCreated(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create shop.");
    }
  };

  if (isShopCreated) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-green-500 text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Shop Created!</h2>
        <p className="text-gray-700 mb-4">
          Your shop <span className="font-semibold">"{shopName}"</span> is ready.
        </p>
        <p className="text-gray-500 mb-6 text-sm">
          Log out and log back in to access your new dashboard.
        </p>
        <button
          onClick={logout}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-all duration-200"
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Welcome, {user.name}!</h2>
      <p className="text-gray-600 mb-6 text-center">
        You don’t have a shop yet. Create one to get started.
      </p>
      {error && (
        <p className="text-red-500 text-center text-sm mb-4">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shop Name
          </label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your shop name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shop Address (Optional)
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows="3"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your shop address"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-all duration-200"
        >
          Create My Shop
        </button>
      </form>
    </div>
  );
};

export default CreateShopForm;
