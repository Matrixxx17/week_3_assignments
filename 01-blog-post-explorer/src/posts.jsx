import { useState, useEffect } from "react";

function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [visible, setVisible] = useState(10);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch posts");
        return res.json();
      })
      .then((data) => setPosts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function openPost(post) {
    setSelected(post);
    setCommentsLoading(true);
    fetch(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .finally(() => setCommentsLoading(false));
  }

  const filtered = posts.filter((p) =>
  p.title.toLowerCase().includes(search.toLowerCase()) ||
  p.id.toString().includes(search)
);

  if (loading) return <p className="status">Loading posts...</p>;
  if (error) return <p className="status error">Error: {error}</p>;

  return (
    <div className="wrap">
      {!selected && (
        <>
          <input
            className="search"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="grid">
            {filtered.slice(0, visible).map((post) => (
              <div key={post.id} className="card" onClick={() => openPost(post)}>
                <h3>{post.title}</h3>
                <p>{post.body.slice(0, 80)}...</p>
              </div>
            ))}
          </div>
          {visible < filtered.length && (
            <button className="loadmore" onClick={() => setVisible(visible + 10)}>
              Load more
            </button>
          )}
        </>
      )}

      {selected && (
        <div className="detail">
          <button className="close" onClick={() => setSelected(null)}>
            ← Close
          </button>
          <h2>{selected.title}</h2>
          <p>{selected.body}</p>
          <h3>Comments</h3>
          {commentsLoading ? (
            <p>Loading comments...</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="comment">
                <strong>{c.name}</strong>
                <p>{c.body}</p>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        .wrap { max-width: 1200px; margin: 0 auto; padding: 1rem; }
        .search { width: 100%; padding: 0.6rem; margin-bottom: 1rem; box-sizing: border-box; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; cursor: pointer; }
        .card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .status { text-align: center; padding: 2rem; }
        .error { color: red; }
        .loadmore { display: block; margin: 1rem auto; padding: 0.5rem 1rem; }
        .comment { border-top: 1px solid #eee; padding: 0.5rem 0; }
        .close { margin-bottom: 1rem; }
        @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

export default Posts;