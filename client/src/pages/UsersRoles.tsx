import { useState } from 'react';
import { useUsersAdmin, useUpdateUserRole } from '@/hooks/use-admin';
import { useTeachers, useUpdateTeacher } from '@/hooks/use-teachers';
import { useStudents } from '@/hooks/use-students';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function UsersRoles() {
  const [role, setRole] = useState<string>('');
  const [q, setQ] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [draftAssignedClasses, setDraftAssignedClasses] = useState<string[]>([]);
  const { data: users } = useUsersAdmin({ role: role || undefined, q: q || undefined });
  const updateRole = useUpdateUserRole();
  const { data: teachers = [] } = useTeachers();
  const { data: students = [] } = useStudents();
  const updateTeacher = useUpdateTeacher();
  const { toast } = useToast();

  const roles = ['gov_admin','school_admin','teacher','student'];

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId) || null;

  const teacherClassOptions = selectedTeacher
    ? Array.from(
        new Set(
          students
            .filter((s) => s.schoolId === selectedTeacher.schoolId)
            .map((s) => s.grade),
        ),
      ).sort()
    : [];

  const toggleClass = (grade: string) => {
    setDraftAssignedClasses((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade],
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight">Users & Roles</h1>
        <p className="text-muted-foreground">Search users and update their roles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="w-60">
            <Input placeholder="Search by name or username" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="w-60">
            <Select value={role === '' ? '__all__' : role} onValueChange={(v) => setRole(v === '__all__' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All</SelectItem>
                {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Batch Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-md">
            <Select
              value={selectedTeacherId ? String(selectedTeacherId) : '__none__'}
              onValueChange={(value) => {
                if (value === '__none__') {
                  setSelectedTeacherId(null);
                  setDraftAssignedClasses([]);
                  return;
                }
                const id = Number(value);
                setSelectedTeacherId(id);
                const teacher = teachers.find((t) => t.id === id);
                setDraftAssignedClasses(teacher?.assignedClasses || []);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select teacher</SelectItem>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.user?.name || t.user?.username || `Teacher ${t.id}`} ({t.subject})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTeacher && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Assign classes for <span className="font-medium text-foreground">{selectedTeacher.user?.name || `Teacher ${selectedTeacher.id}`}</span>
              </div>

              <div className="flex flex-wrap gap-2 border rounded-md p-3 min-h-14">
                {teacherClassOptions.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No class batches available for this teacher's school.</span>
                ) : (
                  teacherClassOptions.map((grade) => (
                    <label key={grade} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draftAssignedClasses.includes(grade)}
                        onChange={() => toggleClass(grade)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{grade}</span>
                    </label>
                  ))
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {(draftAssignedClasses || []).map((grade) => (
                  <Badge key={grade} variant="secondary">{grade}</Badge>
                ))}
                {(draftAssignedClasses || []).length === 0 && (
                  <span className="text-sm text-muted-foreground">No batches assigned.</span>
                )}
              </div>

              <Button
                disabled={updateTeacher.isPending}
                onClick={() => {
                  if (!selectedTeacher) return;
                  updateTeacher.mutate(
                    { id: selectedTeacher.id, data: { assignedClasses: draftAssignedClasses } as any },
                    {
                      onSuccess: () => {
                        toast({ title: 'Saved', description: 'Teacher batch assignment updated.' });
                      },
                      onError: (err: Error) => {
                        toast({ title: 'Error', description: err.message, variant: 'destructive' });
                      },
                    },
                  );
                }}
              >
                {updateTeacher.isPending ? 'Saving...' : 'Save Assignment'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>@{u.username}</TableCell>
                    <TableCell className="capitalize">{u.role.replace('_',' ')}</TableCell>
                    <TableCell>
                      <div className="w-48">
                        <Select defaultValue={u.role} onValueChange={(val) => updateRole.mutate({ id: u.id, role: val as any })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
