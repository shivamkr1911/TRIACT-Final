import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import shopService from "../services/shopService";

const CreateOrder = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchProducts = useCallback(async () => {
    if (!user?.shopId) return;
    try {
      const fetchedProducts = await shopService.getProducts(user.shopId);
      setProducts(fetchedProducts);
    } catch (err) {
      setError("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const existingCategories = useMemo(() => {
    return ["All", ...new Set(products.map((p) => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let currentProducts = products;
    if (activeCategory !== "All") {
      currentProducts = currentProducts.filter(
        (p) => p.category === activeCategory
      );
    }
    if (searchTerm) {
      currentProducts = currentProducts.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return currentProducts;
  }, [products, activeCategory, searchTerm]);

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prevCart.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return prevCart;
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId) =>
    setCart(cart.filter((item) => item._id !== productId));

  const handleQuantityChange = (productId, newQuantity) => {
    const product = products.find((p) => p._id === productId);
    const numQuantity = parseInt(newQuantity, 10);
    if (numQuantity > 0 && numQuantity <= product.stock) {
      setCart(
        cart.map((item) =>
          item._id === productId ? { ...item, quantity: numQuantity } : item
        )
      );
    }
  };

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      setError("Cart is empty.");
      return;
    }
    setError(null);
    setSuccess(null);
    const orderData = {
      customerName,
      items: cart.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      })),
    };
    try {
      const result = await shopService.createOrder(user.shopId, orderData);
      setSuccess(`Order created! Invoice ID: ${result.invoice?._id || "N/A"}`);
      setCart([]);
      setCustomerName("Walk-in Customer");
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create order.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500 font-medium">
        Loading products...
      </div>
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
      {/* Products Section */}
      <div className="lg:col-span-2 flex flex-col space-y-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-indigo-50 backdrop-blur-md z-10 p-4 rounded-xl shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-2xl font-bold text-indigo-700">Products</h2>
          <input
            type="text"
            placeholder="Search product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full md:w-64"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 sticky top-24 bg-gradient-to-r from-purple-50 to-indigo-50 backdrop-blur-md z-10 p-3 rounded-xl shadow-md">
          {existingCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeCategory === category
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[65vh] overflow-y-auto pr-2 pt-2">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-2xl p-4 flex flex-col justify-between shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-200"
            >
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Stock: {product.stock}</p>
                <p className="text-indigo-600 font-bold text-lg mt-2">
                  ₹{(product.price || 0).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0}
                className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 transition-colors duration-200"
              >
                Add to Cart
              </button>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <p className="text-gray-500 col-span-full text-center mt-8">
              No products match your search.
            </p>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl shadow-xl flex flex-col">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Current Order</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto pr-2">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 shadow-sm transition-colors duration-150"
            >
              <div>
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-gray-500 text-sm">₹{(item.price || 0).toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                  className="w-16 text-center border rounded-md px-1 py-0.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  onClick={() => handleRemoveFromCart(item._id)}
                  className="text-red-500 hover:text-red-700 font-bold text-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <p className="text-gray-400 text-center mt-4">Your cart is empty.</p>
          )}
        </div>

        <hr className="my-4 border-gray-300" />

        <div className="flex justify-between font-bold text-xl text-gray-800">
          <span>Total:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>

        {error && <p className="text-red-500 text-center mt-3">{error}</p>}
        {success && <p className="text-green-500 text-center mt-3">{success}</p>}

        <button
          onClick={handleSubmitOrder}
          className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold transition-colors duration-200"
        >
          Create Order & Invoice
        </button>
      </div>
    </div>
  );
};

export default CreateOrder;
