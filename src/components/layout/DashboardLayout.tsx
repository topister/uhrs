"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  FileText,
  Calendar,
  Building2,
  User,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Search,
  Users,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navByRole: {
  [key: string]: { label: string; href: string; icon: React.ElementType }[];
} = {
  PATIENT: [
    { label: "Dashboard", href: "/patient", icon: LayoutDashboard },
    { label: "My Records", href: "/patient/records", icon: FileText },
    { label: "Appointments", href: "/patient/appointments", icon: Calendar },
    { label: "Find Hospital", href: "/hospitals", icon: Building2 },
    { label: "Find Doctor", href: "/doctors", icon: User },
  ],
  DOCTOR: [
    { label: "Dashboard", href: "/doctor", icon: LayoutDashboard },
    { label: "Patient Lookup", href: "/doctor/patient", icon: Search },
    { label: "Appointments", href: "/doctor/appointments", icon: Calendar },
    { label: "My Visits", href: "/doctor/visits", icon: FileText },
  ],
  HOSPITAL_ADMIN: [
    { label: "Dashboard", href: "/hospital-admin", icon: LayoutDashboard },
    { label: "Doctors", href: "/hospital-admin/doctors", icon: Stethoscope },
    { label: "Patients", href: "/hospital-admin/patients", icon: Users },
    {
      label: "Appointments",
      href: "/hospital-admin/appointments",
      icon: Calendar,
    },
    { label: "Services", href: "/hospital-admin/services", icon: Building2 },
  ],
  SUPER_ADMIN: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Hospitals", href: "/admin/hospitals", icon: Building2 },
    { label: "Doctors", href: "/admin/doctors", icon: Stethoscope },
    { label: "Patients", href: "/admin/patients", icon: Users },
    { label: "Admins", href: "/admin/users", icon: ShieldCheck },
  ],
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: string;
  userName: string;
  userRole: string;
  userInitials: string;
  patientNumber?: string;
}

function SidebarContent({
  navItems,
  userName,
  userRole,
  userInitials,
  patientNumber,
  pathname,
  onNavClick,
  showLogo = true,
}: {
  navItems: { label: string; href: string; icon: React.ElementType }[];
  userName: string;
  userRole: string;
  userInitials: string;
  patientNumber?: string;
  pathname: string;
  onNavClick: () => void;
  showLogo?: boolean;
}) {
  return (
    <>
      {/* Logo */}

      {showLogo && (
        <div className="p-6 border-b border-slate-700">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">UHRS</span>
          </Link>
        </div>
      )}

      {/* User info */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {userInitials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {userName}
            </p>
            <p className="text-xs text-slate-400">{userRole}</p>
            {patientNumber && (
              <p className="text-xs text-blue-400 font-mono mt-0.5">
                {patientNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href.split("/").length > 2 && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800",
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-slate-700">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Link>
      </div>
    </>
  );
}

export default function DashboardLayout({
  children,
  role,
  userName,
  userRole,
  userInitials,
  patientNumber,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = navByRole[role] ?? navByRole.PATIENT;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── DESKTOP SIDEBAR (always visible, lg and above) ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-slate-900 h-screen">
        <SidebarContent
          navItems={navItems}
          userName={userName}
          userRole={userRole}
          userInitials={userInitials}
          patientNumber={patientNumber}
          pathname={pathname}
          onNavClick={() => {}}
        />
      </aside>

      {/* ── MOBILE DRAWER (slides in, below lg) ── */}
      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-slate-900 z-50 flex flex-col transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Close button inside drawer */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">UHRS</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <SidebarContent
          navItems={navItems}
          userName={userName}
          userRole={userRole}
          userInitials={userInitials}
          patientNumber={patientNumber}
          pathname={pathname}
          onNavClick={() => setMobileOpen(false)}
          showLogo={false}
        />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center px-4 py-3 bg-white border-b border-slate-100 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
