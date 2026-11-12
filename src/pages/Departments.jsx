import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Modal, Spinner, Table } from 'react-bootstrap';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { extractErrorMessage } from '../services/api';
import departmentService from '../services/departmentService';

const INITIAL_FORM = {
  name: '',
  description: '',
};

function Departments() {
  const { showToast } = useToast();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load departments.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const openAddModal = () => {
    setEditingDepartment(null);
    setForm(INITIAL_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (department) => {
    setEditingDepartment(department);
    setForm({
      name: department.name || '',
      description: department.description || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setShowModal(false);
    setEditingDepartment(null);
    setFormError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('Department name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
      };

      if (editingDepartment) {
        await departmentService.update(editingDepartment.id, payload);
        showToast('Department updated successfully.', 'success');
      } else {
        await departmentService.create(payload);
        showToast('Department added successfully.', 'success');
      }

      setShowModal(false);
      setEditingDepartment(null);
      await fetchDepartments();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to save department.');
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
      await departmentService.remove(deleteTarget.id);
      showToast('Department deleted successfully.', 'success');
      setDeleteTarget(null);
      await fetchDepartments();
    } catch (err) {
      showToast(extractErrorMessage(err, 'Failed to delete department.'), 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading departments..." fullHeight />;
  }

  return (
    <div>
      {error && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={fetchDepartments}>
            Retry
          </Button>
        </Alert>
      )}

      <Card className="ems-card">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
          <h2 className="h5 mb-0 fw-semibold">Departments</h2>
          <Button variant="primary" onClick={openAddModal}>
            <i className="bi bi-plus-circle me-2" />
            Add Department
          </Button>
        </Card.Header>

        <Card.Body className="p-0">
          {departments.length === 0 ? (
            <div className="ems-empty-state">
              <i className="bi bi-building" />
              <p className="mb-0">No departments found. Click "Add Department" to create one.</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id}>
                    <td className="fw-medium">{dept.name}</td>
                    <td>{dept.description || '-'}</td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => openEditModal(dept)}
                      >
                        <i className="bi bi-pencil-square me-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setDeleteTarget(dept)}
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

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton={!isSaving}>
            <Modal.Title className="h5">
              {editingDepartment ? 'Edit Department' : 'Add Department'}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {formError && (
              <Alert variant="danger" className="small">
                {formError}
              </Alert>
            )}

            <Form.Group className="mb-3" controlId="deptName">
              <Form.Label className="fw-medium">Department Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. IT"
                disabled={isSaving}
                required
              />
            </Form.Group>

            <Form.Group controlId="deptDescription">
              <Form.Label className="fw-medium">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. Information Technology"
                disabled={isSaving}
              />
            </Form.Group>
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
              ) : editingDepartment ? (
                'Update Department'
              ) : (
                'Create Department'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete Department"
        message={
          deleteTarget
            ? `Are you sure you want to delete the "${deleteTarget.name}" department?`
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

export default Departments;
