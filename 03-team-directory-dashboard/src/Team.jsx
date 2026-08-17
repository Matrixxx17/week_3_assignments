import { useState, useEffect } from "react";

function Team() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selected, setSelected] = useState(null);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [todos, setTodos] = useState([]);
  const [todosLoading, setTodosLoading] = useState(false);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // This effect re-runs every time `selected` changes.
  // The `ignore` flag is the guard against stale responses.
  useEffect(() => {
    if (!selected) return;

    let ignore = false;

    setPostsLoading(true);
    setTodosLoading(true);

    fetch(`https://jsonplaceholder.typicode.com/posts?userId=${selected.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setPosts(data);
      })
      .finally(() => {
        if (!ignore) setPostsLoading(false);
      });

    fetch(`https://jsonplaceholder.typicode.com/todos?userId=${selected.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setTodos(data);
      })
      .finally(() => {
        if (!ignore) setTodosLoading(false);
      });

    // Cleanup runs BEFORE the next effect call, i.e. the instant
    // `selected` changes again (or the component unmounts).
    return () => {
      ignore = true;
    };
  }, [selected]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.company.name.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "company") return a.company.name.localeCompare(b.company.name);
    return 0;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = todos.length - completedCount;
  const percentComplete = todos.length
    ? Math.round((completedCount / todos.length) * 100)
    : 0;

  if (loading) return <p className="status">Loading team...</p>;
  if (error) return <p className="status error">Error: {error}</p>;

  return (
    <div className="wrap">
      <div className="topbar">
        <input
          className="search"
          placeholder="Search by name or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="company">Sort by Company</option>
        </select>
      </div>

      <div className="layout">
        <div className="grid">
          {sorted.map((user) => (
            <div
              key={user.id}
              className={`card ${selected?.id === user.id ? "active" : ""}`}
              onClick={() => setSelected(user)}
            >
              <h4>{user.name}</h4>
              <p>{user.company.name}</p>
              <p className="muted">{user.email}</p>
              <p className="muted">{user.address.city}</p>
            </div>
          ))}
        </div>

        {selected && (
          <div className="detail">
            <h3>{selected.name}'s Activity</h3>

            <h4>Posts</h4>
            {postsLoading ? (
              <p>Loading posts...</p>
            ) : (
              <ul>
                {posts.map((p) => (
                  <li key={p.id}>{p.title}</li>
                ))}
              </ul>
            )}

            <h4>Todos</h4>
            {todosLoading ? (
              <p>Loading todos...</p>
            ) : (
              <>
                <p className="stats">
                  {completedCount} completed / {pendingCount} pending (
                  {percentComplete}%)
                </p>
                <ul>
                  {todos.map((t) => (
                    <li key={t.id} className={t.completed ? "done" : ""}>
                      {t.title}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        .wrap { max-width: 1200px; margin: 0 auto; padding: 1rem; }
        .topbar { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .search { flex: 1; padding: 0.5rem; min-width: 200px; }
        .layout { display: flex; gap: 1rem; flex-wrap: wrap; }
        .grid { flex: 2; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; min-width: 280px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; cursor: pointer; }
        .card.active { border-color: #333; box-shadow: 0 0 0 2px #333; }
        .muted { color: #666; font-size: 0.85rem; }
        .detail { flex: 1; min-width: 280px; border: 1px solid #ddd; border-radius: 8px; padding: 1rem; align-self: flex-start; }
        .stats { font-weight: bold; }
        .done { text-decoration: line-through; color: #888; }
        .status { text-align: center; padding: 2rem; }
        .error { color: red; }
        @media (max-width: 768px) { .layout { flex-direction: column; } }
      `}</style>
    </div>
  );
}

export default Team;