import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Generate a unique color for each category
const generateColors = (num) => {
  const colors = [];
  for (let i = 0; i < num; i++) {
    const hue = Math.floor((360 / num) * i); // evenly spaced hues
    colors.push(`hsl(${hue}, 70%, 60%)`); // vibrant HSL color
  }
  return colors;
};

const CategoryPieChart = ({ data }) => {
  const colors = generateColors(data.length);
  const borderColors = colors.map((c) => c.replace("60%", "40%")); // darker border

  const chartData = {
    labels: data.map((item) => item._id), // Category names
    datasets: [
      {
        label: "Sales (₹)",
        data: data.map((item) => item.totalSales),
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Sales by Category",
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default CategoryPieChart;
