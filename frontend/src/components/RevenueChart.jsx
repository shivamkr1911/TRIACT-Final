import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item._id),
    datasets: [
      {
        label: "Revenue (₹)",
        data: data.map((item) => item.totalRevenue),
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(75, 192, 192, 0.4)");
          gradient.addColorStop(1, "rgba(75, 192, 192, 0)");
          return gradient;
        },
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#4B5563", // Tailwind gray-700
          font: {
            size: 14,
            weight: "500",
          },
        },
      },
      title: {
        display: true,
        text: "Revenue Trend (Last 30 Days)",
        color: "#111827", // Tailwind gray-900
        font: {
          size: 18,
          weight: "600",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "#111827",
        titleColor: "#F9FAFB",
        bodyColor: "#F9FAFB",
        padding: 10,
        cornerRadius: 6,
      },
    },
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    scales: {
      x: {
        ticks: {
          color: "#6B7280", // Tailwind gray-500
          font: { size: 12 },
        },
        grid: {
          color: "rgba(203, 213, 225, 0.3)", // Tailwind gray-300, subtle
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#6B7280",
          font: { size: 12 },
        },
        grid: {
          color: "rgba(203, 213, 225, 0.3)",
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Line options={options} data={chartData} />
    </div>
  );
};

export default RevenueChart;
