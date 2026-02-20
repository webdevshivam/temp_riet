import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/use-auth";

// Pages
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import GovDashboard from "@/pages/GovDashboard";
import StudentDashboard from "@/pages/StudentDashboard";
import TeacherDashboard from "@/pages/TeacherDashboard";
import SchoolAdminDashboard from "@/pages/SchoolAdminDashboard";
import SchoolsList from "@/pages/SchoolsList";
import StudentsList from "@/pages/StudentsList";
import StudentProfile from "@/pages/StudentProfile";
import TeachersList from "@/pages/TeachersList";
import FaceVerification from "@/pages/FaceVerification";
import BlockchainVerify from "@/pages/BlockchainVerify";
import Courses from "@/pages/Courses";
import Complaints from "@/pages/Complaints";
import AnalyticsOverview from "@/pages/AnalyticsOverview";
import UsersRoles from "@/pages/UsersRoles";
import ScholarshipRules from "@/pages/ScholarshipRules";
import FaceTesting from "@/pages/FaceTesting";
import AttendanceTracker from "@/pages/AttendanceTracker";

function ProtectedRoute({ component: Component }: { component: React.ComponentType; path?: string }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // If not authenticated, show login page
  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/:rest*">
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  // Role-based dashboard component
  const getDashboardComponent = () => {
    switch (user.role) {
      case 'student':
        return StudentDashboard;
      case 'teacher':
        return TeacherDashboard;
      case 'school_admin':
        return SchoolAdminDashboard;
      case 'gov_admin':
      default:
        return GovDashboard;
    }
  };

  const DashboardComponent = getDashboardComponent();
  
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Dynamic Sidebar based on role */}
      <Sidebar role={user.role as any} onRoleChange={(r) => {}} />
      
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto pt-14 lg:pt-0">
          <Switch>
            <Route path="/login">
              <Redirect to="/" />
            </Route>
            <Route path="/" component={DashboardComponent} />
            <Route path="/schools" component={SchoolsList} />
            <Route path="/students/:id" component={StudentProfile} />
            <Route path="/students" component={StudentsList} />
            <Route path="/teachers" component={TeachersList} />
            <Route path="/analytics" component={AnalyticsOverview} />
            <Route path="/admin/users" component={UsersRoles} />
            <Route path="/settings/scholarship" component={ScholarshipRules} />
            <Route path="/attendance" component={FaceVerification} />
            <Route path="/admin/attendance" component={AttendanceTracker} />
            <Route path="/blockchain" component={BlockchainVerify} />
            <Route path="/courses" component={Courses} />
            <Route path="/complaints" component={Complaints} />
            <Route path="/face-test" component={FaceTesting} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
