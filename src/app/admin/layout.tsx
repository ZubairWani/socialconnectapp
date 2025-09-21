"use client";

import Link from "next/link";
import {
  Users,
  FileText,
  LineChart,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import React, { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      href: "/admin",
      icon: LineChart,
      label: "Dashboard",
    },
    {
      href: "/admin/users",
      icon: Users,
      label: "Users",
    },
    {
      href: "/admin/posts",
      icon: FileText,
      label: "Posts",
    },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:w-56 lg:w-60
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 border-b md:p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold md:text-base"
            onClick={closeSidebar}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to App</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <button
            onClick={closeSidebar}
            className="p-1 rounded-md hover:bg-muted md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-3 md:p-4">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted"
                onClick={closeSidebar}
              >
                <IconComponent className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-12 md:h-14 items-center gap-4 border-b bg-background px-3 md:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-md hover:bg-muted md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg md:text-xl lg:text-2xl font-semibold truncate">
            Admin Dashboard
          </h1>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-3 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}