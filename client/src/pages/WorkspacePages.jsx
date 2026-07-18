import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppShell from '../components/AppShell';
import TaskModal from '../components/TaskModal';
import { createBoard, getBoards } from '../services/boardService';
import { createProject, getProjects } from '../services/projectService';
import {
  createCalendarEvent,
  createFile,
  createMessage,
  createReport,
  deleteFile,
  getCalendarEvents,
  getFiles,
  getMessages,
  getNotifications,
  getReports,
  getTeamSummary,
  globalSearch,
  inviteUser,
  markNotificationRead,
  updateUser
} from '../services/supportService';
import { createTask, deleteTask, getTasks, updateTask } from '../services/taskService';

function PageFrame({ title, subtitle, children }) {
  return (
    <>
      <div className="workspace-page-heading">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {children}
    </>
  );
}

function DataTable({ columns, rows, emptyText }) {
  return (
    <div className="data-card">
      <table className="data-table">
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id || row.id}>
              {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="empty-copy">{emptyText}</p>}
    </div>
  );
}

function useAsync(load, deps = []) {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    load()
      .then((result) => { if (active) setData(result); })
      .catch((error) => { if (active) setMessage(error.response?.data?.message || 'Could not load data'); });
    return () => { active = false; };
  }, deps);

  return { data, setData, message, setMessage };
}

export function ProjectsPage() {
  const { data, setData, message, setMessage } = useAsync(() => getProjects({ limit: 100 }), []);
  const [title, setTitle] = useState('');

  async function handleCreate(event) {
    event.preventDefault();
    try {
      const result = await createProject({ title, description: 'Project created from TaskMatrix', status: 'Active' });
      setData({ ...data, projects: [result.project, ...(data?.projects || [])] });
      setTitle('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not create project');
    }
  }

  return (
    <AppShell>
      <PageFrame title="Projects" subtitle="Create and track real project records from MongoDB.">
        {message && <div className="notice">{message}</div>}
        <form className="inline-form" onSubmit={handleCreate}>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Project title" required />
          <button className="primary-btn" type="submit">Create Project</button>
        </form>
        <DataTable
          columns={[
            { key: 'title', label: 'Project' },
            { key: 'status', label: 'Status' },
            { key: 'priority', label: 'Priority' },
            { key: 'progress', label: 'Progress', render: (row) => `${row.progress || 0}%` },
            { key: 'dueDate', label: 'Due Date', render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : 'Not set' }
          ]}
          rows={data?.projects || []}
          emptyText="No projects yet."
        />
      </PageFrame>
    </AppShell>
  );
}

export function TasksPage() {
  const { data, setData, message, setMessage } = useAsync(() => getTasks({ limit: 100 }), []);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  async function handleSave(taskData) {
    try {
      const result = selectedTask ? await updateTask(selectedTask._id, taskData) : await createTask(taskData);
      const nextTasks = selectedTask
        ? (data?.tasks || []).map((task) => task._id === selectedTask._id ? result.task : task)
        : [result.task, ...(data?.tasks || [])];
      setData({ ...data, tasks: nextTasks });
      setShowModal(false);
      setSelectedTask(null);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not save task');
    }
  }

  async function handleDelete(taskId) {
    await deleteTask(taskId);
    setData({ ...data, tasks: (data?.tasks || []).filter((task) => task._id !== taskId) });
  }

  return (
    <AppShell onCreateTask={() => setShowModal(true)}>
      <PageFrame title="Tasks" subtitle="Manage task CRUD, assignments, statuses, priorities, and due dates.">
        {message && <div className="notice">{message}</div>}
        <button className="primary-btn page-action" onClick={() => setShowModal(true)}>+ Add Task</button>
        <DataTable
          columns={[
            { key: 'title', label: 'Task' },
            { key: 'status', label: 'Status' },
            { key: 'priority', label: 'Priority' },
            { key: 'assignedTo', label: 'Assigned', render: (row) => row.assignedTo?.name || 'Unassigned' },
            { key: 'dueDate', label: 'Due Date', render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : 'Not set' },
            { key: 'actions', label: 'Actions', render: (row) => (
              <div className="table-actions">
                <button onClick={() => { setSelectedTask(row); setShowModal(true); }}>Edit</button>
                <button onClick={() => handleDelete(row._id)}>Delete</button>
              </div>
            ) }
          ]}
          rows={data?.tasks || []}
          emptyText="No tasks yet."
        />
      </PageFrame>
      {showModal && <TaskModal task={selectedTask} onClose={() => setShowModal(false)} onSave={handleSave} />}
    </AppShell>
  );
}

