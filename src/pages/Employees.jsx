import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Modal,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { extractErrorMessage } from '../services/api';
import departmentService from '../services/departmentService';
import employeeService from '../services/employeeService';
import {
  EMPLOYMENT_TYPES,
  formatCurrency,
  formatEmploymentType,
  getDepartmentId,
  getDepartmentName,
  getEmployeeEmail,
  getEmployeeRole,
  getEmployeeUsername,
} from '../utils/formatters';

const INITIAL_FORM = {
  username: '',
  email: '',
  password: '',
  role: 'EMPLOYEE',
  department_id: '',
  employment_type: 'FULL_TIME',
  base_salary: '',
};

function Employees() {
  const { showToast } = useToast();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
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
      setError(extractErrorMessage(err, 'Failed to load employees.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAddModal = () => {
    setEditingEmployee(null);
    setForm({
      ...INITIAL_FORM,
      department_id: departments.length > 0 ? String(departments[0].id) : '',
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setForm({
      username: getEmployeeUsername(employee),
      email: getEmployeeEmail(employee) === '-' ? '' : getEmployeeEmail(employee),
      password: '',
      role: getEmployeeRole(employee),
      department_id: String(getDepartmentId(employee) || ''),
      employment_type: employee.employment_type || 'FULL_TIME',
      base_salary: employee.base_salary !== undefined && employee.base_salary !== null
        ? String(employee.base_salary)
        : '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setShowModal(false);
    setEditingEmployee(null);
    setFormError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.username.trim() || !form.email.trim()) {
      setFormError('Username and email are required.');
      return;
    }

    if (!editingEmployee && !form.password) {
      setFormError('Password is required when creating a new employee.');
      return;
    }

    if (!form.department_id) {
      setFormError('Please select a department.');
      return;
    }

    const salaryNum = Number(form.base_salary);
    if (form.base_salary === '' || Number.isNaN(salaryNum) || salaryNum < 0) {
      setFormError('Please enter a valid base salary.');
      return;
    }

    setIsSaving(true);
    try {
      const formattedSalary = salaryNum.toFixed(2);

      if (editingEmployee) {
        const payload = {
          department_id: Number(form.department_id),
          employment_type: form.employment_type,
          base_salary: formattedSalary,
        };

        const userUpdates = {};
        if (form.username.trim() !== getEmployeeUsername(editingEmployee)) {
          userUpdates.username = form.username.trim();
        }
        if (form.email.trim() !== getEmployeeEmail(editingEmployee)) {
          userUpdates.email = form.email.trim();
        }
        if (form.role !== getEmployeeRole(editingEmployee)) {
          userUpdates.role = form.role;
        }
        if (form.password) {
          userUpdates.password = form.password;
        }
        if (Object.keys(userUpdates).length > 0) {
          payload.user = userUpdates;
        }

        await employeeService.partialUpdate(editingEmployee.id, payload);
        showToast('Employee updated successfully.', 'success');
      } else {
        const payload = {
          user: {
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
            role: form.role,
          },
          department_id: Number(form.department_id),
          employment_type: form.employment_type,
          base_salary: formattedSalary,
        };

        await employeeService.create(payload);
        showToast('Employee added successfully.', 'success');
      }

      setShowModal(false);
      setEditingEmployee(null);
      await fetchData();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to save employee.');
      setFormError(msg);
      showToast(msg, 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await employeeService.remove(deleteTarget.id);
      showToast('Employee deleted successfully.', 'success');
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      showToast(extractErrorMessage(err, 'Failed to delete employee.'), 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  const normalizedQuery = searchTerm.trim().toLowerCase();
  const filteredEmployees = employees.filter((emp) => {
    if (!normalizedQuery) return true;
    const uname = getEmployeeUsername(emp).toLowerCase();
    const uemail = getEmployeeEmail(emp).toLowerCase();
    return uname.includes(normalizedQuery) || uemail.includes(normalizedQuery);
  });

  if (loading) {
    return <LoadingSpinner message="Loading employees..." fullHeight />;
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
        <Card.Header className="bg-white py-3">
          <Row className="g-2 align-items-center justify-content-between">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text className="bg-light">
                  <i className="bi bi-search" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                  >
                    <i className="bi bi-x-lg" />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md="auto">
              <Button variant="primary" onClick={openAddModal}>
                <i className="bi bi-person-plus-fill me-2" />
                Add Employee
              </Button>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {filteredEmployees.length === 0 ? (
            <div className="ems-empty-state">
              <i className="bi bi-people" />
              <p className="mb-0">
                {employees.length === 0
                  ? 'No employees found. Click "Add Employee" to create one.'
                  : 'No employees match your search criteria.'}
              </p>
            </div>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name / Username</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Employment Type</th>
                  <th className="text-end">Base Salary</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
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
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => openEditModal(emp)}
                      >
                        <i className="bi bi-pencil-square me-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setDeleteTarget(emp)}
                      >
                        <i className="bi bi-trash me-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton={!isSaving}>
            <Modal.Title className="h5">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="small">
                {formError}
              </Alert>
            )}

            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="empUsername">
                  <Form.Label className="fw-medium">Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="e.g. john"
                    disabled={isSaving}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="empEmail">
                  <Form.Label className="fw-medium">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="e.g. john@example.com"
                    disabled={isSaving}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="empPassword">
                  <Form.Label className="fw-medium">
                    Password {editingEmployee && <span className="text-muted fw-normal">(Optional)</span>}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={
                      editingEmployee ? 'Leave blank to keep current password' : 'Enter password'
                    }
                    disabled={isSaving}
                    required={!editingEmployee}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="empRole">
                  <Form.Label className="fw-medium">Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    disabled={isSaving}
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="HR_ADMIN">HR_ADMIN</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="empDepartment">
                  <Form.Label className="fw-medium">Department</Form.Label>
                  <Form.Select
                    name="department_id"
                    value={form.department_id}
                    onChange={handleChange}
                    disabled={isSaving}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </Form.Select>
                  {departments.length === 0 && (
                    <Form.Text className="text-warning">
                      No departments available. Please create a department first.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="empType">
                  <Form.Label className="fw-medium">Employment Type</Form.Label>
                  <Form.Select
                    name="employment_type"
                    value={form.employment_type}
                    onChange={handleChange}
                    disabled={isSaving}
                  >
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="empSalary">
                  <Form.Label className="fw-medium">Base Salary</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="base_salary"
                    value={form.base_salary}
                    onChange={handleChange}
                    placeholder="e.g. 25000.00"
                    disabled={isSaving}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : editingEmployee ? (
                'Update Employee'
              ) : (
                'Create Employee'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete Employee"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${getEmployeeUsername(deleteTarget)}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default Employees;
