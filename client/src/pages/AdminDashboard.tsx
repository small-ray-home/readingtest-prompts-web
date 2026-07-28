import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, Trash2, Edit2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Student {
  id: number;
  studentName: string;
  username: string;
  initialQuota: number;
  remainingQuota: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    studentName: '',
    username: '',
    password: '',
    quota: 20,
  });

  const [editQuota, setEditQuota] = useState(20);

  const createStudentMutation = trpc.admin.createStudent.useMutation();
  const updateQuotaMutation = trpc.admin.updateStudentQuota.useMutation();
  const deleteStudentMutation = trpc.admin.deleteStudent.useMutation();

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminLoggedIn');
    if (!isAdmin) {
      setLocation('/login');
      return;
    }

    loadStudents();
  }, [setLocation]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const utils = trpc.useUtils();
      const result = await utils.admin.getStudents.fetch();
      setStudents(result);
    } catch (error) {
      toast.error('載入學生列表失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminLoggedIn');
    toast.success('已登出');
    setLocation('/login');
  };

  const handleAddStudent = async () => {
    if (!formData.studentName || !formData.username || !formData.password) {
      toast.error('請填寫所有欄位');
      return;
    }

    try {
      await createStudentMutation.mutateAsync({
        studentName: formData.studentName,
        username: formData.username,
        password: formData.password,
        quota: formData.quota,
      });

      toast.success('學生已新增');
      setFormData({ studentName: '', username: '', password: '', quota: 20 });
      setShowAddDialog(false);
      await loadStudents();
    } catch (error) {
      toast.error('新增學生失敗');
    }
  };

  const handleUpdateQuota = async () => {
    if (!selectedStudent) return;

    try {
      await updateQuotaMutation.mutateAsync({
        studentId: selectedStudent.id,
        newQuota: editQuota,
      });

      toast.success('額度已更新');
      setShowEditDialog(false);
      await loadStudents();
    } catch (error) {
      toast.error('更新額度失敗');
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;

    try {
      await deleteStudentMutation.mutateAsync({
        studentId: selectedStudent.id,
      });

      toast.success('學生已刪除');
      setShowDeleteDialog(false);
      await loadStudents();
    } catch (error) {
      toast.error('刪除學生失敗');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">載入中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                管理員後台
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                共 {students.length} 名學生
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

      <main className="container max-w-6xl mx-auto px-4 py-12">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <CardTitle>學生管理</CardTitle>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>新增學生</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新增學生</DialogTitle>
                    <DialogDescription>
                      請填寫學生的基本資訊
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="studentName">學生名稱</Label>
                      <Input
                        id="studentName"
                        value={formData.studentName}
                        onChange={(e) =>
                          setFormData({ ...formData, studentName: e.target.value })
                        }
                        placeholder="例：張三"
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">帳號</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        placeholder="例：student001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">密碼</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="密碼"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quota">初始額度</Label>
                      <Input
                        id="quota"
                        type="number"
                        value={formData.quota}
                        onChange={(e) =>
                          setFormData({ ...formData, quota: parseInt(e.target.value) })
                        }
                        placeholder="20"
                      />
                    </div>
                    <Button onClick={handleAddStudent} className="w-full">
                      新增
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {students.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">
                  還沒有學生，點擊「新增學生」開始添加
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        學生名稱
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        帳號
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        初始額度
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        剩餘額度
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="py-3 px-4 text-slate-900 dark:text-white">
                          {student.studentName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {student.username}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {student.initialQuota}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold ${
                              student.remainingQuota > 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {student.remainingQuota}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedStudent(student);
                                setEditQuota(student.remainingQuota);
                                setShowEditDialog(true);
                              }}
                              className="gap-1"
                            >
                              <Edit2 className="w-4 h-4" />
                              編輯
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowDeleteDialog(true);
                              }}
                              className="gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              刪除
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改額度</DialogTitle>
            <DialogDescription>
              {selectedStudent?.studentName} 的剩餘額度
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editQuota">新額度</Label>
              <Input
                id="editQuota"
                type="number"
                value={editQuota}
                onChange={(e) =>
                  setEditQuota(parseInt(e.target.value))
                }
              />
            </div>
            <Button onClick={handleUpdateQuota} className="w-full">
              更新
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除？</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除 {selectedStudent?.studentName}？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStudent} className="bg-red-600 hover:bg-red-700">
              刪除
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