export function BoardsPage() {
  const { data, setData, message, setMessage } = useAsync(getBoards, []);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    getProjects({ limit: 100 }).then((result) => {
      setProjects(result.projects);
      setProjectId(result.projects[0]?._id || '');
    });
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    try {
      const result = await createBoard({ projectId });
      setData({ ...data, boards: [result.board, ...(data?.boards || [])] });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not create board');
    }
  }

  return (
    <AppShell>
      <PageFrame title="Boards" subtitle="Create boards with real columns and task ordering support.">
        {message && <div className="notice">{message}</div>}
        <form className="inline-form" onSubmit={handleCreate}>
          <select value={projectId} onChange={(event) => setProjectId(event.target.value)} required>
            {projects.map((project) => <option value={project._id} key={project._id}>{project.title}</option>)}
          </select>
          <button className="primary-btn" type="submit" disabled={!projectId}>Create Board</button>
        </form>
        <DataTable
          columns={[
            { key: 'title', label: 'Board' },
            { key: 'projectId', label: 'Project', render: (row) => row.projectId?.title || 'Project' },
            { key: 'columns', label: 'Columns', render: (row) => row.columns?.map((column) => column.title).join(', ') }
          ]}
          rows={data?.boards || []}
          emptyText="No boards yet. Create a project first, then create a board."
        />
      </PageFrame>
    </AppShell>
  );
}

export function CalendarPage() {
  const { data, setData, message, setMessage } = useAsync(getCalendarEvents, []);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');

  async function handleCreate(event) {
    event.preventDefault();
    try {
      const result = await createCalendarEvent({ title, start });
      setData({ ...data, events: [result.event, ...(data?.events || [])] });
      setTitle('');
      setStart('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not create event');
    }
  }

  return (
    <AppShell>
      <PageFrame title="Calendar" subtitle="Events and task dates from the backend calendar API.">
        {message && <div className="notice">{message}</div>}
        <form className="inline-form" onSubmit={handleCreate}>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Event title" required />
          <input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} required />
          <button className="primary-btn" type="submit">Add Event</button>
        </form>
        <DataTable columns={[
          { key: 'title', label: 'Event' },
          { key: 'start', label: 'Start', render: (row) => new Date(row.start).toLocaleString() },
          { key: 'type', label: 'Type' }
        ]} rows={data?.events || []} emptyText="No calendar events yet." />
      </PageFrame>
    </AppShell>
  );
}

export function ReportsPage() {
  const { data, setData, message, setMessage } = useAsync(getReports, []);

  async function handleCreate(type) {
    try {
      const result = await createReport({ title: `${type} Report`, type, data: {} });
      setData({ ...data, reports: [result.report, ...(data?.reports || [])] });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not generate report');
    }
  }

  return (
    <AppShell>
      <PageFrame title="Reports" subtitle="Generate weekly, monthly, project, team, and task reports.">
        {message && <div className="notice">{message}</div>}
        <div className="button-row">
          {['Weekly', 'Monthly', 'Project', 'Team', 'Task'].map((type) => <button className="secondary-btn" onClick={() => handleCreate(type)} key={type}>{type}</button>)}
        </div>
        <DataTable columns={[
          { key: 'title', label: 'Report' },
          { key: 'type', label: 'Type' },
          { key: 'createdAt', label: 'Created', render: (row) => new Date(row.createdAt).toLocaleString() }
        ]} rows={data?.reports || []} emptyText="No reports generated yet." />
      </PageFrame>
    </AppShell>
  );
}

export function TeamPage() {
  const { data, setData, message, setMessage } = useAsync(getTeamSummary, []);
  const [email, setEmail] = useState('');

  async function handleInvite(event) {
    event.preventDefault();
    try {
      await inviteUser({ email, role: 'Member' });
      setEmail('');
      setData(await getTeamSummary());
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not invite user');
    }
  }

  async function handleRole(user, role) {
    await updateUser(user.id || user._id, { role });
    setData(await getTeamSummary());
  }

  return (
    <AppShell>
      <PageFrame title="Team" subtitle={`${data?.activeMembers || 0} active of ${data?.totalMembers || 0} total members.`}>
        {message && <div className="notice">{message}</div>}
        <form className="inline-form" onSubmit={handleInvite}>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="teammate@email.com" required />
          <button className="primary-btn" type="submit">Invite Member</button>
        </form>
        <DataTable columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role', render: (row) => (
            <select value={row.role} onChange={(event) => handleRole(row, event.target.value)}>
              <option>Admin</option>
              <option>Manager</option>
              <option>Member</option>
            </select>
          ) },
          { key: 'assignedTasks', label: 'Tasks' },
          { key: 'completionRate', label: 'Completion', render: (row) => `${row.completionRate}%` },
          { key: 'lastActive', label: 'Last Active', render: (row) => row.lastActive ? new Date(row.lastActive).toLocaleString() : 'Never' }
        ]} rows={data?.members || []} emptyText="No team members yet." />
      </PageFrame>
    </AppShell>
  );
}

