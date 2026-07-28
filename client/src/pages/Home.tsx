import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import articles from '@/data/articles.json';

export default function Home() {
  let { user, loading, error, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">閱讀測驗提示</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">20 篇精選文章的深度閱讀指南</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article List */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-4">文章列表</h2>
              {articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                    selectedArticle?.id === article.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-medium">{article.title}</span>
                  {selectedArticle?.id === article.id && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Display */}
          <div className="lg:col-span-2">
            {selectedArticle ? (
              <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">第 {selectedArticle.id} 篇</div>
                      <CardTitle className="text-2xl text-slate-900 dark:text-white">{selectedArticle.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">📖 閱讀提示</h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                        {selectedArticle.prompt}
                      </p>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        💡 提示：仔細閱讀提示中的重點，這些通常是出題老師最關注的核心內容。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-200 dark:border-slate-700 border-2 border-dashed">
                <CardContent className="pt-16 pb-16 text-center">
                  <div className="space-y-4">
                    <div className="text-5xl">📚</div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">選擇一篇文章開始</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      點擊左側的文章標題，查看該篇的深度閱讀提示
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
