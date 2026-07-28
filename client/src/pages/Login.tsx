import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function Login() {
  const [, setLocation] = useLocation();
  const [role, setRole] = useState<'admin' | 'student' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const adminLoginMutation = trpc.auth.adminLogin.useMutation();
  const studentLoginMutation = trpc.auth.studentLogin.useMutation();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await adminLoginMutation.mutateAsync({
        username,
        password,
      });
      
      if (result.success) {
        // Store admin session in localStorage
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('adminLoggedIn', 'true');
        toast.success('管理員登入成功');
        setLocation('/admin');
      }
    } catch (error) {
      toast.error('登入失敗：帳號或密碼錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await studentLoginMutation.mutateAsync({
        username,
        password,
      });
      
      if (result.success) {
        // Store student session in localStorage
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('studentId', result.studentId.toString());
        localStorage.setItem('studentName', result.studentName);
        localStorage.setItem('remainingQuota', result.remainingQuota.toString());
        toast.success('學生登入成功');
        setLocation('/student');
      }
    } catch (error) {
      toast.error('登入失敗：帳號或密碼錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  if (role === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-3xl">閱讀測驗提示系統</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
              請選擇您的身份
            </p>
            <Button
              onClick={() => setRole('admin')}
              className="w-full h-12 text-lg"
              variant="default"
            >
              管理員登入
            </Button>
            <Button
              onClick={() => setRole('student')}
              className="w-full h-12 text-lg"
              variant="outline"
            >
              學生登入
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {role === 'admin' ? '管理員登入' : '學生登入'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={role === 'admin' ? handleAdminLogin : handleStudentLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">帳號</Label>
              <Input
                id="username"
                type="text"
                placeholder={role === 'admin' ? '管理員帳號' : '學生帳號'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                placeholder="密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {role === 'admin' && (
              <div className="bg-blue-50 dark:bg-slate-800 p-3 rounded text-sm text-slate-600 dark:text-slate-300">
                預設帳號：admin<br/>
                預設密碼：readingadmin
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setRole(null);
                  setUsername('');
                  setPassword('');
                }}
              >
                返回
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? '登入中...' : '登入'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
