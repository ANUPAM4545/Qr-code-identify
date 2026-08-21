"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Settings, User, LogOut, Menu, CalendarDays, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Workspace, Membership } from "@/domain/types";
import Image from "next/image";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  workspace: Workspace;
  workspaces?: Workspace[];
  memberships: Membership[];
  navigation?: { name: string; href: string; icon: React.ReactNode }[];
}

export function DashboardShell({ children, user, workspace, workspaces = [], navigation: customNavigation }: DashboardShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const defaultNavigation = useMemo(() => [
    { name: "Overview", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: "Events", href: "/events", icon: <CalendarDays className="h-4 w-4" /> },
    { name: "Templates", href: "/templates", icon: <Copy className="h-4 w-4" /> },
    { name: "Workspace Settings", href: "/workspace/settings", icon: <Settings className="h-4 w-4" /> },
    { name: "Profile", href: "/profile", icon: <User className="h-4 w-4" /> },
  ], []);

  const navigation = customNavigation || defaultNavigation;
  const handleSignOut = useCallback(() => signOut(), []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      {/* Sidebar (Desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-10 hidden flex-col border-r border-border/50 bg-background sm:flex transition-all duration-300 print:hidden ${isSidebarCollapsed ? "w-16" : "w-64"}`}>
        <div className={`flex h-14 items-center border-b border-border/50 lg:h-[60px] ${isSidebarCollapsed ? "justify-center px-2" : "justify-between px-4 lg:px-6"}`}>
          {!isSidebarCollapsed && (
            <Link href="/" className="flex items-center gap-2 font-semibold overflow-hidden">
              <div className="h-6 w-6 shrink-0 bg-foreground rounded-md flex items-center justify-center">
                <span className="text-background font-bold text-xs leading-none">I</span>
              </div>
              <span className="">Identity</span>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            {isSidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Workspace Switcher */}
        <div className={`py-4 border-b border-border/50 ${isSidebarCollapsed ? "px-2" : "px-4"}`}>
          <WorkspaceSwitcher 
            workspaces={workspaces} 
            activeWorkspace={workspace} 
            isSidebarCollapsed={isSidebarCollapsed} 
          />
        </div>

        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-2 text-sm font-medium gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isSidebarCollapsed ? item.name : undefined}
                  className={`relative flex items-center gap-3 rounded-lg py-2 transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  } ${isSidebarCollapsed ? "justify-center px-0" : "px-3"}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute inset-0 rounded-lg bg-muted border border-border/50"
                      initial={false}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 shrink-0 [&>svg]:w-4 [&>svg]:h-4">{item.icon}</span>
                  {!isSidebarCollapsed && <span className="relative z-10 truncate font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className={`mt-auto border-t border-border/50 ${isSidebarCollapsed ? "p-2" : "p-4"}`}>
          <div className={`flex items-center gap-3 ${isSidebarCollapsed ? "justify-center mb-2" : "mb-4"}`}>
            <Avatar className="h-9 w-9 shrink-0 border border-border/50">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback>{user.name?.substring(0, 1) || "U"}</AvatarFallback>
            </Avatar>
            {!isSidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium truncate">{user.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
            )}
          </div>
          {!isSidebarCollapsed ? (
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4 shrink-0" />
              Sign out
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="w-full text-muted-foreground hover:text-foreground" onClick={handleSignOut} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex flex-col flex-1 transition-all duration-300 print:pl-0 ${isSidebarCollapsed ? "sm:pl-16" : "sm:pl-64"}`}>
        <header className="sticky top-0 z-30 flex shrink-0 h-14 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 print:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger className="sm:hidden" render={<Button size="icon" variant="outline" className="sm:hidden" />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="grid gap-6 text-lg font-medium mt-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <div className="h-6 w-6 bg-foreground rounded-md flex items-center justify-center">
                    <span className="text-background font-bold text-xs leading-none">I</span>
                  </div>
                  <span>Identity</span>
                </Link>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-2.5 ${
                      pathname === item.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="[&>svg]:w-5 [&>svg]:h-5">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="flex-1"></div>

          <div className="sm:hidden">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback>{user.name?.substring(0, 1) || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
