import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  AnimatedBackground,
  GlassSidebar,
  GlassSidebarHeader,
  GlassSidebarContent,
  GlassSidebarFooter,
  GlassSidebarGroup,
  GlassSidebarGroupLabel,
  GlassSidebarNavLink,
  GlassSidebarUser,
} from '../components/ui';
import { KarmaSystemModal } from '../components/KarmaSystemModal';
import {
  LayoutDashboard,
  ListOrdered,
  FileCheck,
  Play,
  Users,
  LogOut,
  Printer,
  HelpCircle,
  BarChart3,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Check if user has seen the karma system modal
  useEffect(() => {
    const hasSeenKarmaModal = localStorage.getItem('hasSeenKarmaModal');
    if (!hasSeenKarmaModal) {
      setIsHelpModalOpen(true);
    }
  }, []);

  const handleCloseHelpModal = () => {
    setIsHelpModalOpen(false);
    localStorage.setItem('hasSeenKarmaModal', 'true');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Content Layer */}
      <div className="relative z-10 flex w-full">
        {/* Sidebar */}
        <GlassSidebar>
          <GlassSidebarHeader>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25"
              >
                <Printer className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h2 className="font-bold text-white">Netzon</h2>
                <p className="text-xs text-white/50">3D Print Queue</p>
              </div>
            </div>
          </GlassSidebarHeader>

          <GlassSidebarContent>
            {/* User Navigation */}
            <GlassSidebarGroup>
              <GlassSidebarGroupLabel>Navigation</GlassSidebarGroupLabel>
              <div className="space-y-2">
                <GlassSidebarNavLink to="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />}>
                  Dashboard
                </GlassSidebarNavLink>
                <GlassSidebarNavLink to="/queue" icon={<ListOrdered className="w-4 h-4" />}>
                  View Queue
                </GlassSidebarNavLink>
              </div>
            </GlassSidebarGroup>

            {/* Admin Navigation */}
            {isAdmin && (
              <GlassSidebarGroup>
                <GlassSidebarGroupLabel>Admin</GlassSidebarGroupLabel>
                <div className="space-y-2">
                  <GlassSidebarNavLink to="/admin/review" icon={<FileCheck className="w-4 h-4" />}>
                    Review Jobs
                  </GlassSidebarNavLink>
                  <GlassSidebarNavLink to="/admin/print" icon={<Play className="w-4 h-4" />}>
                    Print Manager
                  </GlassSidebarNavLink>
                  <GlassSidebarNavLink to="/admin/users" icon={<Users className="w-4 h-4" />}>
                    User Requests
                  </GlassSidebarNavLink>
                  <GlassSidebarNavLink to="/admin/reports" icon={<BarChart3 className="w-4 h-4" />}>
                    Reports
                  </GlassSidebarNavLink>
                </div>
              </GlassSidebarGroup>
            )}
          </GlassSidebarContent>

          <GlassSidebarFooter>
            {/* User Info */}
            <div className="flex flex-col gap-3 justify-between pb-3">
              {/* Help Button */}
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsHelpModalOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm glass-sidebar-btn-info transition-all duration-200"
              >
                <HelpCircle className="w-4 h-4" />
                Karma System Help
              </motion.button>

              {/* User Info */}
              <GlassSidebarUser
                name={user?.name || 'User'}
                role={user?.role}
              />
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm glass-sidebar-btn-danger transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </motion.button>
          </GlassSidebarFooter>
        </GlassSidebar>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto h-screen">
          <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Karma System Modal */}
      <KarmaSystemModal
        isOpen={isHelpModalOpen}
        onClose={handleCloseHelpModal}
      />
    </div>
  );
};

export default DashboardLayout;
