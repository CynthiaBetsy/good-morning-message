"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getToken } from "../utils/auth";

interface Thought {
  _id: string;
  author: string;
  message: string;
  createdAt: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Redirect if not logged in
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }

    const token = getToken();

    const fetchThoughts = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/thoughts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch thoughts");
        }

        const data = await res.json();
        setThoughts(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchThoughts();
  }, [router]);

  return (
    <main className="min-h-screen bg-indigo-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Shared Thoughts 💭
          </h1>
          <button
            onClick={() => router.push("/thoughts")}
            className="bg-indigo-500 text-white px-2 py-2 rounded-lg hover:bg-indigo-600 transition"
          >
            Back to Share
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-600 mt-20">Loading thoughts...</p>
        ) : error ? (
          <p className="text-center text-red-500 mt-20">{error}</p>
        ) : thoughts.length === 0 ? (
          <p className="text-center text-gray-600 mt-20">
            No thoughts shared yet. Be the first to share one!
          </p>
        ) : (
          <div className="space-y-4">
            {thoughts.map((thought) => (
              <div
                key={thought._id}
                className="bg-white shadow-md rounded-xl p-4 border border-gray-100"
              >
                <p className="text-gray-800 mb-2 text-lg">{thought.message}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>@{thought.author}</span>
                  <span>
                    {new Date(thought.createdAt).toLocaleString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
