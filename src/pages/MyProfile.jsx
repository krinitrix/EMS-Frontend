import { useCallback, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Row } from 'react-bootstrap';
import LoadingSpinner from '../components/LoadingSpinner';
import { extractErrorMessage } from '../services/api';
import employeeService from '../services/employeeService';
import {
  formatCurrency,
  formatEmploymentType,
  getDepartmentName,
  getEmployeeEmail,
  getEmployeeUsername,
} from '../utils/formatters';

function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await employeeService.getMe();
      setProfile(data);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load your profile.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." fullHeight />;
  }

  return (
    <div>
      {error && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={fetchProfile}>
            Retry
          </Button>
        </Alert>
      )}

      {!profile && !error ? (
        <Card className="ems-card">
          <Card.Body className="ems-empty-state">
            <i className="bi bi-person-badge" />
            <p className="mb-0">Profile details are unavailable.</p>
          </Card.Body>
        </Card>
      ) : (
        profile && (
          <Card className="ems-card">
            <Card.Header className="bg-white py-3 d-flex align-items-center gap-3">
              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
                style={{ width: '48px', height: '48px' }}
              >
                <i className="bi bi-person-fill fs-4" />
              </div>
              <div>
                <h2 className="h5 mb-0 fw-semibold">{getEmployeeUsername(profile)}</h2>
                <small className="text-muted">Employee Profile</small>
              </div>
            </Card.Header>

            <Card.Body className="p-4">
              <Row className="g-4">
                <Col sm={6} md={4}>
                  <div className="text-muted small mb-1">Username</div>
                  <div className="fw-semibold">{getEmployeeUsername(profile)}</div>
                </Col>

                <Col sm={6} md={4}>
                  <div className="text-muted small mb-1">Email</div>
                  <div className="fw-semibold">{getEmployeeEmail(profile)}</div>
                </Col>

                <Col sm={6} md={4}>
                  <div className="text-muted small mb-1">Department</div>
                  <div className="fw-semibold">{getDepartmentName(profile)}</div>
                </Col>

                <Col sm={6} md={4}>
                  <div className="text-muted small mb-1">Employment Type</div>
                  <div>
                    <Badge bg="secondary" className="fw-normal">
                      {formatEmploymentType(profile.employment_type)}
                    </Badge>
                  </div>
                </Col>

                <Col sm={6} md={4}>
                  <div className="text-muted small mb-1">Base Salary</div>
                  <div className="fw-semibold">{formatCurrency(profile.base_salary)}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )
      )}
    </div>
  );
}

export default MyProfile;
