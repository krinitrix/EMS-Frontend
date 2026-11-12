import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const ROUTE_TITLES = {
  '/hr/dashboard': 'HR Dashboard',
  '/hr/employees': 'Employee Management',
  '/hr/departments': 'Department Management',
  '/hr/payroll': 'Payroll Management',
  '/employee/dashboard': 'My Payroll',
  '/employee/profile': 'My Profile',
};

function DashboardLayout() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { pathname } = useLocation();
  const pageTitle = ROUTE_TITLES[pathname] || 'Dashboard';

  return (
    <div className="ems-layout">
      <div className="ems-body">
        <Sidebar
          showMobile={showMobileSidebar}
          onCloseMobile={() => setShowMobileSidebar(false)}
        />

        <div className="ems-main-wrapper">
          <Navbar
            title={pageTitle}
            onToggleSidebar={() => setShowMobileSidebar(true)}
          />
          <main className="ems-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
