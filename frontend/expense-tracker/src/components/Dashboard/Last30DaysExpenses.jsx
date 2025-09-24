import React, { useState, useEffect } from 'react';
import { prepareExpenseBarChartData } from '../../utils/helper';
import CustomBarChart from '../Charts/CustomBarChart';

const Last30DaysExpenses = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      console.log('Last30DaysExpenses - Raw data received:', data);
      const result = prepareExpenseBarChartData(data);
      console.log('Last30DaysExpenses - Processed chart data:', result);
      setChartData(result);
      setError(null);
    } catch (err) {
      console.error('Last30DaysExpenses - Error processing data:', err);
      setError('Error processing chart data');
    } finally {
      setLoading(false);
    }
  }, [data]);
  if (loading) {
    return (
      <div className="card col-span-1">
        <div className="flex items-center justify-between">
          <h5 className="text-lg">Last 30 Days Expenses</h5>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card col-span-1">
        <div className="flex items-center justify-between">
          <h5 className="text-lg">Last 30 Days Expenses</h5>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="card col-span-1">
        <div className="flex items-center justify-between">
          <h5 className="text-lg">Last 30 Days Expenses</h5>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No expense data available for the last 30 days</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card col-span-1">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Last 30 Days Expenses</h5>
      </div>
      <CustomBarChart data={chartData} />
    </div>
  );
};
export default Last30DaysExpenses;
