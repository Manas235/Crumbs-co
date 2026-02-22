import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const products = [
  {
    id: 'classic-choc-chip',
    name: 'Classic Chocolate Chip',
    description: 'Golden edges, chewy center, and melty semi-sweet chocolate chips.',
    price: 3.5,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
    category: 'Signature'
  },
  {
    id: 'double-dark',
    name: 'Double Dark Cocoa',
    description: 'A rich cocoa cookie loaded with dark chocolate chunks and sea salt flakes.',
    price: 4.0,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    category: 'Premium'
  },
  {
    id: 'salted-caramel',
    name: 'Salted Caramel Crumble',
    description: 'Buttery vanilla dough with gooey caramel swirls and crushed toffee bits.',
    price: 4.25,
    image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80',
    category: 'Seasonal'
  },
  {
    id: 'oatmeal-raisin',
    name: 'Oatmeal Raisin Revival',
    description: 'Wholesome rolled oats, cinnamon spice, and plump California raisins.',
    price: 3.75,
    image: 'https://images.unsplash.com/photo-1590080874088-eec64895b423?auto=format&fit=crop&w=800&q=80',
    category: 'Classic'
  }
];

const orders = [];

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'crumbs-co-api' });
});

app.get('/api/products', (_req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  return res.json(product);
});

app.post('/api/orders', (req, res) => {
  const { customer, items } = req.body;

  if (!customer?.name || !customer?.email || !customer?.address) {
    return res.status(400).json({ message: 'Customer name, email, and address are required.' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'At least one cart item is required.' });
  }

  const normalizedItems = items
    .map(({ productId, quantity }) => {
      const product = products.find((entry) => entry.id === productId);
      if (!product || quantity < 1) {
        return null;
      }

      return {
        productId: product.id,
        name: product.name,
        quantity,
        unitPrice: product.price,
        lineTotal: Number((product.price * quantity).toFixed(2))
      };
    })
    .filter(Boolean);

  if (!normalizedItems.length) {
    return res.status(400).json({ message: 'No valid products found in order.' });
  }

  const subtotal = Number(normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  const shipping = subtotal >= 25 ? 0 : 4.99;
  const total = Number((subtotal + shipping).toFixed(2));

  const order = {
    id: `ord_${Date.now()}`,
    createdAt: new Date().toISOString(),
    customer,
    items: normalizedItems,
    subtotal,
    shipping,
    total,
    status: 'received'
  };

  orders.push(order);
  return res.status(201).json(order);
});

app.get('/api/orders', (_req, res) => {
  res.json(orders);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Crumbs Co API running on http://localhost:${PORT}`);
});
