import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChart({ chartData, optionsBar }) {
  console.log('chartData', chartData);
  return (
    <div className="chart-container w-100 h-100">
      <Bar

        data={chartData}
        options={optionsBar}
      />
    </div>
  );
}

export default BarChart;
