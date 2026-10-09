# School Management System

A web-based School Management System with role-based access for Admin, Staff, and Students. The system provides separate functionality based on each user's role and responsibilities.

## Features

### 1. Admin

The Admin account is created directly in the MongoDB database.

The Admin can:

- Create, edit, and delete classes.
- Create, edit, and delete staff members.
- Manage staff information.
- Manage staff attendance.
- Provide login credentials to staff members.
- Manage the overall system.

### 2. Staff

Staff members log in using the email and password provided by the Admin.

Staff functionality depends on their assigned role.

#### Teacher

A Teacher can:

- Create student profiles.
- Update student information.
- Delete student profiles.
- Manage student attendance.
- View student information.

#### Library Staff

A Library Staff member can:

- Issue books to students.
- Add issued book information to the student's profile.
- Update book/issue information.
- Manage student library records.

### 3. Student

Students log in using their Admission Number and Password.

After logging in, students can:

- View their personal information.
- View their class/academic information.
- View attendance records.
- View issued book/library information.
- View other information related to their profile.

## Role-Based Access

The application provides role-based access control:

| Role | Main Responsibilities |
|------|------------------------|
| Admin | Manage classes, staff, and staff attendance |
| Teacher | Manage student profiles and student attendance |
| Library Staff | Manage books and student library records |
| Student | View personal, academic, attendance, and library information |

## Initial Admin Setup

The Admin account needs to be created directly in the MongoDB database before using the application.

### Steps

1. Start/connect to your MongoDB database.
2. Open the relevant database and Admin/User collection.
3. Create an Admin user with the required username and password.
4. Start the application.
5. Log in using the Admin credentials.
6. The Admin can then create staff accounts and manage the system.

> **Important:** Do not share real passwords, API keys, database credentials, or other sensitive information in this project repository or ZIP file.

## Environment Variables

For security reasons, the actual `.env` file should not be included in the project ZIP.

Create a `.env` file locally using the required environment variables.

If an `.env.example` file is provided, copy it and rename it to `.env`, then add the required values.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Replace the values with the appropriate local configuration.

## Project Setup

### Backend

Open the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create/configure the `.env` file and add the required environment variables.

Start the backend:

```bash
npm run dev
```

### Frontend

Open a new terminal and go to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

## Recommended Project Structure

```text
Project/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/
│   ├── src/
│   ├── package.json
│   └── ...
├── .gitignore
├── .env.example
└── README.md
```

## Important Notes

- `node_modules` folders do not need to be included in the ZIP file. Dependencies can be installed using `npm install`.
- Do not include the actual `.env` file if it contains passwords, API keys, database credentials, or other secrets.
- MongoDB must be running/accessible for the backend to work.
- The exact commands may vary depending on the project's package configuration.
- Staff permissions are determined by their assigned role.
- Students can access only their own information after logging in.

## Login Flow

### Admin

Admin credentials → Admin Login → Manage Classes, Staff, and Attendance

### Staff

Staff Email + Password → Staff Login → Role-specific Dashboard

### Student

Admission Number + Password → Student Login → Student Dashboard

---

## Technology

The project consists of:

- Frontend
- Backend
- MongoDB Database
- Role-Based Authentication and Authorization

