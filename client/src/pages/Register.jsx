import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { user, register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (err.message === 'Network Error' ? 'Cannot reach the API server. Check the deployed backend URL in VITE_API_URL.' : err.message) ||
        'Registration failed'
      );
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <div className="auth-brand">TaskMatrix</div>
          <span>Agile Project Operations</span>
          <h1>Create a secure workspace for serious delivery teams.</h1>
          <p>Your tasks stay private and are connected only to your account while your team moves from planning to shipped work.</p>
          <ul className="auth-points">
            <li>Private task boards</li>
            <li>Project-ready analytics</li>
            <li>Fast team onboarding</li>
          </ul>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <h2>Create account</h2>
            <p>Start your TaskMatrix workspace with a few details.</p>
          </div>
          {error && <div className="error-box">{error}</div>}

          <label>
            Name
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>

          <label>
            Email
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>

          <label>
            Password
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </label>

          <button className="primary-btn" type="submit">Create Account</button>
          <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
        </form>
      </section>
    </main>
  );
}

export default Register;
