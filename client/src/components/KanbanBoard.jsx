import Icon from './Icon';

const columns = ['To Do', 'In Progress', 'Review', 'Completed'];

function KanbanBoard({ tasks, project, onEdit, onDelete, onStatusChange, onCreateTask }) {
  return (
    <section className="kanban-section" id="tasks">
      <div className="board-topline">
        <div>
          <div className="breadcrumbs"><Icon name="columns" size={14} /> Boards <span>›</span> {project?.title || 'Workspace Board'}</div>
          <h3>{project?.title || 'Workspace Board'} <Icon name="star" size={18} /></h3>
          <p>{project?.description || 'Create a project and add tasks to start tracking work.'}</p>
        </div>
        <div className="board-actions">
          <button type="button"><Icon name="listChecks" size={15} /> Filter</button>
          <button type="button"><Icon name="columns" size={15} /> Group by: Status</button>
        </div>
      </div>

      <div className="kanban-board">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column);

          return (
            <div className="kanban-column" key={column}>
              <div className="column-title">
                <h4><i />{column}</h4>
                <span>{columnTasks.length}</span>
                <button type="button" onClick={() => onCreateTask?.(column)} aria-label={`Add ${column} task`}><Icon name="plus" size={18} /></button>
              </div>

              {columnTasks.map((task, index) => (
                <article className="task-card" key={task._id}>
                  <div className="task-top">
                    <h5>{task.title}</h5>
                    <button type="button" aria-label="Bookmark"><Icon name="star" size={15} /></button>
                  </div>

                  <div className="assignee-row">
                    <div className="mini-avatar">{task.assignedTo?.name ? task.assignedTo.name.split(' ').map((part) => part[0]).join('') : 'UA'}</div>
                    <span>{task.assignedTo?.name || 'Unassigned'}</span>
                  </div>

                  <div className="task-footer">
                    <small>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</small>
                    <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                  </div>
                  {column === 'In Progress' && <div className="task-progress"><span style={{ width: index === 0 ? '60%' : '40%' }} /></div>}
                  <div className="task-controls">
                    <select value={task.status} onChange={(event) => onStatusChange(task, event.target.value)}>
                      {columns.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                    <button onClick={() => onEdit(task)}><Icon name="settings" size={13} /> Edit</button>
                    <button className="danger" onClick={() => onDelete(task._id)}><Icon name="archive" size={13} /> Delete</button>
                  </div>
                </article>
              ))}
              {columnTasks.length === 0 && <div className="empty-column">No {column.toLowerCase()} tasks.</div>}
              <button className="add-card" type="button" onClick={() => onCreateTask?.(column)}><Icon name="plus" size={15} /> Add Task</button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default KanbanBoard;
