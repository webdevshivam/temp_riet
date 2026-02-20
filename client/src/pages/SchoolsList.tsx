import { useSchools, useCreateSchool, useSchool, useUpdateSchool, useDeleteSchool } from "@/hooks/use-schools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSchoolSchema, type InsertSchool } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

export default function SchoolsList() {
  const { data: schools, isLoading } = useSchools();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredSchools = (schools || []).filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Schools Directory</h1>
          <p className="text-muted-foreground">Manage educational institutions and view performance.</p>
        </div>
        <CreateSchoolDialog open={isOpen} onOpenChange={setIsOpen} />
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search schools..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Performance Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Loading schools...</TableCell>
              </TableRow>
            ) : filteredSchools.map((school) => (
              <TableRow key={school.id} className="group">
                <TableCell className="font-medium">{school.name}</TableCell>
                <TableCell>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-1" />
                    {school.location}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-secondary h-2 rounded-full max-w-[80px] overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full" 
                        style={{ width: `${school.performanceScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{school.performanceScore}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {school.teacherShortage ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      Teacher Shortage
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Healthy
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <SchoolDetailsButton id={school.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function SchoolDetailsButton({ id }: { id: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">View Details</Button>
      </DialogTrigger>
      <SchoolDetails id={id} onClose={() => setOpen(false)} />
    </Dialog>
  );
}

function SchoolDetails({ id, onClose }: { id: number; onClose: () => void }) {
  const { data: school } = useSchool(id);
  const update = useUpdateSchool(id);
  const del = useDeleteSchool();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: school?.name || "",
    location: school?.location || "",
    district: (school as any)?.district || "",
    performanceScore: school?.performanceScore || 0,
    teacherShortage: school?.teacherShortage || false,
  });

  // sync when school loads
  const s = school;
  if (s && form.name === "" && s.name) {
    setForm({
      name: s.name,
      location: s.location,
      district: (s as any).district || "",
      performanceScore: s.performanceScore,
      teacherShortage: s.teacherShortage,
    });
  }

  const save = () => {
    update.mutate(form as any, {
      onSuccess: () => toast({ title: "Saved", description: "School updated" }),
      onError: () => toast({ title: "Error", description: "Failed to update", variant: "destructive" })
    });
  };

  const remove = () => {
    del.mutate(id, {
      onSuccess: () => { toast({ title: "Deleted" }); onClose(); },
      onError: () => toast({ title: "Error", description: "Failed to delete", variant: "destructive" })
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>School Details</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>District</Label>
          <Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Performance Score (%)</Label>
            <Input type="number" value={form.performanceScore}
              onChange={(e) => setForm({ ...form, performanceScore: Number(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.teacherShortage ? 'shortage' : 'healthy'} onValueChange={(v) => setForm({ ...form, teacherShortage: v === 'shortage' })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="shortage">Teacher Shortage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="destructive" onClick={remove}>Delete</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </div>
    </DialogContent>
  );
}

function CreateSchoolDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { mutate, isPending } = useCreateSchool();
  const { toast } = useToast();
  
  const form = useForm<InsertSchool>({
    resolver: zodResolver(insertSchoolSchema),
    defaultValues: {
      name: "",
      location: "",
      performanceScore: 0,
      teacherShortage: false
    }
  });

  const onSubmit = (data: InsertSchool) => {
    mutate(data, {
      onSuccess: () => {
        toast({ title: "Success", description: "School created successfully" });
        onOpenChange(false);
        form.reset();
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create school", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4 mr-2" />
          Add School
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New School</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Lincoln High" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City, State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating..." : "Create School"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
