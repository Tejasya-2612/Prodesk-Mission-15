import Header from './Header';
import Sidebar from './Sidebar';

function AppShell({ children, onCreateTask, onUpgrade = () => {} }) {
  return (
    <main className="dashboard-shell">
      <Sidebar />
      <section className="dashboard-main">
        <Header onCreateTask={onCreateTask} onUpgrade={onUpgrade} />
        {children}
      </section>
    </main>
  );
}

export default AppShell;
