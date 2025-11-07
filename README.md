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
- Shadcn UI
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
lead-management-system/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── ui/         # Reusable UI components
│   │   ├── contexts/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   ├── pages/         # Route components
│   │   ├── services/      # API and external services
│   │   └── utils/         # Helper functions
│   ├── public/
│   └── package.json
├── backend/                # Node.js backend API
│   ├── config/            # Database configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # Express routes
│   ├── services/         # Service
│   ├── socket/           # WebSocket handlers
│   ├── utils/            # Utility functions
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
cd lead-management-system
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

4. Set up environment variables :

Create `.env` file in the backend directory:

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173

# API Integration Keys (Add these when you get actual credentials)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_ACCESS_TOKEN=your_meta_access_token
META_AD_ACCOUNT_ID=your_ad_account_id

GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_CUSTOMER_ID=your_customer_id

WEBSITE_API_KEY=your_website_api_key
WEBSITE_API_BASE_URL=your_website_api_url
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

### Authentication Routes

| Method | Endpoint         | Description                   | Auth Required |
| ------ | ---------------- | ----------------------------- | ------------- |
| POST   | `/auth/register` | Register a new user           | ❌ No          |
| POST   | `/auth/login`    | Login a user                  | ❌ No          |
| POST   | `/auth/logout`   | Logout user                   | ❌ No          |
| GET    | `/auth/me`       | Get details of logged-in user | ✅ Yes         |

### Leads Routes

| Method | Endpoint                                 | Description                   | Auth Required |
| ------ | ---------------------------------------- | ----------------------------- | ------------- |
| GET    | `/leads`                                 | Get all leads                 | ✅ Yes         |
| POST   | `/leads`                                 | Create a new lead             | ✅ Yes         |
| GET    | `/leads/:id`                             | Get lead by ID                | ✅ Yes         |
| PUT    | `/leads/:id`                             | Update lead                   | ✅ Yes         |
| DELETE | `/leads/:id`                             | Delete lead                   | ✅ Yes         |
| POST   | `/leads/assign/:leadId/to/:employeeId`   | Assign a lead to an employee  | ✅ Yes         |
| POST   | `/leads/unassign/:leadId/to/:employeeId` | Unassign a lead from employee | ✅ Yes         |

### Employee Routes

All employee routes require authentication.
| Method | Endpoint                     | Description                             |
| ------ | ---------------------------- | --------------------------------------- |
| POST   | `/employees/createEmployees` | Create a new employee                   |
| GET    | `/employees/getEmployees`    | Get all employees                       |
| GET    | `/employees/:id`             | Get employee by ID                      |
| PUT    | `/employees/:id`             | Update employee details                 |
| DELETE | `/employees/:id`             | Delete employee                         |
| GET    | `/employees/:id/leads`       | Get all leads assigned to this employee |

### Dashboard / Reporting Routes

| Method | Endpoint            | Description                   | Auth Required |
| ------ | ------------------- | ----------------------------- | ------------- |
| GET    | `/dashboard/report` | Get system consumption report | ✅ Yes         |
