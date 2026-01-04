import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A855F7", "#F43F5E"];

export default function Transactions({ session, darkMode }) {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [total, setTotal] = useState(0);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (!error) setTransactions(data);
  };

  useEffect(() => {
    if (session) fetchTransactions();
  }, [session]);

  useEffect(() => {
    setTotal(transactions.reduce((sum, t) => sum + Number(t.amount), 0));
  }, [transactions]);

  const handleAdd = async () => {
    if (!title || !amount) return alert("Title and amount are required");

    const { error } = await supabase.from("transactions").insert([
      { user_id: session.user.id, title, amount, category },
    ]);

    if (!error) {
      setTitle("");
      setAmount("");
      setCategory("");
      fetchTransactions();
    }
  };

  const handleDelete = async (id) => {
    await supabase.from("transactions").delete().eq("id", id);
    fetchTransactions();
  };

  const pieData = Object.entries(
    transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const RADIAN = Math.PI / 180;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: Form + list */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 transition-colors transition-shadow relative overflow-hidden animate-glow">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 transition-colors">
          Add Transaction
        </h2>
        <input
          className="border p-4 rounded-xl w-full mb-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 transition-colors"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border p-4 rounded-xl w-full mb-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 transition-colors"
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          className="border p-4 rounded-xl w-full mb-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 transition-colors"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white p-3 rounded-xl shadow-md hover:shadow-lg transition-colors transition-shadow w-full mb-4"
          onClick={handleAdd}
        >
          Add Transaction
        </button>

        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-100 transition-colors">
                  {tx.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300 transition-colors">
                  {tx.category}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <p className="font-bold text-gray-800 dark:text-gray-100 transition-colors">
                  ${tx.amount}
                </p>
                <button
                  className="text-red-500 hover:text-red-600 transition-colors"
                  onClick={() => handleDelete(tx.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 flex flex-col items-center transition-colors transition-shadow relative overflow-hidden animate-glow">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 transition-colors">
          Expenses by Category
        </h2>
        <PieChart width={250} height={250}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={renderLabel}
            labelLine={false}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>

        <div className="mt-4 flex flex-wrap gap-2">
          {pieData.map((entry, index) => (
            <div key={index} className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-gray-800 dark:text-gray-100 transition-colors">
                {entry.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

