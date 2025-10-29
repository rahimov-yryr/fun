# Educational CRM System

A modern, full-stack Customer Relationship Management (CRM) system designed specifically for educational institutions. Built with React, Node.js, Express, and SQLite.

## Features

### Core Functionality
- **Student Management**: Track student information, enrollment history, grades, and attendance
- **Course Management**: Manage course catalog, schedules, capacity, and assignments
- **Teacher Management**: Handle teacher profiles, specializations, and course assignments
- **Enrollment System**: Enroll students in courses with capacity management
- **Grade Tracking**: Record and manage student grades, assignments, and performance
- **Attendance Monitoring**: Track student attendance across courses
- **Communication System**: Built-in messaging and announcements
- **Analytics Dashboard**: Real-time insights and performance metrics
- **Payment Tracking**: Monitor tuition and fee payments

### User Roles
- **Admin**: Full system access and management capabilities
- **Teacher**: Course and student management, grading
- **Student**: View courses, grades, and communications
- **Parent**: Monitor child's progress and communications

### Modern UI
- Responsive design with TailwindCSS
- Clean, intuitive interface
- Real-time data updates
- Mobile-friendly

## Tech Stack

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- TailwindCSS for styling
- Lucide React for icons
- Recharts for data visualization
- Vite for build tooling

### Backend
- Node.js & Express
- SQLite database with better-sqlite3
- JWT authentication
- bcryptjs for password hashing
- RESTful API architecture

## Installation

### Prerequisites
- Node.js 16+ and npm

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd educational-crm
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and update the following:
```
PORT=3000
JWT_SECRET=your-secret-key-change-this-to-something-secure
DATABASE_PATH=./database.sqlite
NODE_ENV=development
```

4. **Start the application**

For development (runs both server and client):
```bash
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Start backend server
npm run server

# Terminal 2 - Start frontend client
npm run client
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get single student
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/:id/stats` - Get student statistics

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get single teacher
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Enrollments
- `GET /api/enrollments` - Get all enrollments
- `POST /api/enrollments` - Create enrollment
- `PUT /api/enrollments/:id` - Update enrollment
- `DELETE /api/enrollments/:id` - Delete enrollment

### Grades
- `GET /api/grades/enrollment/:enrollmentId` - Get grades for enrollment
- `GET /api/grades/student/:studentId` - Get all grades for student
- `POST /api/grades` - Create grade
- `PUT /api/grades/:id` - Update grade
- `DELETE /api/grades/:id` - Delete grade

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard overview
- `GET /api/analytics/student-performance` - Get student performance metrics
- `GET /api/analytics/course-performance` - Get course performance metrics
- `GET /api/analytics/enrollment-trends` - Get enrollment trends
- `GET /api/analytics/teacher-workload` - Get teacher workload statistics

### Communications
- `GET /api/communication` - Get communications
- `POST /api/communication` - Send communication
- `PUT /api/communication/:id/read` - Mark as read
- `DELETE /api/communication/:id` - Delete communication

## Database Schema

The system uses SQLite with the following main tables:

- **users** - User authentication and roles
- **students** - Student profiles and information
- **teachers** - Teacher profiles and qualifications
- **courses** - Course catalog and details
- **enrollments** - Student-course relationships
- **grades** - Assignment grades and scores
- **attendance** - Attendance records
- **communications** - Messages and announcements
- **payments** - Fee and payment tracking

## Default Users

On first run, you can register users with different roles:

```json
{
  "email": "admin@example.com",
  "password": "your-password",
  "role": "admin"
}
```

Available roles: `admin`, `teacher`, `student`, `parent`

## Development

### Project Structure
```
educational-crm/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   └── package.json
├── server/                 # Express backend
│   ├── database/           # Database initialization
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   └── index.js            # Server entry point
├── .env.example            # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

### Adding New Features

1. **Backend**: Add routes in `server/routes/`
2. **Frontend**: Add pages in `client/src/pages/`
3. **Database**: Update schema in `server/database/init.js`

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- SQL injection prevention with prepared statements
- CORS protection
- Environment variable configuration

## Production Deployment

1. **Build the frontend**
```bash
npm run build
```

2. **Set environment to production**
```env
NODE_ENV=production
```

3. **Use a process manager**
```bash
npm install -g pm2
pm2 start server/index.js --name educational-crm
```

4. **Set up a reverse proxy** (nginx/Apache) for the frontend and API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for educational or commercial purposes.

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review the API endpoints

## Roadmap

Future enhancements:
- [ ] Email notifications
- [ ] File upload for assignments
- [ ] Advanced reporting and exports
- [ ] Calendar integration
- [ ] Mobile app
- [ ] Parent portal
- [ ] Online payment integration
- [ ] Video conferencing integration
- [ ] Automated grade calculations
- [ ] Bulk import/export

## Acknowledgments

Built with modern web technologies and best practices for educational institutions.
