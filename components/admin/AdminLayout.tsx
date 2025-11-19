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
 * - Dark mode support (now strictly black & white)
 */
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
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
        <main className="p-4 lg:p-8 mt-16 bg-gray-50/50 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
}

