import React, { useState } from "react";
import { trpc } from "../lib/trpc";
import { useLocation } from "wouter";

interface StudentForm {
  id?: string;
  name: string;
  username: string;
  password: string;
  totalLimit: number;
  remainingLimit: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const utils = trpc.useContext();

  const { data: students = [], isLoading } = trpc.getStudents.useQuery();

  const [form, setForm] = useState<StudentForm | null>(null);

  const saveMutation = trpc.saveStudent.useMutation({
    onSuccess: () => {
      utils.getStudents.invalidate();
      setForm(null);
    },
  });

  const deleteMutation = trpc.deleteStudent.useMutation({
    onSuccess: () => {
      utils.getStudents.invalidate();
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocation("/");
  };

  const handleStartCreate = () => {
    setForm({
      name: "",
      username: "",
      password: "",
      totalLimit: 5,
      remainingLimit: 5,
    });
  };

  const handleStartEdit = (student: any) => {
    setForm({
      id: student.id,
      name: student.name,
      username: student.username,
      password: student.password,
      totalLimit: student.totalLimit,
      remainingLimit: student.remainingLimit,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    saveMutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="bg-indigo-600 text-white text-xs px-2.5 py-1 rounded font-bold">Admin</span>
          <h1 className="text-xl font-bold text-slate-800">學生閱讀權限與篇數管理控制台</h1>
        </div>
        <button
          onClick={handleLogout}
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          登出系統
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側清單 */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">學生帳號清單</h2>
              <button
                onClick={handleStartCreate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                + 新增學生
              </button>
            </div>

            {isLoading ? (
              <p className="text-slate-400 py-8 text-center">載入學生資料中...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
                      <th className="py-3 px-4">學生姓名</th>
                      <th className="py-3 px-4">帳號</th>
                      <th className="py-3 px-4">密碼</th>
                      <th className="py-3 px-4 text-center">總篇數</th>
                      <th className="py-3 px-4 text-center">剩餘篇數</th>
                      <th className="py-3 px-4 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {students.map((student: any) => (
                      <tr key={student.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-medium">{student.name}</td>
                        <td className="py-3.5 px-4">{student.username}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{student.password}</td>
                        <td className="py-3.5 px-4 text-center">{student.totalLimit}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-indigo-600">
                          {student.remainingLimit}
                        </td>
                        <td className="py-3.5 px-4 text-center space-x-2">
                          <button
                            onClick={() => handleStartEdit(student)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-xs px-2 py-1 rounded bg-indigo-50"
                          >
                            編輯
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`確定要刪除學生「${student.name}」嗎？`)) {
                                deleteMutation.mutate({ id: student.id });
                              }
                            }}
                            className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1 rounded bg-red-50"
                          >
                            刪除
                          </button>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          目前沒有學生帳號，請點擊右上角新增。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 右側表單 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-6">
              {form ? (form.id ? "編輯學生設定" : "新增學生帳號") : "學生設定面板"}
            </h2>

            {form ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">學生姓名</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">登入帳號</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">登入密碼</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">可用總篇數</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={form.totalLimit}
                      onChange={(e) => setForm({ ...form, totalLimit: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">剩餘篇數</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={form.remainingLimit}
                      onChange={(e) => setForm({ ...form, remainingLimit: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={saveMutation.isLoading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition"
                  >
                    {saveMutation.isLoading ? "儲存中..." : "儲存設定"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium px-4 py-2 rounded-lg text-sm transition"
                  >
                    取消
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-slate-400 text-sm text-center py-12">
                請選擇左側的學生進行編輯，或點選「+ 新增學生」。
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
