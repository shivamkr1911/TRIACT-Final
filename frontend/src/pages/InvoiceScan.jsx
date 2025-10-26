import React, { useState } from "react";
import Tesseract from "tesseract.js";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

const InvoiceScan = () => {
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle, processing, complete
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
      setOcrText("");
      setResults([]);
      setProgress(0);
      setStatus("idle");
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setStatus("processing");
    setError("");

    const {
      data: { text },
    } = await Tesseract.recognize(image, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProgress(Math.round(m.progress * 100));
        }
      },
    });

    setOcrText(text);

    try {
      const response = await api.post(`/api/scan`, { extractedText: text });
      setResults(response.data.results);
      setStatus("complete");
    } catch (err) {
      setError("Failed to analyze invoice data on the backend.");
      setStatus("idle");
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold text-gray-800">Scan New Invoice</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Uploader & Preview */}
        <div className="bg-gradient-to-br from-teal-50 via-white to-orange-50 p-6 rounded-2xl shadow-xl space-y-4">
          <h2 className="text-xl font-semibold text-teal-700">Upload Invoice Image</h2>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200"
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Invoice preview"
              className="mt-4 rounded-lg max-h-80 object-contain border border-gray-200 shadow-sm"
            />
          )}
          <button
            onClick={handleScan}
            disabled={!image || status === "processing"}
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-bold hover:bg-teal-700 disabled:bg-gray-400 shadow-md transition-colors duration-200"
          >
            {status === "processing" ? `Scanning... ${progress}%` : "Scan Invoice"}
          </button>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-teal-50 via-white to-orange-50 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-semibold text-teal-700">Analysis Results</h2>
          {ocrText && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-600">Raw Extracted Text:</h3>
              <pre className="mt-2 p-2 bg-gray-100 rounded-md text-xs text-gray-700 whitespace-pre-wrap h-32 overflow-y-auto">
                {ocrText}
              </pre>
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}
          {results.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 mt-4 rounded-lg shadow-sm overflow-hidden">
              <thead className="bg-teal-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider">
                    Detected Item
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider">
                    Inventory Match
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr key={index} className="hover:bg-orange-50 transition-colors duration-150">
                    <td className="py-2 px-4 text-sm text-gray-900">
                      {result.parsedName} (Qty: {result.parsedQuantity})
                    </td>
                    <td className="py-2 px-4 text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          result.status === "MATCHED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {result.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {result.matchedProduct?.name || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 mt-4">
              Results will appear here after scanning.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceScan;
