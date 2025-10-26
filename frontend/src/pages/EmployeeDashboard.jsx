import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showLowStock, setShowLowStock] = useState(false);
  const LOW_STOCK_THRESHOLD = 10;

  const fetchProducts = useCallback(async () => {
    if (!user?.shopId) return;
    try {
      const response = await api.get(`/api/shops/${user.shopId}/products`);
      setProducts(response.data.products || []);
    } catch (err) {
      setError("Failed to fetch product data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const existingCategories = useMemo(() => {
    return ["All Categories", ...new Set(products.map((p) => p.category))].sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return (products || [])
      .filter((p) =>
        searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
      )
      .filter((p) =>
        selectedCategory !== "All Categories" ? p.category === selectedCategory : true
      )
      .filter((p) => (showLowStock ? p.stock < LOW_STOCK_THRESHOLD : true));
  }, [products, searchTerm, selectedCategory, showLowStock]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500 font-medium">
        Loading products...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
        Welcome, {user?.name}!
      </h1>

      <div className="bg-gradient-to-br from-teal-50 via-white to-orange-50 p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-4 text-teal-700">Product Availability</h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-400 focus:outline-none shadow-sm"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-400 focus:outline-none shadow-sm"
          >
            {existingCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              showLowStock
                ? "bg-red-500 text-white shadow-md"
                : "bg-orange-200 text-orange-800 hover:bg-orange-300 shadow-sm"
            }`}
          >
            {showLowStock ? "Showing Low Stock" : "Show Low Stock"}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-teal-100">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="hover:bg-orange-50 transition-colors duration-150"
                >
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(product.price)}
                  </td>
                  <td
                    className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold ${
                      product.stock <= (product.lowStockThreshold || LOW_STOCK_THRESHOLD)
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {product.stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <p className="text-center text-gray-500 p-4">No products match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
