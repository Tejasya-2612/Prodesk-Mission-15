import { useEffect, useState } from 'react';

const emptyTask = {
  title: '',
  description: '',
  status: 'To Do',
  priority: 'Medium',
  dueDate: ''
};

function TaskModal({ task, initialStatus = 'To Do', onClose, onSave }) {
  const [formData, setFormData] = useState(emptyTask);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'To Do',
        priority: task.priority || 'Medium',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ''
      });
    } else {
      setFormData({ ...emptyTask, status: initialStatus });
    }
  }, [task, initialStatus]);

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(formData);
  }

  return (
    <div className="modal-backdrop">
      <div className="task-modal">
        <div className="modal-header">
          <h3>{task ? 'Edit Task' : 'Create Task'}</h3>
          <button onClick={onClose}>Close</button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <label>
            Title
            <input name="title" value={formData.title} onChange={handleChange} required />
          </label>

          <label>
            Description
            <textarea name="description" value={formData.description} onChange={handleChange} />
          </label>

          <div className="form-row">
            <label>
              Status
              <select name="status" value={formData.status} onChange={handleChange}>
                <option>To Do</option>
                <option>In Progress</option>
                <option>Review</option>
                <option>Completed</option>
              </select>
            </label>

            <label>
              Priority
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
          </div>

          <label>
            Due Date
            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />
          </label>

          <button className="primary-btn" type="submit">
            {task ? 'Save Changes' : 'Add Task'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
