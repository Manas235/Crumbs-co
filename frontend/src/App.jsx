import { useEffect, useMemo, useState } from 'react';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', email: '', address: '' });
  const [status, setStatus] = useState({ loading: true, error: '', success: '' });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Could not load products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        setStatus((prev) => ({ ...prev, error: error.message }));
      } finally {
        setStatus((prev) => ({ ...prev, loading: false }));
      }
    };

    loadProducts();
  }, []);

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, cartItem) => {
        const product = products.find((item) => item.id === cartItem.productId);
        return sum + (product?.price ?? 0) * cartItem.quantity;
      }, 0),
    [cart, products]
  );

  const shipping = subtotal >= 25 || subtotal === 0 ? 0 : 4.99;
  const total = subtotal + shipping;

  const addToCart = (productId) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    setStatus((prev) => ({ ...prev, error: '', success: '' }));

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, items: cart })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to place order');
      }

      setStatus((prev) => ({ ...prev, success: `Order ${payload.id} placed successfully!` }));
      setCart([]);
      setCustomer({ name: '', email: '', address: '' });
    } catch (error) {
      setStatus((prev) => ({ ...prev, error: error.message }));
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <p className="badge">Fresh daily • Local delivery</p>
        <h1>Crumbs Co</h1>
        <p>Small-batch gourmet cookies delivered warm to your door.</p>
      </header>

      <main className="layout">
        <section>
          <h2>Shop cookies</h2>
          {status.loading ? <p>Loading menu...</p> : null}
          <div className="product-grid">
            {products.map((product) => (
              <article className="card" key={product.id}>
                <img src={product.image} alt={product.name} />
                <div className="card-content">
                  <p className="category">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="card-footer">
                    <strong>{currency.format(product.price)}</strong>
                    <button type="button" onClick={() => addToCart(product.id)}>
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="checkout-panel">
          <h2>Your order</h2>
          {cart.length === 0 ? <p>Your cart is empty.</p> : null}
          <ul>
            {cart.map((item) => {
              const product = products.find((entry) => entry.id === item.productId);
              if (!product) {
                return null;
              }

              return (
                <li key={item.productId}>
                  <div>
                    <strong>{product.name}</strong>
                    <p>{currency.format(product.price)} each</p>
                  </div>
                  <div className="qty-control">
                    <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="totals">
            <p>
              Subtotal <span>{currency.format(subtotal)}</span>
            </p>
            <p>
              Shipping <span>{shipping === 0 ? 'Free' : currency.format(shipping)}</span>
            </p>
            <p className="grand-total">
              Total <span>{currency.format(total)}</span>
            </p>
          </div>

          <form onSubmit={submitOrder}>
            <input
              required
              type="text"
              placeholder="Full name"
              value={customer.name}
              onChange={(event) => setCustomer((prev) => ({ ...prev, name: event.target.value }))}
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={customer.email}
              onChange={(event) => setCustomer((prev) => ({ ...prev, email: event.target.value }))}
            />
            <textarea
              required
              placeholder="Delivery address"
              value={customer.address}
              onChange={(event) => setCustomer((prev) => ({ ...prev, address: event.target.value }))}
            />
            <button type="submit" disabled={cart.length === 0}>
              Place order
            </button>
          </form>
          {status.error ? <p className="error">{status.error}</p> : null}
          {status.success ? <p className="success">{status.success}</p> : null}
        </aside>
      </main>
    </div>
  );
}

export default App;
