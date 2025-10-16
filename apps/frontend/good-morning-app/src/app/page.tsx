"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAuthData } from "./utils/auth";

interface SignupResponse {
  token?: string;
  message?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({
    text: "",
    type: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  // ✅ Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setMessage({ text: "", type: "" });

  try {
    const res = await fetch("http://localhost:4000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    console.log("Response status:", res.status);
    const text = await res.text();
    console.log("Raw response:", text);

    let data: SignupResponse & { user?: string } = {};
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Response was not valid JSON");
    }

    if (res.ok && data.token && data.user) {
      // ✅ Save both token and user info
      await saveAuthData(data.token, data.user);

      setMessage({
        text: data.message || "Signup successful! Redirecting...",
        type: "success",
      });

      // ✅ Redirect to thoughts page after short delay
      setTimeout(() => router.push("/thoughts"), 800);
    } else {
      setMessage({
        text: data.message || "Signup failed. Please try again.",
        type: "error",
      });
    }
  } catch (err) {
    console.error("Signup error:", err);
    setMessage({ text: "Something went wrong. Please try again.", type: "error" });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-2 text-center">
          Ready to Share Your Thoughts?
        </h1>
        <h2 className="text-xl font-semibold mb-4 text-center">Sign Up</h2>

        {message.text && (
          <p
            className={`text-center mb-3 ${
              message.type === "error" ? "text-red-500" : "text-green-600"
            }`}
          >
            {message.text}
          </p>
        )}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg mb-3"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg mb-3"
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg mb-3"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg mb-4"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 bg-blue-600 text-white p-2 rounded-lg transition ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            "Sign Up"
          )}
        </button>

        <p className="text-center mt-3 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
