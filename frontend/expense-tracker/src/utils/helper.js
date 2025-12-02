import moment from "moment";
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const getInitials = (name) => {
  if (!name) return "";
  const words = name.split(" ").filter(Boolean); // Remove empty strings
  let initials = "";
  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }
  return initials.toUpperCase();
};

export const addThousandsSeparator = (num) => {
  if (num == null || isNaN(num)) return "";
  const [integerPart, fractionalPart] = num.toString().split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fractionalPart
    ? `${formattedInteger}.${fractionalPart}`
    : formattedInteger;
};

export const prepareExpenseBarChartData = (data = []) => {
  console.log("prepareExpenseBarChartData - Input data:", data);

  if (!Array.isArray(data)) {
    console.warn("prepareExpenseBarChartData - Data is not an array:", data);
    return [];
  }

  const chartData = data
    .filter((item) => {
      const hasValidCategory =
        item?.category && typeof item.category === "string";
      const hasValidAmount =
        item?.amount && typeof item.amount === "number" && item.amount > 0;

      if (!hasValidCategory || !hasValidAmount) {
        console.warn(
          "prepareExpenseBarChartData - Invalid item filtered out:",
          item
        );
      }

      return hasValidCategory && hasValidAmount;
    })
.map((item) => {
  const dateObj = new Date(item.date);
  const month = dateObj.toLocaleString("default", { month: "short" }); // e.g. "Sep"
  return {
    month,
    amount: Number(item.amount),
  };
});


  console.log("prepareExpenseBarChartData - Final chart data:", chartData);
  return chartData;
};

export const prepareIncomeBarChartData = (data = []) => {
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const chartData = sortedData.map((item) => ({
    month: moment(item?.date).format("Do MMM"),
    amount: item?.amount,
    source: item?.source,
  }));
  return chartData;
};


export const prepareExpenseLineChartData = (data = []) => {
  const sortedData =[...data].sort(
    (a, b) => new Date(a.date) - new Date(b.date));
    const chartData = sortedData.map((item) => ({
      month: moment(item?.date).format("Do MMM"),
      amount: item?.amount,
      category: item?.category,
    }));
    return chartData;
};