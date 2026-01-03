
const express = require("express");
const {
  addExpense,
  getAllExpense,
  deleteExpense,
  downloadExpenseExcel,
  parseReceipt, 
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/add", protect, addExpense);
router.get("/get", protect, getAllExpense);
router.get("/downloadexcel", protect, downloadExpenseExcel);
router.delete("/:id", protect, deleteExpense);

router.post(
  "/scan-receipt",
  protect,
  upload.single("receipt"),
  parseReceipt
);

module.exports = router;
