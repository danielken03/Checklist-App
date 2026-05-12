# Business Task Calendar

## Tech Stack

- **Backend**: Node.js, Express, SQLite
- **Frontend**: React
- **Authentication**: JWT
- **File Upload**: Multer

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup Instructions

1. **Install Backend Dependencies**
```bash
cd business-task-calendar
npm install
```

2. **Install Frontend Dependencies**
```bash
cd client
npm install
cd ..
```

3. **Initialize the Database**
```bash
npm run init-db
```

This will create the database and populate it with:
- 5 admin accounts (admin1-admin5, password: password123)
- 15 employee accounts (employee1-employee15, password: password123)
- Sample task templates

4. **Create uploads directory**
```bash
mkdir uploads
```

## Running the Application

You'll need to run both the backend and frontend servers:

### Terminal 1 - Backend Server
```bash
npm start
```
Server runs on http://localhost:5000

### Terminal 2 - Frontend Server
```bash
cd client
npm start
```
Frontend runs on http://localhost:3000

## Development

### Backend Development
```bash
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd client
npm start  # React dev server with hot reload
```

## File Upload Location

All uploaded files are stored in the `uploads/` directory. Files are accessible at:
```
http://localhost:5000/uploads/[filename]
```

## Troubleshooting

**Database errors?**
```bash
rm database.sqlite
npm run init-db
```

**Port already in use?**
- Change PORT in .env file (backend)
- React will automatically use a different port if 3000 is taken

**Can't upload files?**
- Make sure the `uploads/` directory exists
- Check file permissions

## Security Notes

⚠️ This is a proof of concept. For production use:
- Change JWT_SECRET in .env
- Use bcrypt with higher salt rounds
- Implement rate limiting
- Add input validation
- Use HTTPS
- Implement proper session management
- Add CSRF protection

## License

MIT
