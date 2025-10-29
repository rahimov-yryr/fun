import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../database.sqlite');
const db = new Database(dbPath);

export function initDatabase() {
  console.log('🗄️  Initializing database...');

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Users table (for authentication)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student', 'parent')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Students table
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth DATE,
      gender TEXT,
      phone TEXT,
      address TEXT,
      emergency_contact TEXT,
      parent_name TEXT,
      parent_email TEXT,
      parent_phone TEXT,
      enrollment_date DATE,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'graduated', 'suspended')),
      avatar_url TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Teachers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      specialization TEXT,
      qualification TEXT,
      hire_date DATE,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'on_leave')),
      avatar_url TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Courses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      teacher_id INTEGER,
      capacity INTEGER DEFAULT 30,
      credits INTEGER DEFAULT 3,
      start_date DATE,
      end_date DATE,
      schedule TEXT,
      room TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'completed', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
    )
  `);

  // Enrollments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      enrollment_date DATE DEFAULT CURRENT_DATE,
      status TEXT DEFAULT 'enrolled' CHECK(status IN ('enrolled', 'completed', 'dropped', 'failed')),
      final_grade TEXT,
      attendance_percentage REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE(student_id, course_id)
    )
  `);

  // Grades table
  db.exec(`
    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enrollment_id INTEGER NOT NULL,
      assignment_name TEXT NOT NULL,
      assignment_type TEXT CHECK(assignment_type IN ('homework', 'quiz', 'exam', 'project', 'participation')),
      score REAL NOT NULL,
      max_score REAL NOT NULL,
      weight REAL DEFAULT 1.0,
      due_date DATE,
      submitted_date DATE,
      feedback TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
    )
  `);

  // Attendance table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      date DATE NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late', 'excused')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE(student_id, course_id, date)
    )
  `);

  // Communications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS communications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER,
      recipient_type TEXT CHECK(recipient_type IN ('user', 'student', 'teacher', 'parent', 'all')),
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT CHECK(type IN ('email', 'notification', 'announcement')),
      status TEXT DEFAULT 'sent' CHECK(status IN ('draft', 'sent', 'read')),
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read_at DATETIME,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Payment/Fees table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      type TEXT CHECK(type IN ('tuition', 'registration', 'materials', 'other')),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'overdue', 'cancelled')),
      due_date DATE,
      paid_date DATE,
      payment_method TEXT,
      transaction_id TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
    CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
    CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
    CREATE INDEX IF NOT EXISTS idx_grades_enrollment_id ON grades(enrollment_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
  `);

  console.log('✅ Database initialized successfully');
}

export { db };
