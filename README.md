# ResumeCraft — Complete starter project

A React + Express + MongoDB student resume builder.

## Requirements
- Node.js (LTS recommended)
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- VS Code

## Setup
1. Extract this folder.
2. Open the `ResumeCraft-Complete` folder in VS Code.
3. Open the VS Code terminal in this folder.
4. Install packages:

   ```bash
   npm install
   ```

5. Create `server/.env` by copying `server/.env.example`.
6. If MongoDB is running locally, keep:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017
   PORT=5000
   ```

   For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

7. Start the frontend and backend together:

   ```bash
   npm run dev
   ```

   On Windows PowerShell, `npm.cmd run dev` also works.

8. Open http://localhost:5173

## Features
- Student profile and contact information
- Education and academic details
- Multiple projects
- Internship / experience entries
- Skills, certifications, achievements and languages
- Live resume preview
- Profile photo upload (stored as an image data URL)
- MongoDB create, read, update and delete operations
- Print / Save as PDF

## MongoDB
The backend creates a database named `resumecraft` and a collection named `resumes` automatically after connecting.

## Important
- Do not share your `.env` file or MongoDB password.
- This is a student project starter, not a production-secure public service. Add authentication and stronger validation before deploying publicly.
- The resume output is intentionally simple and readable. Review the final PDF before applying for jobs.
