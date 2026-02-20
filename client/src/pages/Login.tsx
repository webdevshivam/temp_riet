import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"gov_admin" | "school_admin" | "teacher" | "student">("gov_admin");
  const { login, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Missing credentials",
        description: "Please enter username and password",
        variant: "warning",
      });
      return;
    }

    login({ username, password, role } as any, {
      onSuccess: () => {
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully",
          variant: "success" as any,
        });
        setLocation("/");
      },
      onError: (error: Error) => {
        toast({
          title: "Login failed",
          description: error.message || "Invalid credentials",
          variant: "destructive",
        });
      },
    });
  };

  // Quick login presets
  const quickLogin = (preset: { username: string; password: string; role: typeof role }) => {
    setUsername(preset.username);
    setPassword(preset.password);
    setRole(preset.role);
    setTimeout(() => {
      login({ username: preset.username, password: preset.password, role: preset.role } as any, {
        onSuccess: () => {
          toast({
            title: "Welcome back!",
            description: `Signed in as ${preset.role.replace('_', ' ')}`,
            variant: "success" as any,
          });
          setLocation("/");
        },
      });
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center warm-bg p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-rose-200/30 dark:bg-rose-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-primary">
            EduTrack
          </h1>
          <p className="text-muted-foreground text-lg">Welcome back! Let's get started</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl shadow-orange-200/30 border-orange-100/50 backdrop-blur-sm bg-white/90 dark:bg-card/90">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription className="text-base">Choose your role and enter credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gov_admin">Government Admin</SelectItem>
                    <SelectItem value="school_admin">School Admin</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoggingIn}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoggingIn}
                />
              </div>

              <Button type="submit" className="w-full btn-primary h-12 text-base font-semibold" disabled={isLoggingIn}>
                {isLoggingIn && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Quick Access */}
        <Card className="shadow-xl shadow-orange-200/20 border-orange-100/50 backdrop-blur-sm bg-orange-50/80 dark:bg-orange-950/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              Demo Quick Access
            </CardTitle>
            <CardDescription>Click to login with test accounts</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-12 border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 hover:scale-105 transition-all duration-300"
              onClick={() => quickLogin({ username: "admin", password: "password", role: "gov_admin" })}
              disabled={isLoggingIn}
            >
              <span className="font-semibold">Gov Admin</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 border-2 border-rose-200 hover:bg-rose-50 hover:border-rose-300 hover:scale-105 transition-all duration-300"
              onClick={() => quickLogin({ username: "admin", password: "password", role: "school_admin" })}
              disabled={isLoggingIn}
            >
              <span className="font-semibold">School Admin</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 border-2 border-amber-200 hover:bg-amber-50 hover:border-amber-300 hover:scale-105 transition-all duration-300"
              onClick={() => quickLogin({ username: "teacher", password: "password", role: "teacher" })}
              disabled={isLoggingIn}
            >
              <span className="font-semibold">Teacher</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 border-2 border-pink-200 hover:bg-pink-50 hover:border-pink-300 hover:scale-105 transition-all duration-300"
              onClick={() => quickLogin({ username: "student", password: "password", role: "student" })}
              disabled={isLoggingIn}
            >
              <span className="font-semibold">Student</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