export function MessagesPage() {
  const { data, setData, message, setMessage } = useAsync(getMessages, []);
  const [body, setBody] = useState('');

  async function handleSend(event) {
    event.preventDefault();
    try {
      const result = await createMessage({ conversationId: 'workspace', body, recipientIds: [] });
      setData({ ...data, messages: [result.message, ...(data?.messages || [])] });
      setBody('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not send message');
    }
  }

  return (
    <AppShell>
      <PageFrame title="Messages" subtitle={`${data?.unread || 0} unread messages.`}>
        {message && <div className="notice">{message}</div>}
        <form className="inline-form" onSubmit={handleSend}>
          <input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a workspace message" required />
          <button className="primary-btn" type="submit">Send</button>
        </form>
        <DataTable columns={[
          { key: 'body', label: 'Message' },
          { key: 'createdAt', label: 'Sent', render: (row) => new Date(row.createdAt).toLocaleString() }
        ]} rows={data?.messages || []} emptyText="No messages yet." />
      </PageFrame>
    </AppShell>
  );
}

export function FilesPage() {
  const { data, setData, message, setMessage } = useAsync(getFiles, []);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  async function handleCreate(event) {
    event.preventDefault();
    try {
      const result = await createFile({ name, url, mimeType: 'link' });
      setData({ ...data, files: [result.file, ...(data?.files || [])] });
      setName('');
      setUrl('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not add file');
    }
  }

  async function handleDelete(fileId) {
    await deleteFile(fileId);
    setData({ ...data, files: (data?.files || []).filter((file) => file._id !== fileId) });
  }

  return (
    <AppShell>
      <PageFrame title="Files" subtitle="Store file metadata and links from the backend.">
        {message && <div className="notice">{message}</div>}
        <form className="inline-form" onSubmit={handleCreate}>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="File name" required />
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://..." required />
          <button className="primary-btn" type="submit">Add File</button>
        </form>
        <DataTable columns={[
          { key: 'name', label: 'Name' },
          { key: 'url', label: 'Preview', render: (row) => <a href={row.url} target="_blank" rel="noreferrer">Open</a> },
          { key: 'createdAt', label: 'Uploaded', render: (row) => new Date(row.createdAt).toLocaleString() },
          { key: 'actions', label: 'Actions', render: (row) => <button onClick={() => handleDelete(row._id)}>Delete</button> }
        ]} rows={data?.files || []} emptyText="No files yet." />
      </PageFrame>
    </AppShell>
  );
}

export function NotificationsPage() {
  const { data, setData } = useAsync(getNotifications, []);

  async function handleRead(notificationId) {
    await markNotificationRead(notificationId);
    setData(await getNotifications());
  }

  return (
    <AppShell>
      <PageFrame title="Notifications" subtitle={`${data?.unread || 0} unread notifications.`}>
        <DataTable columns={[
          { key: 'title', label: 'Title' },
          { key: 'type', label: 'Type' },
          { key: 'priority', label: 'Priority' },
          { key: 'read', label: 'Status', render: (row) => row.read ? 'Read' : <button onClick={() => handleRead(row._id)}>Mark read</button> },
          { key: 'createdAt', label: 'Created', render: (row) => new Date(row.createdAt).toLocaleString() }
        ]} rows={data?.notifications || []} emptyText="No notifications yet." />
      </PageFrame>
    </AppShell>
  );
}

export function SettingsPage() {
  return (
    <AppShell>
      <PageFrame title="Settings" subtitle="Workspace settings are connected to profile and team APIs.">
        <div className="data-card">
          <p>Use Team to manage roles and invitations. Use Tasks, Projects, Boards, Files, Reports, and Calendar to manage workspace data.</p>
        </div>
      </PageFrame>
    </AppShell>
  );
}

export function SearchPage() {
  const { search } = useLocation();
  const q = useMemo(() => new URLSearchParams(search).get('q') || '', [search]);
  const { data } = useAsync(() => globalSearch(q), [q]);
  const rows = [
    ...(data?.projects || []).map((item) => ({ ...item, type: 'Project' })),
    ...(data?.tasks || []).map((item) => ({ ...item, type: 'Task' })),
    ...(data?.users || []).map((item) => ({ ...item, title: item.name, type: 'User' })),
    ...(data?.messages || []).map((item) => ({ ...item, title: item.body, type: 'Message' })),
    ...(data?.files || []).map((item) => ({ ...item, title: item.name, type: 'File' }))
  ];

  return (
    <AppShell>
      <PageFrame title="Search" subtitle={`Results for "${q}".`}>
        <DataTable columns={[
          { key: 'type', label: 'Type' },
          { key: 'title', label: 'Result' },
          { key: 'createdAt', label: 'Created', render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString() : '' }
        ]} rows={rows} emptyText="No results found." />
      </PageFrame>
    </AppShell>
  );
}
