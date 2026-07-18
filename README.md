# Prodesk IT Mission 15

A full-stack MERN task management dashboard built from scratch for Sprint 15 Track B.

## Features

- User register, login and logout
- JWT authentication with protected routes
- Personal task CRUD
- Task ownership checks on the backend
- Kanban board with To Do, In Progress and Completed columns
- Dashboard statistics and Recharts analytics
- Stripe Checkout test-mode upgrade flow
- Responsive dashboard UI

## Tech Stack

Frontend: React 19, Vite, React Router DOM, Axios, Context API, Recharts, plain CSS

Backend: Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcryptjs, Stripe, dotenv, cors

## Folder Structure

```text
client/
  src/
    assets/
    components/
    context/
    pages/
    services/
    styles/
server/
  config/
  controllers/
  middleware/
  models/
  routes/
README.md
prompts.md
```

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Add your own values in `server/.env`.

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PRICE_ID=price_your_test_price_id
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Add this in `client/.env`.

```env
VITE_API_URL=http://localhost:5000/api
```

## API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Tasks:

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

Stripe:

- `POST /api/create-checkout-session`

## Deployment Notes

Frontend can be deployed to Vercel from the `client` folder.

Backend can be deployed to Render from the `server` folder.

Set all environment variables on the hosting platforms before deployment.

