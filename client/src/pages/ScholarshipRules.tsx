import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useScholarshipRules, useUpdateScholarshipRules, useEvaluateScholarship } from '@/hooks/use-admin';
import { useState } from 'react';

export default function ScholarshipRules() {
  const { data: rules } = useScholarshipRules();
  const update = useUpdateScholarshipRules();
  const evalScholar = useEvaluateScholarship();
  const [studentId, setStudentId] = useState('');

  const [form, setForm] = useState({ minMarks: rules?.minMarks ?? 85, minAttendance: rules?.minAttendance ?? 90 });

  const save = () => update.mutate(form);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight">Scholarship Rules</h1>
        <p className="text-muted-foreground">Configure global eligibility thresholds and test a student</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thresholds</CardTitle>
          <CardDescription>Applied globally unless district overrides are configured (not exposed in UI yet).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 max-w-xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marks">Minimum Marks (%)</Label>
              <Input id="marks" type="number" min={0} max={100} value={form.minMarks}
                onChange={(e) => setForm({ ...form, minMarks: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="att">Minimum Attendance (%)</Label>
              <Input id="att" type="number" min={0} max={100} value={form.minAttendance}
                onChange={(e) => setForm({ ...form, minAttendance: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <Button onClick={save} disabled={update.isPending}>Save Rules</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Evaluate Student</CardTitle>
          <CardDescription>Check eligibility for a specific student ID</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
          <Button onClick={() => evalScholar.mutate(Number(studentId))} disabled={!studentId}>Evaluate</Button>
          {evalScholar.data && (
            <div className="text-sm ml-2">
              <div className={evalScholar.data.eligible ? 'text-green-600' : 'text-red-600'}>
                {evalScholar.data.eligible ? 'Eligible' : 'Not Eligible'}
              </div>
              <div className="text-muted-foreground">{evalScholar.data.reason}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
