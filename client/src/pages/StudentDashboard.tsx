import React, { useState, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { useLocation } from "wouter";

export default function StudentDashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setLocation("/");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [setLocation]);

  const { data: articles = [], isLoading } = trpc.getArticles.useQuery();

  const deductMutation = trpc.deductAndReadArticle.useMutation({
    onSuccess: (data) => {
      // 成功扣除額度後，即時更新 state 與 localStorage 狀態
      setUser(data.updatedStudent);
      localStorage.setItem("user", JSON.stringify(data.updatedStudent));
      // 載入該篇文章內容
      setSelectedArticle(data.article);
    },
    onError: (err) => {
      alert(err.message || "扣除額度失敗，請重新嘗試！");
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocation("/");
  };

  const handleSelectArticle = (article: any) => {
    if (!user) return;

    if (user.remainingLimit <= 0) {
      alert("您的剩餘篇數已用完，無法繼續觀看提示！");
      return;
    }

    // 跳出彈窗詢問是否使用
    const confirmUse = window.confirm(
      `進入此提示將會扣除 1 篇閱讀額度。\n目前剩餘額度：${user.remainingLimit} 篇\n\n請問是否要確定使用？`
    );

    if (confirmUse) {
      deductMutation.mutate({
        studentId: user.id,
        articleId: article.id,
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-indigo-50/50">
      {/* 頂部導覽列，最上面顯示剩下幾篇 */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">同學：{user.name}</h1>
        </div>

        <div className="flex items-center space-x-6">
          <div className="bg-indigo-50 border border-indigo-200 px-5 py-2 rounded-full flex items-center space-x-2">
            <span className="text-slate-600 text-sm font-medium">剩下幾篇：</span>
            <span
              className={`text-2xl font-extrabold ${
                user.remainingLimit > 0 ? "text-indigo-600" : "text-red-500"
              }`}
            >
              {user.remainingLimit}
            </span>
            <span className="text-slate-400 text-xs">/ {user.totalLimit} 篇</span>
          </div>

          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-slate-800 text-sm font-medium transition"
          >
            登出
          </button>
        </div>
      </header>

      {/* 內容區 */}
      <main className="max-w-4xl mx-auto p-8">
        {selectedArticle ? (
          /* 文章內頁 */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <button
              onClick={() => setSelectedArticle(null)}
              className="mb-6 text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center"
            >
              ← 返回文章清單
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-6">{selectedArticle.title}</h1>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap border-t border-slate-100 pt-6">
              {selectedArticle.content}
            </div>
          </div>
        ) : (
          /* 文章/提示列表 */
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">提示與文章專區</h2>
              <p className="text-slate-500 text-sm mt-1">
                請點選您要閱讀的篇章，點選後系統會詢問並扣除 1 篇額度。
              </p>
            </div>

            {isLoading ? (
              <p className="text-center py-12 text-slate-400">正在讀取內容...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article: any) => (
                  <div
                    key={article.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">{article.title}</h3>
                      <p className="text-slate-400 text-xs line-clamp-2">
                        點擊後解鎖詳細觀看內容...
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectArticle(article)}
                      disabled={user.remainingLimit <= 0 || deductMutation.isLoading}
                      className={`mt-6 w-full py-2.5 rounded-lg font-bold text-sm transition ${
                        user.remainingLimit > 0
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {user.remainingLimit > 0 ? "閱讀此篇 (扣除 1 篇額度)" : "剩餘額度不足"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
