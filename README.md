# Crumbs Co - Full-Stack Cookie E-commerce Starter

This repository now contains a complete full-stack starter for a cookie-selling e-commerce website:

- **Frontend**: React + Vite responsive shopping UI
- **Backend**: Express REST API for products and order placement

## Run locally

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Available API endpoints

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/orders`
- `GET /api/orders`

## Next steps to productionize

1. Add authentication and user accounts.
2. Persist products/orders in PostgreSQL.
3. Integrate Stripe for payments.
4. Add admin dashboard for inventory and order management.
5. Add automated tests (unit + integration + e2e).
