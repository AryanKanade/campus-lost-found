
# Campus Lost & Found Management System

A web-based application that helps students and staff report lost or found
belongings and search existing item reports on campus.

## Features

- Submit lost-item and found-item reports
- Validate form inputs on the frontend and backend
- Store reports in MySQL
- Browse reported items
- Search by keyword
- Filter by report type, category, and location
- Display clear messages for empty search results

## Technology Stack

- Frontend: HTML, CSS, Bootstrap, JavaScript
- Backend: Node.js and Express.js
- Database: MySQL
- Database driver: mysql2
- Development tool: Nodemon

## Prerequisites

- Node.js and npm
- MySQL Server
- MySQL Workbench (optional)

## Setup

1. Clone this repository.
2. Install dependencies:

   `npm install`

3. Create the database and tables by executing
   `backend/db/schema.sql` in MySQL Workbench.

4. Copy `.env.example` to `.env` and configure your MySQL credentials.

5. Start the development server:

   `npm run dev`

6. Open `http://localhost:3000` in your browser.

## Environment Variables

Configure the following variables in `.env`:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Never commit real credentials to the repository.

## Project Status

The application is being developed as an individual
Project-Based Learning (PBL) project, with Jira used for
task management, sprint planning, testing, and defect tracking.
