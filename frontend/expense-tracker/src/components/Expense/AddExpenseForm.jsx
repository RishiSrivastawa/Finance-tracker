import React, { useState } from "react";
import Input from "../Inputs/Input";
import EmojiPickerPopup from "../EmojiPickerPopup";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const AddExpenseForm = ({ onAddExpense }) => {
  const [income, setIncome] = useState({
    category: "",
    amount: "",
    date: "",
    icon: "",
  });

  const [receiptFile, setReceiptFile] = useState(null); 
  const [scanLoading, setScanLoading] = useState(false); 
  const [scanError, setScanError] = useState(""); 

  const handleChange = (key, value) => setIncome({ ...income, [key]: value });

  const handleScanReceipt = async () => {
    if (!receiptFile) {
      setScanError("Please select a receipt image first.");
      return;
    }

    setScanError("");
    setScanLoading(true);

    try {
      const formData = new FormData();
      formData.append("receipt", receiptFile); 

      const res = await axiosInstance.post(
        API_PATHS.EXPENSE.PARSE_RECEIPT,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { success, data, message } = res.data;

      if (!success) {
        setScanError(message || "Failed to scan receipt.");
        return;
      }

      
      setIncome((prev) => ({
        ...prev,
        category: data.category || prev.category,
        amount: data.amount != null ? data.amount : prev.amount,
        date: data.date || prev.date,
      }));
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setScanError(err.response.data.message);
      } else {
        setScanError("Error scanning receipt. Please try again.");
      }
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <div>
      <EmojiPickerPopup
        icon={income.icon}
        onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
      />

      <Input
        value={income.category}
        onChange={({ target }) => handleChange("category", target.value)}
        label="Category"
        placeholder="Rent, Groceries, etc"
        type="text"
      />
      <Input
        value={income.amount}
        onChange={({ target }) => handleChange("amount", target.value)}
        label="Amount"
        placeholder="1"
        type="number"
      />
      <Input
        value={income.date}
        onChange={({ target }) => handleChange("date", target.value)}
        label="Date"
        placeholder="1"
        type="date"
      />

  <div className="mt-4">
  <label className="block text-xs font-semibold text-slate-700 mb-1">
    Upload Receipt (optional)
  </label>

  {/* Upload Button */}
  <label
    htmlFor="receipt-upload"
    className="flex items-center justify-center gap-2 w-full cursor-pointer rounded-md border border-dashed border-slate-300 bg-slate-50 py-3 text-xs text-slate-600 hover:bg-slate-100"
  >
    📎 Click to upload receipt (image / PDF)
  </label>

  <input
    id="receipt-upload"
    type="file"
    accept="image/*,application/pdf"
    className="hidden"
    onChange={(e) => {
      setReceiptFile(e.target.files[0] || null);
      setScanError("");
    }}
  />

  {/* Selected file feedback */}
  {receiptFile && (
    <p className="mt-1 text-xs text-slate-500">
      Selected file: <span className="font-medium">{receiptFile.name}</span>
    </p>
  )}

  {/* Scan Button */}
  <button
    type="button"
    onClick={handleScanReceipt}
    disabled={!receiptFile || scanLoading}
    className={`mt-2 text-xs underline ${
      receiptFile
        ? "text-primary cursor-pointer"
        : "text-slate-400 cursor-not-allowed"
    }`}
  >
    {scanLoading ? "Scanning receipt..." : "Scan receipt to auto-fill"}
  </button>

  {/* Helper text */}
  {!receiptFile && (
    <p className="text-xs text-slate-400 mt-1">
      Upload a receipt to enable scanning
    </p>
  )}

  {scanError && (
    <p className="text-red-500 text-xs mt-1">{scanError}</p>
  )}
</div>


      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={() => onAddExpense(income)}
        >
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default AddExpenseForm;
