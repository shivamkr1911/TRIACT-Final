import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import shopService from "../services/shopService";

const ShopSettings = () => {
  const { user, shopDetails, setShopDetails } = useAuth();
  const [formData, setFormData] = useState({ shopName: "", address: "" });
  const [message, setMessage] = useState("");

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
      const updatedShop = await shopService.updateShopDetails(
        user.shopId,
        formData
      );
      setShopDetails(updatedShop);
      setMessage("Shop details updated successfully!");
    } catch (error) {
      setMessage("Failed to update shop details.");
    }
  };

  if (!shopDetails) {
    return <div>Loading shop settings...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Shop Settings</h1>
      {message && <p className="text-center mb-4 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Shop Name</label>
          <input
            type="text"
            name="shopName"
            value={formData.shopName}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Shop Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            className="mt-1 w-full border rounded-md px-3 py-2"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ShopSettings;
