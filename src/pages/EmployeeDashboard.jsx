import { useCallback, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { extractErrorMessage } from '../services/api';
import payrollService from '../services/payrollService';
import { formatCurrency, formatMonth } from '../utils/formatters';

function EmployeeDashboard() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyPayroll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await payrollService.getMe();
      setPayrolls(data);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load your payroll records.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyPayroll();
  }, [fetchMyPayroll]);

  if (loading) {
    return <LoadingSpinner message="Loading your payroll records..." fullHeight />;
  }

  return (
    <div>
      {error && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={fetchMyPayroll}>
            Retry
          </Button>
        </Alert>
      )}

      <Card className="ems-card">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="h5 mb-0 fw-semibold">My Payroll</h2>
            <small className="text-muted">View your salary breakdown and payment history</small>
          </div>
          <Link to="/employee/profile" className="btn btn-outline-primary btn-sm">
            <i className="bi bi-person-badge me-1" />
            My Profile
          </Link>
        </Card.Header>

        <Card.Body className="p-0">
          {payrolls.length === 0 ? (
            <div className="ems-empty-state">
              <i className="bi bi-wallet2" />
              <p className="mb-0">No payroll records available yet.</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Month</th>
                  <th>Year</th>
                  <th className="text-end">Basic Salary</th>
                  <th className="text-end">Allowances</th>
                  <th className="text-end">Deductions</th>
                  <th className="text-end">Gross Salary</th>
                  <th className="text-end">Net Salary</th>
                  <th>Payroll Status</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((rec, index) => {
                  const statusValue = rec.status || rec.payroll_status || '-';
                  return (
                    <tr key={rec.id || `${rec.month}-${rec.year}-${index}`}>
                      <td className="fw-medium">{formatMonth(rec.month)}</td>
                      <td>{rec.year}</td>
                      <td className="text-end">{formatCurrency(rec.basic_salary)}</td>
                      <td className="text-end">{formatCurrency(rec.allowances)}</td>
                      <td className="text-end">{formatCurrency(rec.deductions)}</td>
                      <td className="text-end">{formatCurrency(rec.gross_salary)}</td>
                      <td className="text-end fw-semibold">{formatCurrency(rec.net_salary)}</td>
                      <td>
                        {statusValue !== '-' ? (
                          <Badge bg={statusValue === 'PAID' ? 'success' : 'primary'}>
                            {statusValue}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default EmployeeDashboard;
