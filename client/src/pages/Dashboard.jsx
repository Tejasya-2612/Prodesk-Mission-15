import { useEffect, useState } from 'react';
import AnalyticsCharts from '../components/AnalyticsCharts';
import Header from '../components/Header';
import KanbanBoard from '../components/KanbanBoard';
import Sidebar from '../components/Sidebar';
import StatsCards from '../components/StatsCards';
import TaskModal from '../components/TaskModal';
import { getDashboardActivity, getDashboardCharts, getDashboardStats, getUpcomingDeadlines } from '../services/dashboardService';
import { createProject, getProjects } from '../services/projectService';
import { createCheckoutSession } from '../services/stripeService';
import { createTask, deleteTask, getTasks, updateTask } from '../services/taskService';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    teamMembers: 0,
    tasksCompletedThisWeek: 0,
    projectsCreatedThisWeek: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0
  });
  const [charts, setCharts] = useState({ weeklyProgress: [], taskCompletion: [], projectProgress: [] });
  const [deadlines, setDeadlines] = useState([]);
  const [activity, setActivity] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [initialTaskStatus, setInitialTaskStatus] = useState('To Do');
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const [taskData, projectData, statsData, chartsData, deadlinesData, activityData] = await Promise.all([
        getTasks({ limit: 100, sort: 'position' }),
        getProjects({ limit: 50 }),
        getDashboardStats(),
        getDashboardCharts(),
        getUpcomingDeadlines(),
        getDashboardActivity()
      ]);
      setTasks(taskData.tasks);
      setProjects(projectData.projects);
      setStats(statsData);
      setCharts(chartsData);
      setDeadlines(deadlinesData.deadlines);
      setActivity(activityData.activities);
    } catch {
      setMessage('Could not load tasks');
    }
  }

  function openCreateModal(status = 'To Do') {
    setInitialTaskStatus(status);
    setSelectedTask(null);
    setShowModal(true);
  }

  function openEditModal(task) {
    setSelectedTask(task);
    setShowModal(true);
  }

  async function handleSave(taskData) {
    try {
      let projectId = taskData.projectId || projects[0]?._id;
      if (!projectId) {
        const data = await createProject({ title: 'Website Redesign', description: 'Redesign and optimize the marketing website for better performance.' });
        projectId = data.project._id;
        setProjects([data.project]);
      }

      if (selectedTask) {
        const data = await updateTask(selectedTask._id, { ...taskData, projectId });
        setTasks(tasks.map((task) => (task._id === selectedTask._id ? data.task : task)));
      } else {
        const data = await createTask({ ...taskData, projectId });
        setTasks([data.task, ...tasks]);
      }

      setShowModal(false);
      loadTasks();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Task could not be saved');
    }
  }

  async function handleDelete(taskId) {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((task) => task._id !== taskId));
      loadTasks();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Task could not be deleted');
    }
  }

  async function handleStatusChange(task, status) {
    try {
      const data = await updateTask(task._id, { ...task, status });
      setTasks(tasks.map((item) => (item._id === task._id ? data.task : item)));
      loadTasks();
    } catch {
      setMessage('Status could not be updated');
    }
  }

  async function handleTaskChecked(task, checked) {
    await handleStatusChange(task, checked ? 'Completed' : 'To Do');
  }

  async function handleUpgrade() {
    try {
      const data = await createCheckoutSession();
      window.location.href = data.url;
    } catch (err) {
      setMessage(err.response?.data?.message || 'Stripe checkout could not start');
    }
  }

  return (
    <main className="dashboard-shell">
      <Sidebar />

      <section className="dashboard-main">
        <Header onCreateTask={openCreateModal} onUpgrade={handleUpgrade} />
        {message && <div className="notice">{message}</div>}
        <StatsCards stats={stats} />
        <section className="dashboard-widgets">
          <article className="chart-card progress-card">
            <div className="card-heading">
              <h3>Project Progress Overview</h3>
              <button type="button">This Month</button>
            </div>
            <div className="progress-graph" aria-label="Project progress chart">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
              <svg viewBox="0 0 680 230" role="img">
                <path d={buildProgressPath(charts.weeklyProgress)} />
                {charts.weeklyProgress.length > 0 && <circle cx="410" cy={230 - ((charts.weeklyProgress[Math.min(2, charts.weeklyProgress.length - 1)].value || 0) * 2.1)} r="5" />}
              </svg>
              <div className="graph-tooltip">Completion<br /><strong>Progress: {stats.completionRate}%</strong></div>
              <div className="graph-dates">
                {(charts.weeklyProgress.length ? charts.weeklyProgress : [{ name: '-' }]).map((item) => <span key={item.name}>{item.name}</span>)}
              </div>
            </div>
          </article>

          <article className="chart-card deadlines-card">
            <div className="card-heading">
              <h3>Upcoming Deadlines</h3>
              <a href="#tasks">View all</a>
            </div>
            {deadlines.map((task) => (
              <div className={`deadline-item ${priorityTone(task.priority)}`} key={task._id}>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.projectId?.title || 'No project'} - {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                </div>
                <small>{task.priority}</small>
              </div>
            ))}
            {deadlines.length === 0 && <p className="empty-copy">No upcoming deadlines.</p>}
          </article>
        </section>
        <section className="lower-widgets">
          <article className="chart-card activity-card">
            <div className="card-heading">
              <h3>Recent Activity</h3>
              <a href="#tasks">View all</a>
            </div>
            {activity.map((item) => (
              <div className="activity-item" key={item._id}>
                <div className="mini-avatar">{initials(item.userId?.name)}</div>
                <p><strong>{item.userId?.name || 'User'}</strong> {item.action.toLowerCase()}<span>{item.targetName} - {new Date(item.createdAt).toLocaleString()}</span></p>
              </div>
            ))}
            {activity.length === 0 && <p className="empty-copy">No recent activity yet.</p>}
          </article>
          <article className="chart-card assigned-card">
            <div className="card-heading">
              <h3>Assigned Tasks</h3>
              <a href="#tasks">View all</a>
            </div>
            {tasks.filter((task) => task.status !== 'Completed').slice(0, 4).map((task) => (
              <div className="assigned-task" key={task._id}>
                <input type="checkbox" checked={task.status === 'Completed'} onChange={(event) => handleTaskChecked(task, event.target.checked)} />
                <strong>{task.title}</strong>
                <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
              </div>
            ))}
            {tasks.filter((task) => task.status !== 'Completed').length === 0 && <p className="empty-copy">No assigned tasks.</p>}
          </article>
        </section>
        <KanbanBoard
          tasks={tasks}
          project={projects[0]}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onCreateTask={openCreateModal}
        />
        <AnalyticsCharts tasks={tasks} charts={charts} />
      </section>

      {showModal && (
        <TaskModal
          task={selectedTask}
          initialStatus={initialTaskStatus}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </main>
  );
}

function initials(name = 'User') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function priorityTone(priority) {
  if (priority === 'High') return 'red';
  if (priority === 'Medium') return 'orange';
  return 'blue';
}

function buildProgressPath(points = []) {
  if (!points.length) return 'M24 210 L640 210';
  const step = points.length > 1 ? 616 / (points.length - 1) : 0;
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${24 + index * step} ${220 - Math.min(point.value || 0, 100) * 2}`).join(' ');
}

export default Dashboard;
