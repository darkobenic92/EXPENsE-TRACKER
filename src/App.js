import React, { useState, useEffect } from "react";
import Transactions from "./Transactions";
import { supabase } from "./supabaseClient";

export default function App() {
  const [session, setSession] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const currentSession = supabase.auth.getSession();
    currentSession.then(res => setSession(res.data.session));

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Generate floating particles
    const particleCount = 40;
    const particleArray = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      size: Math.random() * 6 + 2,
      left: Math.random() * window.innerWidth,
      duration: Math.random() * 20 + 10,
    }));
    setParticles(particleArray);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={darkMode ? "dark" : ""}>
      {/* Animated gradient background */}
      <div className="bg-animated" />

      {/* Floating particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}px`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-6xl glass p-6 animate-glow transition-colors">
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
              <h1 className="text-2xl font-bold mb-4">Welcome to Expense Tracker</h1>
              <button
                className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-colors transition-shadow animate-glow"
                onClick={async () => {
                  const email = prompt("Enter your email");
                  await supabase.auth.signInWithOtp({ email });
                  alert("Check your email for the magic link!");
                }}
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
