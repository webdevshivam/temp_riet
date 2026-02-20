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
  X,
  BarChart3,
  MessageSquare,
  Award,
  ScanFace,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  role: "gov_admin" | "school_admin" | "teacher" | "student";
  onRoleChange?: (role: string) => void;
}

type NavLink = { href: string; label: string; icon: any };
type NavSection = { title: string; links: NavLink[] };

const roleLabels: Record<string, string> = {
  gov_admin: "Government Admin",
  school_admin: "School Admin",
  teacher: "Teacher",
  student: "Student",
};

export function Sidebar({ role }: SidebarProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const sectionsByRole: Record<SidebarProps["role"], NavSection[]> = {
    gov_admin: [
      {
        title: "Overview",
        links: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
      },
      {
        title: "Management",
        links: [
          { href: "/schools", label: "Schools", icon: School },
          { href: "/admin/attendance", label: "Attendance", icon: ClipboardList },
          { href: "/admin/users", label: "Users & Roles", icon: Users },
        ],
      },
      {
        title: "Insights",
        links: [
          { href: "/analytics", label: "Analytics", icon: BarChart3 },
          { href: "/settings/scholarship", label: "Scholarships", icon: Award },
          { href: "/complaints", label: "Complaints", icon: MessageSquare },
        ],
      },
    ],
    school_admin: [
      {
        title: "Overview",
        links: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
      },
      {
        title: "School",
        links: [
          { href: "/students", label: "Students", icon: GraduationCap },
          { href: "/teachers", label: "Staff", icon: Users },
          { href: "/admin/attendance", label: "Attendance", icon: ClipboardList },
          { href: "/complaints", label: "Complaints", icon: MessageSquare },
        ],
      },
    ],
    teacher: [
      {
        title: "Teaching",
        links: [
          { href: "/", label: "Classroom", icon: LayoutDashboard },
          { href: "/attendance", label: "Face Attendance", icon: ScanFace },
          { href: "/students", label: "My Students", icon: GraduationCap },
        ],
      },
    ],
    student: [
      {
        title: "My Learning",
        links: [
          { href: "/", label: "My Progress", icon: LayoutDashboard },
          { href: "/courses", label: "Courses", icon: Video },
          { href: "/blockchain", label: "Certificates", icon: ShieldCheck },
        ],
      },
    ],
  };

  const currentSections = sectionsByRole[role] || sectionsByRole.gov_admin;

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" className="bg-card shadow-sm" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px] transform bg-card border-r transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center gap-2.5 px-6 border-b bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary shadow-sm">
              <GraduationCap className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">EduTrack</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
            {currentSections.map((section) => (
              <div key={section.title} className="space-y-1.5">
                <div className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground/80 font-semibold">
                  {section.title}
                </div>
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = location === link.href;
                  return (
                    <Link key={link.href} href={link.href}>
                      <div
                        className={cn(
                          "group flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] border transition-all cursor-pointer",
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "text-muted-foreground border-transparent hover:bg-muted hover:text-foreground hover:border-border",
                        )}
                      >
                        <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary-foreground" : "group-hover:text-foreground")} />
                        <span className="truncate">{link.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User Info and Logout */}
          <div className="p-3 border-t">
            <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-semibold uppercase">
                {(user?.username || role)?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.username || "User"}</div>
                <div className="text-xs text-muted-foreground">{roleLabels[role] || role}</div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9"
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
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
