import { useState, useEffect } from "react";

const API = "http://localhost:5000/tasks";

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  function fetchTasks() {
    setLoading(true);
    fetch(API)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch tasks");
        return res.json();
      })
      .then((data) => setTasks(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);

    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    })
      .then((res) => res.json())
      .then((newTask) => {
        setTasks((prev) => [...prev, newTask]);
        setTitle("");
        setDescription("");
      })
      .finally(() => setSubmitting(false));
  }

  function toggleComplete(task) {
    fetch(`${API}/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      });
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  }

  function saveEdit(id) {
    fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, description: editDescription }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setEditingId(null);
      });
  }

  function deleteTask(id) {
    fetch(`${API}/${id}`, { method: "DELETE" }).then(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setConfirmDeleteId(null);
    });
  }

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  if (loading) return <p className="status">Loading tasks...</p>;
  if (error) return <p className="status error">Error: {error}</p>;

  return (
    <div className="wrap">
      <form className="add-form" onSubmit={addTask}>
        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Task"}
        </button>
      </form>

      <div className="filters">
        {["all", "active", "completed"].map((f) => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="list">
        {filtered.map((task) => (
          <div key={task.id} className="task-card">
            {editingId === task.id ? (
              <div className="edit-form">
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                <div className="row">
                  <button onClick={() => saveEdit(task.id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="task-main">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task)}
                  />
                  <div>
                    <p className={task.completed ? "done" : ""}>{task.title}</p>
                    {task.description && <p className="desc">{task.description}</p>}
                  </div>
                </div>
                <div className="row">
                  <button onClick={() => startEdit(task)}>Edit</button>
                  {confirmDeleteId === task.id ? (
                    <>
                      <button className="danger" onClick={() => deleteTask(task.id)}>Confirm</button>
                      <button onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(task.id)}>Delete</button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .wrap { max-width: 700px; margin: 0 auto; padding: 1rem; }
        .add-form { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .add-form input { flex: 1; padding: 0.5rem; min-width: 140px; }
        .add-form button { padding: 0.5rem 1rem; cursor: pointer; }
        .filters { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .filters button { padding: 0.4rem 0.8rem; cursor: pointer; border: 1px solid #ccc; background: #f5f5f5; }
        .filters button.active { background: #333; color: white; }
        .list { display: flex; flex-direction: column; gap: 0.75rem; }
        .task-card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
        .task-main { display: flex; align-items: flex-start; gap: 0.6rem; }
        .done { text-decoration: line-through; color: #888; }
        .desc { font-size: 0.85rem; color: #666; }
        .row { display: flex; gap: 0.4rem; }
        .row button { padding: 0.3rem 0.7rem; cursor: pointer; }
        .danger { background: #c0392b; color: white; border: none; }
        .edit-form { display: flex; flex-direction: column; gap: 0.4rem; width: 100%; }
        .edit-form input { padding: 0.4rem; }
        .status { text-align: center; padding: 2rem; }
        .error { color: red; }
        @media (max-width: 480px) { .add-form { flex-direction: column; } .task-card { flex-direction: column; align-items: stretch; } }
      `}</style>
    </div>
  );
}

export default TaskManager;