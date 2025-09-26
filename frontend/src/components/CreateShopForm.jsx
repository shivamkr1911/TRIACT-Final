import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import shopService from "../services/shopService";

const CreateShopForm = () => {
  const { user, token } = useAuth();
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!shopName) {
      setError("Shop name is required.");
      return;
    }
    try {
      await shopService.createShop(token, { shopName, address });
      // This will reload the entire application, and the AuthContext
      // will now find the user with a shopId, showing the dashboard.
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create shop.");
    }
  };

  return (
    <div className="text-center mt-10 bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}!</h2>
      <p className="text-gray-600 mb-6">
        You don't have a shop yet. Please create one to get started.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div>
          <label className="block text-sm font-medium">Shop Name</label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Shop Address (Optional)
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows="3"
            className="mt-1 w-full border rounded-md px-3 py-2"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
        >
          Create My Shop
        </button>
      </form>
    </div>
  );
};

export default CreateShopForm;
