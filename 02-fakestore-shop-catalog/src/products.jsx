import { useState, useEffect } from "react";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("none");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("https://fakestoreapi.com/products").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      }),
      fetch("https://fakestoreapi.com/products/categories").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      }),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function changeQty(id, delta) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  const filtered = products.filter(
    (p) => category === "all" || p.category === category
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating.rate - a.rating.rate;
    return 0;
  });

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  if (loading) return <p className="status">Loading products...</p>;
  if (error) return <p className="status error">Error: {error}</p>;

  return (
    <div className="wrap">
      <div className="topbar">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="none">Sort by</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>

        <button className="cart-btn" onClick={() => setShowCart(!showCart)}>
          🛒 Cart ({totalItems})
        </button>
      </div>

      {showCart && (
        <div className="cart-drawer">
          <h3>Your Cart</h3>
          {cart.length === 0 && <p>Cart is empty</p>}
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <span>{item.title.slice(0, 30)}</span>
              <div className="qty-controls">
                <button onClick={() => changeQty(item.id, -1)}>−</button>
                <span>{item.qty}</span>
                <button onClick={() => changeQty(item.id, 1)}>+</button>
              </div>
              <span>${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
          {cart.length > 0 && <p className="total">Total: ${totalPrice.toFixed(2)}</p>}
        </div>
      )}

      <div className="grid">
        {sorted.map((product) => (
          <div key={product.id} className="card">
            <img src={product.image} alt={product.title} />
            <h4>{product.title.slice(0, 40)}</h4>
            <p className="price">${product.price}</p>
            <p className="rating">⭐ {product.rating.rate}</p>
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>

      <style>{`
        .wrap { max-width: 1200px; margin: 0 auto; padding: 1rem; }
        .topbar { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; align-items: center; }
        .cart-btn { margin-left: auto; padding: 0.5rem 1rem; cursor: pointer; }
        .cart-drawer { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
        .cart-item { display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; border-bottom: 1px solid #eee; gap: 0.5rem; }
        .qty-controls { display: flex; align-items: center; gap: 0.5rem; }
        .qty-controls button { width: 24px; cursor: pointer; }
        .total { font-weight: bold; text-align: right; margin-top: 0.5rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; text-align: center; display: flex; flex-direction: column; }
        .card img { height: 150px; object-fit: contain; margin-bottom: 0.5rem; }
        .card h4 { font-size: 0.9rem; flex-grow: 1; }
        .price { font-weight: bold; }
        .card button { margin-top: 0.5rem; padding: 0.5rem; cursor: pointer; }
        .status { text-align: center; padding: 2rem; }
        .error { color: red; }
        @media (max-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } .topbar { flex-direction: column; align-items: stretch; } .cart-btn { margin-left: 0; } }
        @media (max-width: 480px) { .grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

export default Products;