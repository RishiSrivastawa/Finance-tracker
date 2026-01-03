const xlsx = require('xlsx');
const Expense = require("../models/Expense");
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Helper: init Gemini client only if API key exists
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Optional: parse receipt using Gemini + OCR
exports.parseReceipt = async (req, res) => {
  try {
    // 1. Check file
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No receipt file uploaded." });
    }

    // 2. Check if GEMINI_API_KEY configured
    if (!genAI) {
      return res.status(501).json({
        success: false,
        message:
          "Receipt scanning is not configured. (Missing GEMINI_API_KEY on server.)",
      });
    }

    const filePath = req.file.path; // where multer stored it
    const mimeType = req.file.mimetype || "image/jpeg";
    const imageBuffer = fs.readFileSync(filePath);
    const base64 = imageBuffer.toString("base64");

const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });


    const prompt = `
You are a receipt parser. Extract the following from the receipt image:

- total amount paid (number)
- purchase date in ISO format YYYY-MM-DD
- main category (one of: Food, Groceries, Rent, Travel, Shopping, Bills, Other)
- a short text note/description.

Return ONLY valid JSON in this exact shape:
{
  "amount": number,
  "date": "YYYY-MM-DD",
  "category": "string",
  "note": "string"
}
No extra text, no markdown, no explanation. 
`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType,
        },
      },
      { text: prompt },
    ]);

    const responseText = result.response.text().trim();

    // Some models wrap JSON in ```json ``` fences – strip if present
    const cleaned = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("Failed to parse JSON from Gemini:", responseText);
      return res.status(500).json({
        success: false,
        message: "Could not understand receipt. Please fill manually.",
      });
    }

    // Normalize result
    const data = {
      amount:
        typeof parsed.amount === "string"
          ? parseFloat(parsed.amount)
          : parsed.amount,
      date: parsed.date || "",
      category: parsed.category || "",
      note: parsed.note || "",
    };

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in parseReceipt:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while scanning receipt.",
    });
  } finally {
    // (Optional) delete uploaded file to save space
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
  }
};


// Add Expense Source
exports.addExpense = async (req, res) => {
  const userId = req.user.id;
  try {
    const { icon, category, amount, date } = req.body;
    // Validation: Check for missing fields
    if (!category || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newExpense = new Expense({
      userId,
      icon,
      category,
      amount,
      date: new Date(date),
    });
    await newExpense.save();
    res.status(200).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
// Get All Expense Source
exports.getAllExpense = async (req, res) => {
  const userId = req.user.id;
  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
// Delete Expense Source
exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
// Download Excel
exports.downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });
    // Prepare data for Excel
    const data = expense.map((item) => ({
      Source: item.source,
      Amount: item.amount,
      Date: item.date,
    }));
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Expense");
    xlsx.writeFile(wb, 'expense_details.xlsx');
    res.download('expense_details.xlsx');
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
