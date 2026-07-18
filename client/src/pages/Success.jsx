import { Link } from 'react-router-dom';

function Success() {
  return (
    <main className="status-page">
      <section>
        <h1>Payment Successful</h1>
        <p>Your Pro upgrade checkout was completed in test mode.</p>
        <Link className="primary-btn" to="/dashboard">Back to Dashboard</Link>
      </section>
    </main>
  );
}

export default Success;

