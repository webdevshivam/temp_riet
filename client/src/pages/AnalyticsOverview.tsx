import { useState } from 'react';
import { useSchoolsAnalytics, useTeacherShortages, useStudentTrends } from '@/hooks/use-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AttendanceOverview } from '@/components/AttendanceOverview';

export default function AnalyticsOverview() {
  const [district, setDistrict] = useState<string>('');
  const schools = useSchoolsAnalytics(district || undefined);
  const shortages = useTeacherShortages(district || undefined);
  const trends = useStudentTrends(district || undefined);

  const districts = Array.from(new Set((schools.data || []).map(s => s.district).filter(Boolean))) as string[];

  const exportCsv = (type: 'schools'|'teachers'|'students'|'complaints') => {
    const url = `/api/reports?type=${type}&format=csv${district ? `&district=${encodeURIComponent(district)}` : ''}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">School performance, teacher shortages, and student trends</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportCsv('schools')}>Export Schools CSV</Button>
          <Button variant="outline" onClick={() => exportCsv('teachers')}>Export Teachers CSV</Button>
          <Button variant="outline" onClick={() => exportCsv('students')}>Export Students CSV</Button>
          <Button variant="outline" onClick={() => exportCsv('complaints')}>Export Complaints CSV</Button>
        </div>
      </div>

      <div className="w-64">
        <Select value={district === '' ? '__all__' : district} onValueChange={(v) => setDistrict(v === '__all__' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by district" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Districts</SelectItem>
            {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schools Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Shortage</TableHead>
                  <TableHead>Complaints</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(schools.data || []).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.district || '-'}</TableCell>
                    <TableCell>{s.performanceScore}</TableCell>
                    <TableCell>{s.teacherShortage ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{s.complaints}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Teacher Shortages by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(shortages.data || [])}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} name="Shortage" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={(trends.data?.attendanceByMonth || [])}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgAttendance" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Overview & Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Overview & Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceOverview />
        </CardContent>
      </Card>
    </div>
  );
}
