import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import articles from '@/data/articles.json';
import { trpc } from '@/lib/trpc';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function StudentDashboard() {
  const [, setLocation] = useLocation();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentName, setStudentName] = useState('');
  const [remainingQuota, setRemainingQuota] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const viewArticleMutation = trpc.student.viewArticle.useMutation();

  useEffect(() => {
    // Get student info from localStorage
    const id = localStorage.getItem('studentId');
    const name = localStorage.getItem('studentName');
    const quota = localStorage.getItem('remainingQuota');

    if (!id || !name || quota === null) {
      setLocation('/login');
      return;
    }

    setStudentId(parseInt(id));
    setStudentName(name);
    setRemainingQuota(parseInt(quota));
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    localStorage.removeItem('remainingQuota');
    toast.success('已登出');
    setLocation('/login');
  };

  const handleViewArticle = (article: typeof articles[0]) => {
    if (remainingQuota <= 0) {
      toast.error('您已用完所有額度');
      return;
    }
    setSelectedArticle(article);
    setShowConfirmDialog(true);
  };

  const handleConfirmView = async () => {
    if (!selectedArticle || !studentId) return;

    setIsLoading(true);
    try {
      const result = await viewArticleMutation.mutateAsync({
        studentId,
        articleId: selectedArticle.id,
        articleTitle: selectedArticle.title,
      });

      if (result.success) {
        setRemainingQuota(result.remainingQuota);
        localStorage.setItem('remainingQuota', result.remainingQuota.toString());
        toast.success(`已使用一篇，剩餘 ${result.remainingQuota} 篇`);
        setShowConfirmDialog(false);
      }
    } catch (error) {
      toast.error('使用失敗，請稍後重試');
    } finally {
      setIsLoading(false);
    }
  };

  if (!studentId) {
    return <div>載入中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {studentName} 的閱讀提示
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                剩餘額度：<span className="font-bold text-blue-600 dark:text-blue-400">{remainingQuota}</span> 篇
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              登出
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article List */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-4">
                文章列表
              </h2>
              {articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => handleViewArticle(article)}
                  disabled={remainingQuota === 0}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                    selectedArticle?.id === article.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : remainingQuota === 0
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
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
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                        第 {selectedArticle.id} 篇
                      </div>
                      <CardTitle className="text-2xl text-slate-900 dark:text-white">
                        {selectedArticle.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        📖 閱讀提示
                      </h3>
                      <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-base whitespace-pre-wrap">
                        {selectedArticle.prompt}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        💡 提示：仔細閱讀提示中的重點，這些通常是出題老師最關注的核心內容。
                      </p>
                      {remainingQuota > 0 && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          ✓ 您還有 {remainingQuota} 篇額度可使用
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-200 dark:border-slate-700 border-2 border-dashed">
                <CardContent className="pt-16 pb-16 text-center">
                  <div className="space-y-4">
                    <div className="text-5xl">📚</div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {remainingQuota === 0 ? '額度已用完' : '選擇一篇文章開始'}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {remainingQuota === 0
                        ? '您已用完所有額度，請聯繫管理員'
                        : '點擊左側的文章標題，查看該篇的深度閱讀提示'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認使用額度？</AlertDialogTitle>
            <AlertDialogDescription>
              您即將查看「{selectedArticle?.title}」的提示。
              <br />
              <br />
              此操作將扣除 1 篇額度，您將剩餘 <span className="font-bold text-slate-900 dark:text-white">{remainingQuota - 1}</span> 篇。
              <br />
              <br />
              是否確認繼續？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmView} disabled={isLoading}>
              {isLoading ? '處理中...' : '確認使用'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
