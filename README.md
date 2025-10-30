# Lead Management System

A full-stack lead management application built with React (frontend) and Node.js/Express (backend).

## Features

- User authentication (login/signup)
- Lead management (CRUD operations)
- Filtering and searching leads
- Responsive design with Tailwind CSS
- Real-time data updates

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing

## Project Structure

```
kk/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── backend/           # Node.js backend API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd kk
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables

Create `.env` file in the backend directory:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
```

Create `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5001/api
```

5. Run the application

Start the backend:
```bash
cd backend
npm run dev
```

Start the frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## Deployment

### Frontend (Vercel)
The frontend is configured for deployment on Vercel. The build command is `npm run build` and the output directory is `dist`.

### Backend (Render)
The backend is configured for deployment on Render. The start command is `npm start`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Leads
- `GET /api/leads` - Get all leads (with pagination and filters)
- `GET /api/leads/:id` - Get a specific lead
- `POST /api/leads` - Create a new lead
- `PUT /api/leads/:id` - Update a lead
- `DELETE /api/leads/:id` - Delete a lead
