import React, { useState } from "react";
import { trpc } from "../lib/trpc";
import { useLocation } from "wouter";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const loginMutation = trpc.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/student");
      }
    },
    onError: (err) => {
      setError(err.message || "登入失敗，請檢查帳號密碼是否正確。");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800">閱讀與提示系統</h1>
          <p className="text-slate-500 mt-2 text-sm">請登入您的帳號以繼續使用</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-2">
              帳號
            </label>
            <input
              type="text"
              required
              placeholder="請輸入帳號 (管理員: admin)"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-2">
              密碼
            </label>
            <input
              type="password"
              required
              placeholder="請輸入密碼 (管理員: readingadmin)"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow transition duration-200 disabled:opacity-50"
          >
            {loginMutation.isLoading ? "驗證登入中..." : "登入系統"}
          </button>
        </form>
      </div>
    </div>
  );
}
