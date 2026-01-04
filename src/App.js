import React, { useState, useEffect } from "react";
import Transactions from "./Transactions";
import { supabase } from "./supabaseClient";

export default function App() {
  const [session, setSession] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [particles, setParticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Generate floating particles
    const particleCount = 40;
    const particleArray = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      size: Math.random() * 6 + 2,
      left: Math.random() * 100,
      duration: Math.random() * 20 + 10,
    }));
    setParticles(particleArray);

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Error logging out: " + error.message);
    } else {
      setSession(null);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleAuth = async () => {
    const email = prompt("Enter your email:");
    if (!email) return;

    // Auto-detect redirect URL for local vs GitHub Pages
    const redirectUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://darkobenic92.github.io/EXPENSE-TRACKER";

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl },
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Check your email for the magic link!");
    }
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
      {/* Animated background */}
      <div className="bg-animated" />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-7xl glass p-6 animate-glow transition-colors">
          <div className="flex justify-between items-center mb-6">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-colors transition-shadow animate-glow"
              onClick={toggleDarkMode}
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
            {session && (
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-colors transition-shadow animate-glow"
                onClick={handleLogout}
              >
                Log Out
              </button>
            )}
          </div>

          {!session ? (
            <div className="text-center text-gray-800 dark:text-gray-100 transition-colors">
              <h1 className="text-2xl font-bold mb-4">
                Welcome to Expense Tracker
              </h1>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Sign in with your email to start tracking your expenses
              </p>
              <button
                className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-colors transition-shadow animate-glow"
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
    </div>
  );
}
