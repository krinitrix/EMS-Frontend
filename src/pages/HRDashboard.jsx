import { useCallback, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { extractErrorMessage } from '../services/api';
import departmentService from '../services/departmentService';
import employeeService from '../services/employeeService';
import {
  formatCurrency,
  formatEmploymentType,
  getDepartmentName,
  getEmployeeEmail,
  getEmployeeUsername,
} from '../utils/formatters';

function HRDashboard() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [empData, deptData] = await Promise.all([
        employeeService.getAll(),
        departmentService.getAll(),
      ]);
      setEmployees(empData);
      setDepartments(deptData);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load dashboard data.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <LoadingSpinner message="Loading HR dashboard..." fullHeight />;
  }

  const recentEmployees = [...employees]
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
    .slice(0, 5);

  return (
    <div>
      {error && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={fetchDashboardData}>
            Retry
          </Button>
        </Alert>
      )}

      <Row className="g-3 mb-4">
        <Col sm={6} lg={4}>
          <Card className="ems-stat-card h-100">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-medium mb-1">Total Employees</div>
                <div className="h2 fw-bold mb-0">{employees.length}</div>
              </div>
              <div className="ems-stat-icon bg-primary bg-opacity-10 text-primary">
                <i className="bi bi-people-fill" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={4}>
          <Card className="ems-stat-card h-100">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-medium mb-1">Total Departments</div>
                <div className="h2 fw-bold mb-0">{departments.length}</div>
              </div>
              <div className="ems-stat-icon bg-success bg-opacity-10 text-success">
                <i className="bi bi-building" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={12} lg={4}>
          <Card className="ems-stat-card h-100">
            <Card.Body>
              <div className="text-muted small fw-medium mb-2">Quick Navigation</div>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/hr/employees" className="btn btn-primary btn-sm">
                  <i className="bi bi-people me-1" />
                  Employees
                </Link>
                <Link to="/hr/departments" className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-building me-1" />
                  Departments
                </Link>
                <Link to="/hr/payroll" className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-cash-stack me-1" />
                  Payroll
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="ems-card">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
          <h2 className="h5 mb-0 fw-semibold">Recent Employee Records</h2>
          <Link to="/hr/employees" className="btn btn-sm btn-outline-primary">
            View All
          </Link>
        </Card.Header>
        <Card.Body className="p-0">
          {recentEmployees.length === 0 ? (
            <div className="ems-empty-state">
              <i className="bi bi-people" />
              <p className="mb-2">No employee records found.</p>
              <Link to="/hr/employees" className="btn btn-primary btn-sm">
                Add Employee
              </Link>
            </div>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Employment Type</th>
                  <th className="text-end">Base Salary</th>
                </tr>
              </thead>
              <tbody>
                {recentEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td className="fw-medium">{getEmployeeUsername(emp)}</td>
                    <td>{getEmployeeEmail(emp)}</td>
                    <td>{getDepartmentName(emp, departments)}</td>
                    <td>
                      <Badge bg="secondary" className="fw-normal">
                        {formatEmploymentType(emp.employment_type)}
                      </Badge>
                    </td>
                    <td className="text-end">{formatCurrency(emp.base_salary)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default HRDashboard;
