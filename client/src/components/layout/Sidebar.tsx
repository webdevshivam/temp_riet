import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  School, 
  Users, 
  GraduationCap, 
  FileText, 
  Video, 
  ShieldCheck, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  role: "gov_admin" | "school_admin" | "teacher" | "student";
  onRoleChange?: (role: string) => void;
}

export function Sidebar({ role }: SidebarProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  const links = {
    gov_admin: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/schools", label: "Schools", icon: School },
      { href: "/analytics", label: "Analytics", icon: LayoutDashboard },
      { href: "/admin/users", label: "Users & Roles", icon: Users },
      { href: "/settings/scholarship", label: "Scholarship Rules", icon: FileText },
      { href: "/complaints", label: "Complaints", icon: FileText },
    ],
    school_admin: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/students", label: "Students", icon: GraduationCap },
      { href: "/teachers", label: "Staff", icon: Users },
      { href: "/complaints", label: "Complaints", icon: FileText },
    ],
    teacher: [
      { href: "/", label: "Classroom", icon: LayoutDashboard },
      { href: "/attendance", label: "Smart Attendance", icon: Users },
      { href: "/students", label: "Students", icon: GraduationCap },
    ],
    student: [
      { href: "/", label: "My Progress", icon: LayoutDashboard },
      { href: "/courses", label: "Courses", icon: Video },
      { href: "/blockchain", label: "Certificates", icon: ShieldCheck },
    ]
  };

  const currentLinks = links[role] || links.gov_admin;

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 transform bg-card border-r transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center px-6 border-b">
            <GraduationCap className="h-6 w-6 text-primary mr-2" />
            <span className="font-display font-bold text-xl">EduTrack</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {currentLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-medium" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}>
                    <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span>{link.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Info and Logout */}
          <div className="p-4 border-t bg-secondary/30">
            <div className="mb-3 px-2">
              <div className="text-sm font-medium capitalize">{role.replace('_', ' ')}</div>
              <div className="text-xs text-muted-foreground">Current Role</div>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
