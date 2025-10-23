import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import shopService from "../services/shopService";

const ViewInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoices = useCallback(async () => {
    if (!user?.shopId) return;
    try {
      setLoading(true);
      const data = await shopService.getInvoices(user.shopId);
      setInvoices(data);
    } catch (err) {
      setError("Failed to fetch invoices.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  if (loading) return <div>Loading invoices...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Past Invoices</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Biller
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice._id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {invoice.orderId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {invoice.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {invoice.billerName || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {new Date(invoice.date).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {formatCurrency(invoice.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a
                    href={`http://localhost:3001${invoice.pdfPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No invoices found.</p>
        )}
      </div>
    </div>
  );
};

export default ViewInvoices;
