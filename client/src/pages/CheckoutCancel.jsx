import { Link } from 'react-router-dom';

function CheckoutCancel() {
  return (
    <main className="status-page">
      <section>
        <h1>Checkout Cancelled</h1>
        <p>You can return to the dashboard and try again anytime.</p>
        <Link className="primary-btn" to="/dashboard">Back to Dashboard</Link>
      </section>
    </main>
  );
}

export default CheckoutCancel;

