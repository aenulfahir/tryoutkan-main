import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

/**
 * AdminLayout Component
 * 
 * Main layout untuk admin dashboard dengan:
 * - Sidebar navigation (collapsible)
 * - Header dengan breadcrumbs, search, notifications
 * - Main content area
 * - Responsive design (mobile & desktop)
 * - Dark mode support
 */
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <AdminSidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      {/* Sidebar - Mobile */}
      <div className="lg:hidden">
        <AdminSidebar
          open={mobileSidebarOpen}
          onToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          mobile
        />
      </div>

      {/* Main Content */}
      <div
        className={`
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}
        `}
      >
        {/* Header */}
        <AdminHeader
          onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Page Content */}
        <main className="p-4 lg:p-6 mt-16">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
}

