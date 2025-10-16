"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getToken, isLoggedIn } from "../utils/auth";

export default function ThoughtsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [thought, setThought] = useState("");
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");

  // Run once on mount: check login, fetch user, set greeting
  useEffect(() => {
    const init = async () => {
      // Redirect if not logged in
      if (!isLoggedIn()) {
        router.push("/login");
        return;
      }

      // Set time-based greeting
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 16) setGreeting("Good afternoon");
      else setGreeting("Good evening");

      // Fetch user profile
      // const token = getToken();
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:4000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(res.data.name || "User");
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  // Handle thought submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return router.push("/login");

    try {
      const res = await fetch("http://localhost:4000/api/thoughts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({content: thought }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Thought shared successfully!");
        setThought("");
      } else {
        setMessage(data.error || "Failed to share thought");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Page UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-2 text-center">
          {greeting}, {userName || "Guest"} 👋
        </h1>

        <h2 className="text-lg font-semibold mb-4 text-center text-gray-700">
          Share your thoughts
        </h2>

       {message && (
  <p
    className={`text-center mb-3 font-medium ${
      message.includes("success") ? "text-green-600" : "text-red-600"
    }`}
  >
    {message}
  </p>
)}
        <textarea
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          placeholder="What’s on your mind today?"
          className="w-full border p-2 rounded-lg mb-4 h-32 resize-none"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
        >
          Share Thought
        </button>
      </form>

      <button
        onClick={() => router.push("/savedThoughts")}
        className="mt-4 text-blue-600 underline cursor-pointer"
      >
        View All Thoughts
      </button>
    </div>
  );
}
