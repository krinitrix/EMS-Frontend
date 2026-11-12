import { Button, Modal, Spinner } from 'react-bootstrap';

function ConfirmModal({
  show,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Delete',
  confirmVariant = 'danger',
  isProcessing = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal show={show} onHide={isProcessing ? undefined : onCancel} centered>
      <Modal.Header closeButton={!isProcessing}>
        <Modal.Title className="h5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-0">{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Processing...
            </>
          ) : (
            confirmText
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmModal;
