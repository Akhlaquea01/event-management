# Virtual Event Management Platform API

A lightweight, clean backend RESTful API for a virtual event management platform built with **Node.js** and **Express.js**.

The system handles user authentication with password hashing and JWT sessions, event scheduling with role-based permissions (Organizers vs Attendees), attendee registrations with capacity limits, and asynchronous email notifications powered by **Brevo**.

Data is managed using in-memory data structures backed by JSON persistence, so there is no database setup required to run and test the application.

---



## Tech Stack

- **Runtime**: Node.js (v20.6+ / v23+ / v24+)
- **Framework**: Express.js (v5)
- **Authentication**: `bcrypt`, `jsonwebtoken`
- **Email Delivery**: `@getbrevo/brevo`
- **Logging & Security**: `pino`, `pino-http`, `cors`, `express-rate-limit`
- **API Testing**: Bruno / OpenCollection (`Event Management.yml`)

---

## Getting Started

### 1. Prerequisites
- **Node.js** v20.6 or higher (Node 23 / 24 recommended for native `--env-file` support).
- npm installed.

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/Akhlaquea01/event-management.git
cd event-management
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (you can copy `.sample.env`):

```bash
cp .sample.env .env
```

Ensure your `.env` contains:

```ini
PORT=3000
JWT_SECRET=your_super_long_random_jwt_secret_key
CORS_ORIGIN=*

# Brevo transactional email config
BREVO_KEY=your_brevo_api_key_here
BREVO_FROM_NAME=Event Platform
BREVO_FROM_EMAIL=your_verified_sender_email@domain.com
```

> **Note:** If `BREVO_KEY` is omitted or invalid during testing, the app will log a warning and gracefully continue without failing the HTTP request.

### 4. Running the Server

Start in production mode:
```bash
npm start
```

Start with auto-restart on changes (Node `--watch`):
```bash
npm run dev
```

The server will boot on `http://localhost:3000`. Test that it's running:
```bash
curl http://localhost:3000/health
```

---

## API Documentation & cURL Examples

All API requests are bundled in **[Event Management.yml](./Event%20Management.yml)**, which you can import directly into [Bruno](https://www.usebruno.com/) or Postman.