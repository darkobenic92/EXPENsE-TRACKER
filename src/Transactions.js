import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A855F7", "#F43F5E"];

export default function Transactions({ session, darkMode }) {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    if (error) alert("Error loading transactions: " + error.message);
    else setTransactions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (session) fetchTransactions();
  }, [session]);

  const handleAdd = async () => {
    if (!title.trim() || !category.trim() || !amount || isNaN(amount)) {
      alert("Please fill all fields correctly");
      return;
    }

    const parsedAmount = parseFloat(amount);
    setLoading(true);
    const { error } = await supabase.from("transactions").insert([
      { user_id: session.user.id, title: title.trim(), amount: parsedAmount, category: category.trim() },
    ]);
    if (!error) {
      setTitle(""); setAmount(""); setCategory("");
      await fetchTransactions();
    } else alert("Error adding transaction: " + error.message);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (!error) await fetchTransactions();
    setLoading(false);
  };

  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const income = transactions.filter(t => Number(t.amount) > 0).reduce((sum, t) => sum + Number(t.amount), 0);
  const expenses = transactions.filter(t => Number(t.amount) < 0).reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const categoryTotals = transactions
    .filter(t => Number(t.amount) < 0) // only expenses
    .reduce((acc, t) => {
      const cat = t.category || "Uncategorized";
      acc[cat] = (acc[cat] || 0) + Math.abs(Number(t.amount));
      return acc;
    }, {});

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2))
  }));

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Balance", value: total, color: total >= 0 ? "text-green-500" : "text-red-500" },
          { label: "Income", value: income, color: "text-green-500" },
          { label: "Expenses", value: expenses, color: "text-red-500" },
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 text-center transition-colors animate-glow">
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{item.label}</p>
            <p className={`text-3xl font-bold ${item.color}`}>${item.value.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Form + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form + Transactions */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 flex flex-col transition-colors animate-glow">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Add Transaction</h2>
          <input
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border p-4 rounded-xl mb-2 w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-colors"
            disabled={loading}
          />
          <input
            placeholder="Amount (negative for expense)"
            type="number"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="border p-4 rounded-xl mb-2 w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-colors"
            disabled={loading}
          />
          <input
            placeholder="Category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border p-4 rounded-xl mb-2 w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-colors"
            disabled={loading}
          />
          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-blue-500 text-white p-3 rounded-xl shadow-md hover:bg-blue-600 transition-colors mb-4"
          >
            {loading ? "Processing..." : "Add Transaction"}
          </button>

          <div className="flex-1 overflow-y-auto border-t border-gray-200 dark:border-gray-600 pt-4 max-h-[500px]">
            {transactions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center">No transactions yet</p>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-600">
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-100">{tx.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{tx.category}</p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <p className={`font-bold ${tx.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {tx.amount >= 0 ? "+" : ""}{Number(tx.amount).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Pie Chart */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 flex flex-col items-center transition-colors animate-glow" style={{ minHeight: 500 }}>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Expenses by Category</h2>

          {pieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">No expense data to display</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={120}
                    label={renderLabel}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-3 justify-center">
                {pieData.map((entry, index) => {
                  const percent = expenses ? (entry.value / expenses) * 100 : 0;
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-sm text-gray-800 dark:text-gray-100">
                        {entry.name}: ${entry.value.toFixed(2)} ({percent.toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
