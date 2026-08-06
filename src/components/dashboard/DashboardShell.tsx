"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Settings, User, LogOut, Menu, Bell, Search, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Workspace, Membership } from "@/domain/types";
import Image from "next/image";

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  workspace: Workspace;
  memberships: Membership[];
}

export function DashboardShell({ children, user, workspace }: DashboardShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Workspace Settings", href: "/workspace/settings", icon: Settings },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      {/* Sidebar (Desktop) */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-border/50 bg-background sm:flex">
        <div className="flex h-14 items-center border-b border-border/50 px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="h-6 w-6 bg-foreground rounded-md flex items-center justify-center">
              <span className="text-background font-bold text-xs leading-none">I</span>
            </div>
            <span className="">Identify</span>
          </Link>
        </div>
        
        {/* Workspace Switcher Placeholder */}
        <div className="px-4 py-4 border-b border-border/50">
          <Button variant="outline" className="w-full justify-start h-10 px-3 font-normal">
            <div className="flex items-center gap-2 truncate">
              {workspace.logo ? (
                <Image src={workspace.logo} alt="" width={20} height={20} className="rounded-sm" />
              ) : (
                <div className="w-5 h-5 rounded-sm bg-muted flex items-center justify-center text-[10px] font-medium">
                  {workspace.name.substring(0, 1)}
                </div>
              )}
              <span className="truncate">{workspace.name}</span>
            </div>
          </Button>
        </div>

        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-foreground ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-9 w-9 border border-border/50">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback>{user.name?.substring(0, 1) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
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
                  <span>Identify</span>
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
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="flex-1 flex items-center">
            {/* Command Palette Foundation */}
            <div className="w-full max-w-sm relative hidden md:flex items-center">
              <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events, guests..."
                className="w-full rounded-lg bg-background pl-9 pr-12 h-9 border-border/50 focus-visible:ring-1"
              />
              <div className="absolute right-1.5 flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <Command className="h-3 w-3" /> K
                </kbd>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="rounded-full ml-auto md:ml-0">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          <div className="sm:hidden">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback>{user.name?.substring(0, 1) || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
