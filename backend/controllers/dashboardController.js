const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { Types } = require("mongoose");
// Dashboard Data
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    // It's crucial to use ObjectId for matching against `_id` or `ref` fields in MongoDB.
    const userObjectId = new Types.ObjectId(String(userId));

    // Use Promise.all to run independent queries in parallel for better performance.
    const [
      totalIncomeResult,
      totalExpenseResult,
      last60DaysIncomeTransactions,
      last30DaysExpenseTransactions,
      last5Income,
      last5Expense,
    ] = await Promise.all([
      Income.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Income.find({
        userId: userObjectId, // Use ObjectId
        date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
      }).sort({ date: -1 }),
      Expense.find({
        userId: userObjectId, // Use ObjectId
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }).sort({ date: -1 }),
      Income.find({ userId: userObjectId }).sort({ date: -1 }).limit(5), // Use ObjectId
      Expense.find({ userId: userObjectId }).sort({ date: -1 }).limit(5), // Use ObjectId
    ]);

    const totalIncome = totalIncomeResult[0]?.total || 0;
    const totalExpense = totalExpenseResult[0]?.total || 0;

    const incomeLast60Days = last60DaysIncomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const expenseLast30Days = last30DaysExpenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const lastTransactions = [
      ...last5Income.map((txn) => ({
        ...txn.toObject(),
        type: "income",
      })),
      ...last5Expense.map((txn) => ({
        ...txn.toObject(),
        type: "expense",
      })),
    ].sort((a, b) => b.date - a.date);

    res.json({
      totalBalance: totalIncome - totalExpense,
      totalIncome: totalIncome,
      totalExpenses: totalExpense,
      last30DaysExpenses: {
        total: expenseLast30Days, // <-- fixed typo here
        transactions: last30DaysExpenseTransactions,
      },
      last60DaysIncome: {
        total: incomeLast60Days,
        transactions: last60DaysIncomeTransactions,
      },
      recentTransactions: lastTransactions,
    });
  } catch (error) {
    console.error("Dashboard Error:", error); // Log the error for debugging
    res.status(500).json({ message: "Server Error" });
  }
};
