import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Auth({ setSession, darkMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Check your email to confirm signup!");
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-r from-blue-900 via-blue-500 to-black animate-gradientBackground"></div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 max-w-md w-full transition-colors transition-shadow">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 transition-colors">
          Welcome
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-4 rounded-xl w-full mb-4 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 transition-colors"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-4 rounded-xl w-full mb-4 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 transition-colors"
        />

        <div className="flex gap-2">
          <button
            onClick={handleSignIn}
            className="bg-blue-500 text-white px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-colors transition-shadow w-1/2"
          >
            Sign In
          </button>
          <button
            onClick={handleSignUp}
            className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-colors transition-shadow w-1/2"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
