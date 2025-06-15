// SalesPurchaseChart.jsx
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { format } from "date-fns";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const SPchart = () => {
  const [chartData, setChartData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [years, setYears] = useState([]);
  // utils/fetchMonthlySummaryByYear.js
const fetchMonthlySummaryByYear = async (selectedYear) => {
  const snapshot = await getDocs(collection(db, "invoices"));

  const summary = {};

  snapshot.forEach((doc) => {
    const data = doc.data();
    const date = data.createdAt?.toDate();
    const year = format(date, "yyyy");

    if (year !== selectedYear) return;

    const month = format(date, "MMM");
    const type = data.billType;
    const amount = data.grandTotal || 0;

    if (!summary[month]) {
      summary[month] = { sales: 0, purchase: 0 };
    }

    if (type === "sales") summary[month].sales += amount;
    if (type === "purchase") summary[month].purchase += amount;
  });

  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return monthOrder.map((month) => ({
    month,
    sales: summary[month]?.sales || 0,
    purchase: summary[month]?.purchase || 0,
  }));
};


  useEffect(() => {
    const fetchAvailableYears = async () => {
      const snapshot = await getDocs(collection(db, "invoices"));
      const yearSet = new Set();

      snapshot.forEach((doc) => {
        const date = doc.data().createdAt?.toDate();
        if (date) yearSet.add(date.getFullYear());
      });

      setYears(Array.from(yearSet).sort((a, b) => b - a).map(String));
    };

    fetchAvailableYears();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchMonthlySummaryByYear(selectedYear);
      const labels = data.map((d) => d.month);
      const sales = data.map((d) => d.sales);
      const purchases = data.map((d) => d.purchase);

      setChartData({
        labels,
        datasets: [
          {
            label: "Sales",
            data: sales,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderRadius: 5,
          },
          {
            label: "Purchase",
            data: purchases,
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderRadius: 5,
          },
        ],
      });
    };

    loadData();
  }, [selectedYear]);
const options = {
  responsive: true,
  plugins: {
    legend: { position: "top" },
    tooltip: {
      callbacks: {
        label: function (context) {
          const value = context.raw / 100000;
          return `${context.dataset.label}: ₹${value.toFixed(2)}L`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value) {
          return `₹${(value / 100000).toFixed(1)}L`;
        },
      },
      title: {
        display: true,
        text: "Amount (in Lakhs)",
      },
    },
  },
};


  return (
    <div className="w-full box-border p-2 mx-auto my-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Sales vs Purchase</h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-20 border p-2 rounded"
        >
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      {chartData && <Bar data={chartData} options={options} />}
    </div>
  );
};

export default SPchart;
