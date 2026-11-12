import { Spinner } from 'react-bootstrap';

function LoadingSpinner({ message = 'Loading...', fullHeight = false }) {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center ${
        fullHeight ? 'py-5 my-5' : 'py-5'
      }`}
    >
      <Spinner animation="border" variant="primary" role="status">
        <span className="visually-hidden">{message}</span>
      </Spinner>
      {message && <p className="text-muted mt-2 mb-0 small">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
