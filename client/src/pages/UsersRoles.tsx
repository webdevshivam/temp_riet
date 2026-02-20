import { useState } from 'react';
import { useUsersAdmin, useUpdateUserRole } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function UsersRoles() {
  const [role, setRole] = useState<string>('');
  const [q, setQ] = useState('');
  const { data: users } = useUsersAdmin({ role: role || undefined, q: q || undefined });
  const updateRole = useUpdateUserRole();

  const roles = ['gov_admin','school_admin','teacher','student'];

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
