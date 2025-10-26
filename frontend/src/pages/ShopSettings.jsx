import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import shopService from "../services/shopService";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

const ShopSettings = () => {
  const { user, shopDetails, setShopDetails } = useAuth();
  const [formData, setFormData] = useState({ shopName: "", address: "" });
  const [message, setMessage] = useState("");
  const [copyButtonText, setCopyButtonText] = useState("Copy");

  useEffect(() => {
    if (shopDetails) {
      setFormData({
        shopName: shopDetails.shopName,
        address: shopDetails.address || "",
      });
    }
  }, [shopDetails]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const updatedShop = await shopService.updateShopDetails(user.shopId, formData);
      setShopDetails(updatedShop);
      setMessage("Shop details updated successfully!");
    } catch (error) {
      setMessage("Failed to update shop details.");
    }
  };

  const copyShopId = () => {
    navigator.clipboard.writeText(user.shopId);
    setCopyButtonText("Copied!");
    setTimeout(() => setCopyButtonText("Copy"), 2000);
  };

  if (!shopDetails) {
    return <div className="text-center mt-10 text-gray-500">Loading shop settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Shop Settings
      </h1>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {message && (
          <p className="text-center text-green-600 bg-green-50 p-2 rounded-md font-medium">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shop Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Shop Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your shop address"
            ></textarea>
          </div>

          {/* Shop ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Shop ID (for employees)
            </label>
            <div className="flex rounded-xl overflow-hidden shadow-sm">
              <input
                type="text"
                readOnly
                value={user.shopId}
                className="flex-1 bg-gray-100 px-4 py-2 text-gray-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={copyShopId}
                className="flex items-center space-x-1 px-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus:outline-none"
              >
                {copyButtonText === "Copied!" ? <CheckIcon className="w-5 h-5" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
                <span>{copyButtonText}</span>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShopSettings;
