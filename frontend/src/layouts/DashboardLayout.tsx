import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  Button,
} from 'gisketch-neumorphism';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ListOrdered,
  FileCheck,
  Play,
  Users,
  LogOut,
  Sun,
  Moon,
  Printer,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = React.useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center
              shadow-[-2px_-2px_4px_rgba(var(--shadow-light)),2px_2px_4px_rgba(var(--shadow-dark)),inset_1px_1px_2px_hsl(var(--primary-light)),inset_-1px_-1px_2px_hsl(var(--primary-dark)/0.5)]">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Netzon 3D</h2>
              <p className="text-xs text-muted-foreground">Print Queue</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* User Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <NavLink to="/dashboard">
              {({ isActive }) => (
                <SidebarItem active={isActive}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </SidebarItem>
              )}
            </NavLink>
            <NavLink to="/queue">
              {({ isActive }) => (
                <SidebarItem active={isActive}>
                  <ListOrdered className="w-4 h-4" />
                  View Queue
                </SidebarItem>
              )}
            </NavLink>
          </SidebarGroup>

          {/* Admin Navigation */}
          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <NavLink to="/admin/review">
                {({ isActive }) => (
                  <SidebarItem active={isActive}>
                    <FileCheck className="w-4 h-4" />
                    Review Jobs
                  </SidebarItem>
                )}
              </NavLink>
              <NavLink to="/admin/print">
                {({ isActive }) => (
                  <SidebarItem active={isActive}>
                    <Play className="w-4 h-4" />
                    Print Manager
                  </SidebarItem>
                )}
              </NavLink>
              <NavLink to="/admin/users">
                {({ isActive }) => (
                  <SidebarItem active={isActive}>
                    <Users className="w-4 h-4" />
                    User Requests
                  </SidebarItem>
                )}
              </NavLink>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter>
          {/* User Info */}
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 px-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="flex-1"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="flex-1"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
