import Icon from './Icon';

function StatsCards({ stats }) {
  const cards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: 'folder', delta: `${stats.projectsCreatedThisWeek} from last week`, tone: 'blue' },
    { label: 'Total Tasks', value: stats.totalTasks, icon: 'clipboard', delta: `${stats.pendingTasks} pending`, tone: 'green' },
    { label: 'Completed Tasks', value: stats.completedTasks, icon: 'target', delta: `${stats.tasksCompletedThisWeek} from last week`, tone: 'orange' },
    { label: 'Team Members', value: stats.teamMembers, icon: 'people', delta: `${stats.overdueTasks} overdue tasks`, tone: 'red' }
  ];

  return (
    <section className="stats-grid">
      {cards.map((card) => (
        <article className="stat-card" key={card.label}>
          <div className={`stat-icon ${card.tone}`}><Icon name={card.icon} size={22} /></div>
          <div>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.delta}</small>
          </div>
          <button type="button" aria-label="More options"><Icon name="more" size={18} /></button>
        </article>
      ))}
    </section>
  );
}

export default StatsCards;
