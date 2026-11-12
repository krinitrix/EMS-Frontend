import { Badge, Button, Container, Navbar as BsNavbar } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

function Navbar({ title, onToggleSidebar }) {
  const { user, logout } = useAuth();

  const roleLabel = user?.role === 'HR_ADMIN' ? 'HR Admin' : 'Employee';
  const roleBadgeBg = user?.role === 'HR_ADMIN' ? 'primary' : 'info';

  return (
    <BsNavbar className="ems-navbar py-2 px-3 sticky-top">
      <Container fluid className="px-0">
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            className="d-lg-none"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
          >
            <i className="bi bi-list fs-5" />
          </Button>
          <span className="fw-semibold fs-5 text-dark mb-0">{title}</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="d-none d-sm-flex align-items-center gap-2 text-end">
            <div>
              <div className="fw-medium small lh-sm text-dark">{user?.username}</div>
              {user?.email && <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user.email}</div>}
            </div>
            <Badge bg={roleBadgeBg} className="ms-1">
              {roleLabel}
            </Badge>
          </div>

          <Button
            variant="outline-danger"
            size="sm"
            onClick={logout}
            className="d-flex align-items-center gap-1"
          >
            <i className="bi bi-box-arrow-right" />
            <span className="d-none d-md-inline">Logout</span>
          </Button>
        </div>
      </Container>
    </BsNavbar>
  );
}

export default Navbar;
