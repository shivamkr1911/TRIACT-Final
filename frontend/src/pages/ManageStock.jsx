import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import shopService from "../services/shopService";
import Modal from "../components/Modal.jsx";

const ManageStock = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [modalError, setModalError] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    cost: "",
    stock: "",
  });
  const [editFormData, setEditFormData] = useState({
    price: "",
    cost: "",
    stock: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showLowStock, setShowLowStock] = useState(false);
  const LOW_STOCK_THRESHOLD = 10;

  const existingCategories = useMemo(() => {
    return [
      "All Categories",
      ...new Set(products.map((p) => p.category)),
    ].sort();
  }, [products]);

  const fetchProducts = useCallback(async () => {
    if (!user?.shopId) return;
    try {
      setLoading(true);
      const [productsData, forecastData] = await Promise.all([
        shopService.getProducts(user.shopId),
        shopService.getForecast(user.shopId),
      ]);

      const forecastMap = new Map(
        forecastData.map((p) => [p._id, p.forecast])
      );

      const mergedProducts = productsData.map((p) => ({
        ...p,
        forecast: forecastMap.get(p._id) || null,
      }));

      setProducts(mergedProducts);
    } catch (err) {
      setPageError("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setModalError("");
    try {
      await shopService.addProduct(user.shopId, {
        ...newProduct,
        price: parseFloat(newProduct.price),
        cost: parseFloat(newProduct.cost),
        stock: parseInt(newProduct.stock, 10),
      });
      setIsAddModalOpen(false);
      setNewProduct({ name: "", category: "", price: "", cost: "", stock: "" });
      fetchProducts();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to add product.");
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setModalError("");
    const payload = { stock: parseInt(editFormData.stock, 10) };
    if (user.role === "owner") {
      payload.price = parseFloat(editFormData.price);
      payload.cost = parseFloat(editFormData.cost);
    }
    try {
      await shopService.updateProduct(user.shopId, selectedProduct._id, payload);
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to update product.");
    }
  };

  const openEditModal = (product) => {
    setModalError("");
    setSelectedProduct(product);
    setEditFormData({
      price: product.price,
      cost: product.cost,
      stock: product.stock,
    });
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setModalError("");
    setNewProduct({ name: "", category: "", price: "", cost: "", stock: "" });
    setIsAddModalOpen(true);
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) =>
        searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
      )
      .filter((p) =>
        selectedCategory !== "All Categories" ? p.category === selectedCategory : true
      )
      .filter((p) => (showLowStock ? p.stock < LOW_STOCK_THRESHOLD : true));
  }, [products, searchTerm, selectedCategory, showLowStock]);

  if (loading) return <div className="text-center py-10 text-gray-500">Loading stock & forecast...</div>;
  if (pageError) return <div className="text-center text-red-500 py-10">{pageError}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Add Product Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Product">
        <form onSubmit={handleAddProduct} className="space-y-4">
          {modalError && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{modalError}</p>}
          {["name", "category", "price", "cost", "stock"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium capitalize">
                {field === "cost" ? "Cost (Purchase Price)" : field}
              </label>
              <input
                type={field === "name" || field === "category" ? "text" : "number"}
                step={field === "price" || field === "cost" ? "0.01" : undefined}
                value={newProduct[field]}
                onChange={(e) => setNewProduct({ ...newProduct, [field]: e.target.value })}
                required
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          ))}
          <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
            Add Product
          </button>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit: ${selectedProduct?.name}`}>
        <form onSubmit={handleEditProduct} className="space-y-4">
          {modalError && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{modalError}</p>}
          {["price", "cost", "stock"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium capitalize">{field === "cost" ? "Cost (Purchase Price)" : field}</label>
              <input
                type="number"
                step={field !== "stock" ? "0.01" : undefined}
                value={editFormData[field]}
                onChange={(e) => setEditFormData({ ...editFormData, [field]: e.target.value })}
                required
                disabled={user.role !== "owner" && field !== "stock"}
                className={`mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${user.role !== "owner" && field !== "stock" ? "bg-gray-200" : ""}`}
              />
            </div>
          ))}
          <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
            Save Changes
          </button>
        </form>
      </Modal>

      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Manage Stock</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {existingCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${showLowStock ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
          >
            {showLowStock ? "Showing Low Stock" : "Show All Stock"}
          </button>
        </div>
        <button onClick={openAddModal} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow transition">
          + Add New Product
        </button>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              {["Product", "Category", "Price", "Cost", "Stock", "Forecast (Days Left)", "Actions"].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => {
              const daysLeft = product.forecast?.daysUntilStockOut;
              let forecastText = daysLeft === undefined ? "..." : daysLeft === Infinity ? "N/A" : Math.floor(daysLeft);
              return (
                <tr key={product._id} className={`hover:bg-gray-50 transition ${product.stock < LOW_STOCK_THRESHOLD ? "bg-red-50/50 animate-pulse" : ""}`}>
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-gray-500">{product.category}</td>
                  <td className="px-6 py-4 text-gray-500">₹{(product.price || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-500">₹{(product.cost || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold">{product.stock}</td>
                  <td className={`px-6 py-4 font-bold ${daysLeft < 14 ? "text-red-600" : "text-gray-700"}`}>
                    <div className="flex items-center gap-2">
                      <span>{forecastText}</span>
                      {daysLeft !== undefined && daysLeft !== Infinity && (
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-2 bg-green-500" style={{ width: `${Math.min(daysLeft / 30, 1) * 100}%` }} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEditModal(product)} className="text-indigo-600 hover:text-indigo-900 font-medium">
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredProducts.length === 0 && <p className="text-center text-gray-500 mt-6">No products match your filters.</p>}
      </div>
    </div>
  );
};

export default ManageStock;
