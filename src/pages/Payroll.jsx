import { useCallback, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { extractErrorMessage } from '../services/api';
import employeeService from '../services/employeeService';
import payrollService from '../services/payrollService';
import {
  MONTHS,
  formatCurrency,
  formatMonth,
  getEmployeeUsername,
  getPayrollEmployeeLabel,
} from '../utils/formatters';

function getInitialPayrollForm(employees = []) {
  const now = new Date();
  return {
    employee: employees.length > 0 ? String(employees[0].id) : '',
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
    allowances: '0.00',
    deductions: '0.00',
  };
}

function Payroll() {
  const { showToast } = useToast();

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(() => getInitialPayrollForm());
  const [formError, setFormError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [payrollData, empData] = await Promise.all([
        payrollService.getAll(),
        employeeService.getAll(),
      ]);
      setRecords(payrollData);
      setEmployees(empData);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load payroll records.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openGenerateModal = () => {
    setForm(getInitialPayrollForm(employees));
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (isGenerating) return;
    setShowModal(false);
    setFormError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.employee) {
      setFormError('Please select an employee.');
      return;
    }

    const monthNum = Number(form.month);
    const yearNum = Number(form.year);
    const allowancesNum = Number(form.allowances);
    const deductionsNum = Number(form.deductions);

    if (Number.isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      setFormError('Please select a valid month.');
      return;
    }

    if (Number.isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      setFormError('Please enter a valid year.');
      return;
    }

    if (form.allowances === '' || Number.isNaN(allowancesNum) || allowancesNum < 0) {
      setFormError('Please enter a valid allowances amount.');
      return;
    }

    if (form.deductions === '' || Number.isNaN(deductionsNum) || deductionsNum < 0) {
      setFormError('Please enter a valid deductions amount.');
      return;
    }

    setIsGenerating(true);
    try {
      const payload = {
        employee: Number(form.employee),
        month: monthNum,
        year: yearNum,
        allowances: allowancesNum.toFixed(2),
        deductions: deductionsNum.toFixed(2),
      };

      await payrollService.create(payload);
      showToast('Payroll generated successfully.', 'success');
      setShowModal(false);
      await fetchData();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to generate payroll.');
      setFormError(msg);
      showToast(msg, 'danger');
    } finally {
      setIsGenerating(false);
    }
  };

  const hasStatusColumn = records.some((r) => Boolean(r.status || r.payroll_status));

  if (loading) {
    return <LoadingSpinner message="Loading payroll records..." fullHeight />;
  }

  return (
    <div>
      {error && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={fetchData}>
            Retry
          </Button>
        </Alert>
      )}

      <Card className="ems-card">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
          <h2 className="h5 mb-0 fw-semibold">Payroll Records</h2>
          <Button variant="primary" onClick={openGenerateModal}>
            <i className="bi bi-cash-coin me-2" />
            Generate Payroll
          </Button>
        </Card.Header>

        <Card.Body className="p-0">
          {records.length === 0 ? (
            <div className="ems-empty-state">
              <i className="bi bi-cash-stack" />
              <p className="mb-0">
                No payroll records found. Click "Generate Payroll" to create one.
              </p>
            </div>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Year</th>
                  <th className="text-end">Basic Salary</th>
                  <th className="text-end">Allowances</th>
                  <th className="text-end">Deductions</th>
                  <th className="text-end">Gross Salary</th>
                  <th className="text-end">Net Salary</th>
                  {hasStatusColumn && <th>Status</th>}
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => {
                  const statusValue = rec.status || rec.payroll_status;
                  return (
                    <tr key={rec.id || `${rec.employee}-${rec.month}-${rec.year}`}>
                      <td className="fw-medium">{getPayrollEmployeeLabel(rec, employees)}</td>
                      <td>{formatMonth(rec.month)}</td>
                      <td>{rec.year}</td>
                      <td className="text-end">{formatCurrency(rec.basic_salary)}</td>
                      <td className="text-end">{formatCurrency(rec.allowances)}</td>
                      <td className="text-end">{formatCurrency(rec.deductions)}</td>
                      <td className="text-end">{formatCurrency(rec.gross_salary)}</td>
                      <td className="text-end fw-semibold">{formatCurrency(rec.net_salary)}</td>
                      {hasStatusColumn && (
                        <td>
                          {statusValue ? (
                            <Badge bg={statusValue === 'PAID' ? 'success' : 'primary'}>
                              {statusValue}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton={!isGenerating}>
            <Modal.Title className="h5">Generate Payroll</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="small">
                {formError}
              </Alert>
            )}

            <Alert variant="info" className="small py-2">
              <i className="bi bi-info-circle me-2" />
              Basic salary, gross salary, and net salary are automatically calculated by the system.
            </Alert>

            <Form.Group className="mb-3" controlId="payrollEmployee">
              <Form.Label className="fw-medium">Employee</Form.Label>
              <Form.Select
                name="employee"
                value={form.employee}
                onChange={handleChange}
                disabled={isGenerating}
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {getEmployeeUsername(emp)} (Base: {formatCurrency(emp.base_salary)})
                  </option>
                ))}
              </Form.Select>
              {employees.length === 0 && (
                <Form.Text className="text-warning">
                  No employees found. Please add an employee first.
                </Form.Text>
              )}
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col sm={6}>
                <Form.Group controlId="payrollMonth">
                  <Form.Label className="fw-medium">Month</Form.Label>
                  <Form.Select
                    name="month"
                    value={form.month}
                    onChange={handleChange}
                    disabled={isGenerating}
                    required
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group controlId="payrollYear">
                  <Form.Label className="fw-medium">Year</Form.Label>
                  <Form.Control
                    type="number"
                    name="year"
                    min="2000"
                    max="2100"
                    value={form.year}
                    onChange={handleChange}
                    disabled={isGenerating}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3">
              <Col sm={6}>
                <Form.Group controlId="payrollAllowances">
                  <Form.Label className="fw-medium">Allowances</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="allowances"
                    value={form.allowances}
                    onChange={handleChange}
                    placeholder="e.g. 2000.00"
                    disabled={isGenerating}
                    required
                  />
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group controlId="payrollDeductions">
                  <Form.Label className="fw-medium">Deductions</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="deductions"
                    value={form.deductions}
                    onChange={handleChange}
                    placeholder="e.g. 500.00"
                    disabled={isGenerating}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={isGenerating}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isGenerating || employees.length === 0}
            >
              {isGenerating ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Generating...
                </>
              ) : (
                'Generate Payroll'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Payroll;
