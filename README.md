# NestJS Backend: User Management and Document Management

This project is a **NestJS-based backend service** designed to manage user authentication, document management, and ingestion controls. It provides APIs for user roles (**admin, editor, viewer**), document CRUD operations, and integration with a **Python backend** for document ingestion. The project uses **PostgreSQL** as the database and **JWT** for secure authentication and role-based authorization.

## Purpose

The purpose of this project is to create a robust backend service that:

- **Manages User Authentication**: Register, login, logout, and handle user roles (**admin, editor, viewer**).
- **Manages Documents**: Perform CRUD operations on documents, including uploading and managing metadata.
- **Triggers and Manages Ingestion**: Integrate with a Python backend to trigger and track document ingestion processes.

## Key Features

### 1. Authentication APIs

- **Register**: Create a new user with a specific role (**admin, editor, viewer**).
- **Login**: Authenticate users and return a JWT token.
- **Logout**: Invalidate the JWT token (optional, depending on implementation).
- **Role-Based Access Control (RBAC)**: Restrict access to certain APIs based on user roles.

### 2. User Management APIs

#### Admin-Only Functionality:

- Assign or update user roles (**admin, editor, viewer**).
- Manage user permissions.

### 3. Document Management APIs

#### CRUD Operations:

- Upload documents (e.g., PDFs, Word files).
- Retrieve documents
- Update or delete documents.
- **Access Control**: Restrict document access based on user roles.

### 4. Ingestion Trigger API

- **Trigger Ingestion**: Send a request to the Python backend to start the ingestion process for a document.
- **Webhook/API Integration**: Communicate with the Python backend via a webhook or direct API call.

### 5. Ingestion Management API

- **Track Ingestion Processes**: Monitor the status of ongoing ingestion processes.

## Tools and Libraries

- **TypeScript**: For consistent type management and improved developer experience.
- **PostgreSQL**: As the primary database for storing user and document data.
- **TypeORM**: For database integration, migrations, and entity management.
- **JWT (JSON Web Tokens)**: For secure authentication and role-based authorization.
- **NestJS**: As the backend framework for building scalable and maintainable APIs.
- **Docker**: For containerization and deployment.
- **Docker Compose**: For managing multi-container setups (**NestJS app + PostgreSQL**).

## Getting Started

### Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (v22 or later)
- **Docker**
- **Docker Compose**
- **Nest CLI** (optional but recommended)

### Installation

#### Clone the Repository:

```bash
git clone https://github.com/ratnajitswain/NestJS-Backend-User-Management-and-Document-Management-
cd NestJS-Backend-User-Management-and-Document-Management
```

#### Install Dependencies:

```bash
npm install
```

#### Set Up Environment Variables:

Create a `.env` file in the root directory and add the following variables:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=pgsql
DB_NAME=user_doc_management
JWT_SECRET=your_secret
```

#### Run with Docker:

Start the application and PostgreSQL database using Docker Compose:

```bash
docker-compose up --build


```

#### Access the Application:

The NestJS backend will be available at:

```
http://localhost:3000
```

## Running Tests

To run unit and integration tests:

```bash
npm run test
```

## API Endpoints

To view api endpoints:

```
http://localhost:3000/api-docs
```
