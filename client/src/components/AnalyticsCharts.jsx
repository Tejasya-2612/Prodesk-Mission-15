import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const colors = ['#4969f5', '#21b8a8', '#f3a83b', '#ef5b5b'];

function countBy(tasks, field, options) {
  return options.map((item) => ({
    name: item,
    value: tasks.filter((task) => task[field] === item).length
  }));
}

function getWeeklyData(tasks) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return days.map((day, index) => ({
    name: day,
    tasks: tasks.filter((task) => new Date(task.createdAt).getDay() === index).length
  }));
}

function AnalyticsCharts({ tasks }) {
  const statusData = countBy(tasks, 'status', ['To Do', 'In Progress', 'Review', 'Completed']);
  const priorityData = countBy(tasks, 'priority', ['Low', 'Medium', 'High']);
  const completed = tasks.filter((task) => task.status === 'Completed').length;
  const pending = tasks.length - completed;
  const progressData = [
    { name: 'Completed', value: completed },
    { name: 'Pending', value: pending }
  ];

  return (
    <section className="analytics-section" id="analytics">
      <div className="section-heading">
        <h3>Task Performance</h3>
        <p>Live task distribution from your workspace.</p>
      </div>

      <div className="charts-grid">
        <article className="chart-card">
          <h4>Tasks by Status</h4>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#4969f5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="chart-card">
          <h4>Tasks by Priority</h4>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" outerRadius={80} label>
                {priorityData.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="chart-card">
          <h4>Completed vs Pending</h4>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={progressData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} label>
                {progressData.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index + 1]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="chart-card">
          <h4>Weekly Task Creation</h4>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={getWeeklyData(tasks)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="tasks" fill="#21b8a8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </div>
    </section>
  );
}

export default AnalyticsCharts;
