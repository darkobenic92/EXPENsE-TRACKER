import React, { useState, useEffect } from "react";
import Transactions from "./Transactions";
import { supabase } from "./supabaseClient";

export default function App() {
  const [session, setSession] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) setSession(null);
  };

  const handleAuth = async () => {
    const email = prompt("Enter your email:");
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: { emailRedirectTo: window.location.origin }
    });

    if (!error) alert("Check your email for the magic link!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="bg-animated" />

      <div className="min-h-screen w-full px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-colors"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          {session && (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-colors"
              onClick={handleLogout}
            >
              Log Out
            </button>
          )}
        </div>

        {!session ? (
          <div className="text-center text-gray-800 dark:text-gray-100">
            <h1 className="text-3xl font-bold mb-4">Welcome to Expense Tracker</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Sign in with your email to start tracking your expenses
            </p>
            <button
              className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-colors"
              onClick={handleAuth}
            >
              Sign In / Sign Up
            </button>
          </div>
        ) : (
          <Transactions session={session} darkMode={darkMode} />
        )}
      </div>
    </div>
  );
}
