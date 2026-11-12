import { useState } from 'react';
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';
import { Navigate, useNavigate } from 'react-router-dom';
import { getHomePathForRole } from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { extractErrorMessage } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, user, login, authNotice, clearAuthNotice } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to={getHomePathForRole(user.role)} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    clearAuthNotice();

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedInUser = await login(username.trim(), password);
      showToast(`Welcome back, ${loggedInUser.username}!`, 'success', 'Login Successful');
      navigate(getHomePathForRole(loggedInUser.role), { replace: true });
    } catch (err) {
      const msg = extractErrorMessage(err, 'Invalid username or password.');
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ems-login-wrapper">
      <Card className="ems-login-card">
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary mb-3"
              style={{ width: '56px', height: '56px' }}
            >
              <i className="bi bi-briefcase-fill fs-3" />
            </div>
            <h1 className="h4 fw-bold mb-1">Employee Management System</h1>
            <p className="text-muted small mb-0">Sign in to access your portal</p>
          </div>

          {authNotice && (
            <Alert variant="warning" dismissible onClose={clearAuthNotice} className="small">
              <i className="bi bi-exclamation-triangle-fill me-2" />
              {authNotice}
            </Alert>
          )}

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')} className="small">
              <i className="bi bi-x-circle-fill me-2" />
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="loginUsername">
              <Form.Label className="fw-medium">Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={isSubmitting}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="loginPassword">
              <Form.Label className="fw-medium">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isSubmitting}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2 fw-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Signing In...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2" />
                  Sign In
                </>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Login;
