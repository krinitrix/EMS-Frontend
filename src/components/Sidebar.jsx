import { Nav, Offcanvas } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HR_LINKS = [
  { to: '/hr/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { to: '/hr/employees', label: 'Employees', icon: 'bi-people' },
  { to: '/hr/departments', label: 'Departments', icon: 'bi-building' },
  { to: '/hr/payroll', label: 'Payroll', icon: 'bi-cash-stack' },
];

const EMPLOYEE_LINKS = [
  { to: '/employee/dashboard', label: 'My Payroll', icon: 'bi-wallet2' },
  { to: '/employee/profile', label: 'My Profile', icon: 'bi-person-badge' },
];

function SidebarContent({ links, onLinkClick, onLogout }) {
  return (
    <div className="d-flex flex-column h-100">
      <div className="ems-sidebar-brand d-flex align-items-center gap-2">
        <i className="bi bi-briefcase-fill fs-4 text-primary" />
        <div>
          <div className="fw-bold text-white lh-sm">EMS Portal</div>
          <small className="text-white-50">Employee Management</small>
        </div>
      </div>

      <Nav className="flex-column py-3 flex-grow-1">
        {links.map((item) => (
          <Nav.Item key={item.to}>
            <NavLink
              to={item.to}
              onClick={onLinkClick}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
            </NavLink>
          </Nav.Item>
        ))}
      </Nav>

      <div className="p-3 border-top border-light border-opacity-10">
        <button
          type="button"
          onClick={onLogout}
          className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <i className="bi bi-box-arrow-right" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

function Sidebar({ showMobile, onCloseMobile }) {
  const { user, logout } = useAuth();
  const links = user?.role === 'HR_ADMIN' ? HR_LINKS : EMPLOYEE_LINKS;

  return (
    <>
      <aside className="ems-sidebar d-none d-lg-flex">
        <SidebarContent links={links} onLogout={logout} />
      </aside>

      <Offcanvas
        show={showMobile}
        onHide={onCloseMobile}
        placement="start"
        className="text-white"
        style={{ backgroundColor: 'var(--ems-navy)', width: '250px' }}
      >
        <Offcanvas.Header closeButton closeVariant="white" className="pb-0">
          <Offcanvas.Title className="fs-6 text-white-50">Navigation</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0 d-flex flex-column">
          <SidebarContent
            links={links}
            onLinkClick={onCloseMobile}
            onLogout={() => {
              onCloseMobile();
              logout();
            }}
          />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Sidebar;
