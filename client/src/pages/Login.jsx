import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (err.message === 'Network Error' ? 'Cannot reach the API server. Check the deployed backend URL in VITE_API_URL.' : err.message) ||
        'Login failed'
      );
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <div className="auth-brand">TaskMatrix</div>
          <span>Agile Project Operations</span>
          <h1>Secure access for teams managing serious delivery work.</h1>
          <p>Phase 2 establishes the authentication foundation before dashboards, projects, boards, and task movement are added on top.</p>
          <ul className="auth-points">
            <li>Role based access</li>
            <li>Persistent sessions</li>
            <li>Protected team workspaces</li>
          </ul>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <h2>Sign in</h2>
            <p>Use your workspace account to continue into TaskMatrix.</p>
          </div>
          {error && <div className="error-box">{error}</div>}

          <label>
            Email
            <span className="input-wrap">
              <span>@</span>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="atejasya8@gmail.com" required />
            </span>
          </label>

          <label>
            <span className="label-row">
              Password
              <a href="#forgot">Forgot password?</a>
            </span>
            <span className="input-wrap">
              <span>#</span>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </span>
          </label>

          <label className="remember-row">
            <input type="checkbox" defaultChecked />
            Remember me
          </label>

          <button className="primary-btn" type="submit">Sign in</button>
          <div className="or-divider"><span>OR</span></div>
          <button className="google-btn" type="button"><span>G</span> Sign in with Google</button>
          <p className="auth-switch">New to TaskMatrix? <Link to="/register">Create an account</Link></p>
        </form>
      </section>
    </main>
  );
}

export default Login;
