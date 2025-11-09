import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase } from './init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../database.sqlite');
const db = new Database(dbPath);

console.log('🌱 Starting database seeding...');

// Initialize database tables
console.log('📋 Initializing database tables...');
initDatabase();

// Clear existing data (in correct order due to foreign keys)
console.log('🗑️  Clearing existing data...');
db.exec('PRAGMA foreign_keys = OFF');
db.exec(`
  DELETE FROM communications;
  DELETE FROM payments;
  DELETE FROM attendance;
  DELETE FROM grades;
  DELETE FROM enrollments;
  DELETE FROM courses;
  DELETE FROM teachers;
  DELETE FROM students;
  DELETE FROM users;
`);
db.exec('PRAGMA foreign_keys = ON');

// Seed Users
console.log('👥 Creating users...');
const hashedPassword = bcrypt.hashSync('password123', 10);

const users = [
  { email: 'admin@educrm.com', password: hashedPassword, role: 'admin' },
  { email: 'john.doe@educrm.com', password: hashedPassword, role: 'teacher' },
  { email: 'jane.smith@educrm.com', password: hashedPassword, role: 'teacher' },
  { email: 'michael.johnson@educrm.com', password: hashedPassword, role: 'teacher' },
  { email: 'sarah.williams@educrm.com', password: hashedPassword, role: 'teacher' },
  { email: 'david.brown@educrm.com', password: hashedPassword, role: 'teacher' },
];

const insertUser = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
const userIds = {};
users.forEach(user => {
  const result = insertUser.run(user.email, user.password, user.role);
  userIds[user.email] = result.lastInsertRowid;
});

// Seed Teachers
console.log('👨‍🏫 Creating teachers...');
const teachers = [
  {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@educrm.com',
    phone: '(555) 123-4567',
    specialization: 'Mathematics & Computer Science',
    qualification: 'Ph.D. in Computer Science',
    hire_date: '2020-08-15',
    status: 'active',
    bio: 'Experienced educator with 10+ years in teaching mathematics and programming.'
  },
  {
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@educrm.com',
    phone: '(555) 234-5678',
    specialization: 'English Literature & Writing',
    qualification: 'M.A. in English Literature',
    hire_date: '2019-09-01',
    status: 'active',
    bio: 'Passionate about helping students develop strong writing and critical thinking skills.'
  },
  {
    first_name: 'Michael',
    last_name: 'Johnson',
    email: 'michael.johnson@educrm.com',
    phone: '(555) 345-6789',
    specialization: 'Physics & Chemistry',
    qualification: 'Ph.D. in Physics',
    hire_date: '2018-01-10',
    status: 'active',
    bio: 'Dedicated to making science engaging and accessible to all students.'
  },
  {
    first_name: 'Sarah',
    last_name: 'Williams',
    email: 'sarah.williams@educrm.com',
    phone: '(555) 456-7890',
    specialization: 'History & Social Studies',
    qualification: 'M.A. in History',
    hire_date: '2021-02-15',
    status: 'active',
    bio: 'History enthusiast dedicated to connecting past events with modern life.'
  },
  {
    first_name: 'David',
    last_name: 'Brown',
    email: 'david.brown@educrm.com',
    phone: '(555) 567-8901',
    specialization: 'Art & Design',
    qualification: 'M.F.A. in Fine Arts',
    hire_date: '2020-06-01',
    status: 'active',
    bio: 'Creative professional helping students express themselves through art.'
  }
];

const insertTeacher = db.prepare(`
  INSERT INTO teachers (user_id, first_name, last_name, email, phone, specialization, qualification, hire_date, status, bio)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const teacherIds = [];
teachers.forEach((teacher) => {
  // Get the user_id for this teacher's email
  const userId = userIds[teacher.email];
  const result = insertTeacher.run(
    userId,
    teacher.first_name, teacher.last_name, teacher.email, teacher.phone,
    teacher.specialization, teacher.qualification, teacher.hire_date,
    teacher.status, teacher.bio
  );
  teacherIds.push(result.lastInsertRowid);
});

// Seed Students
console.log('👨‍🎓 Creating students...');
const students = [
  {
    first_name: 'Emily',
    last_name: 'Anderson',
    date_of_birth: '2007-03-15',
    gender: 'Female',
    phone: '(555) 111-2222',
    address: '123 Oak Street, Springfield, IL 62701',
    emergency_contact: '(555) 111-2223',
    parent_name: 'Robert Anderson',
    parent_email: 'robert.anderson@email.com',
    parent_phone: '(555) 111-2223',
    enrollment_date: '2023-09-01',
    status: 'active'
  },
  {
    first_name: 'James',
    last_name: 'Martinez',
    date_of_birth: '2007-07-22',
    gender: 'Male',
    phone: '(555) 222-3333',
    address: '456 Maple Avenue, Springfield, IL 62702',
    emergency_contact: '(555) 222-3334',
    parent_name: 'Maria Martinez',
    parent_email: 'maria.martinez@email.com',
    parent_phone: '(555) 222-3334',
    enrollment_date: '2023-09-01',
    status: 'active'
  },
  {
    first_name: 'Sophia',
    last_name: 'Taylor',
    date_of_birth: '2008-01-10',
    gender: 'Female',
    phone: '(555) 333-4444',
    address: '789 Pine Road, Springfield, IL 62703',
    emergency_contact: '(555) 333-4445',
    parent_name: 'Jennifer Taylor',
    parent_email: 'jennifer.taylor@email.com',
    parent_phone: '(555) 333-4445',
    enrollment_date: '2023-09-01',
    status: 'active'
  },
  {
    first_name: 'Liam',
    last_name: 'Garcia',
    date_of_birth: '2007-11-05',
    gender: 'Male',
    phone: '(555) 444-5555',
    address: '321 Elm Street, Springfield, IL 62704',
    emergency_contact: '(555) 444-5556',
    parent_name: 'Carlos Garcia',
    parent_email: 'carlos.garcia@email.com',
    parent_phone: '(555) 444-5556',
    enrollment_date: '2023-09-01',
    status: 'active'
  },
  {
    first_name: 'Olivia',
    last_name: 'Rodriguez',
    date_of_birth: '2008-04-18',
    gender: 'Female',
    phone: '(555) 555-6666',
    address: '654 Cedar Lane, Springfield, IL 62705',
    emergency_contact: '(555) 555-6667',
    parent_name: 'Ana Rodriguez',
    parent_email: 'ana.rodriguez@email.com',
    parent_phone: '(555) 555-6667',
    enrollment_date: '2023-09-01',
    status: 'active'
  },
  {
    first_name: 'Noah',
    last_name: 'Wilson',
    date_of_birth: '2007-09-30',
    gender: 'Male',
    phone: '(555) 666-7777',
    address: '987 Birch Court, Springfield, IL 62706',
    emergency_contact: '(555) 666-7778',
    parent_name: 'Thomas Wilson',
    parent_email: 'thomas.wilson@email.com',
    parent_phone: '(555) 666-7778',
    enrollment_date: '2023-09-01',
    status: 'active'
  },
  {
    first_name: 'Ava',
    last_name: 'Moore',
    date_of_birth: '2008-02-14',
    gender: 'Female',
    phone: '(555) 777-8888',
    address: '147 Spruce Drive, Springfield, IL 62707',
    emergency_contact: '(555) 777-8889',
    parent_name: 'Lisa Moore',
    parent_email: 'lisa.moore@email.com',
    parent_phone: '(555) 777-8889',
    enrollment_date: '2023-09-01',
    status: 'active'
  },
  {
    first_name: 'Ethan',
    last_name: 'Davis',
    date_of_birth: '2007-06-08',
    gender: 'Male',
    phone: '(555) 888-9999',
    address: '258 Willow Path, Springfield, IL 62708',
    emergency_contact: '(555) 888-9990',
    parent_name: 'Mark Davis',
    parent_email: 'mark.davis@email.com',
    parent_phone: '(555) 888-9990',
    enrollment_date: '2023-09-01',
    status: 'active'
  },
  {
    first_name: 'Isabella',
    last_name: 'Miller',
    date_of_birth: '2008-05-20',
    gender: 'Female',
    phone: '(555) 999-0000',
    address: '369 Ash Boulevard, Springfield, IL 62709',
    emergency_contact: '(555) 999-0001',
    parent_name: 'Susan Miller',
    parent_email: 'susan.miller@email.com',
    parent_phone: '(555) 999-0001',
    enrollment_date: '2023-09-01',
    status: 'active'
  },
  {
    first_name: 'Mason',
    last_name: 'Thompson',
    date_of_birth: '2007-12-25',
    gender: 'Male',
    phone: '(555) 000-1111',
    address: '741 Cherry Street, Springfield, IL 62710',
    emergency_contact: '(555) 000-1112',
    parent_name: 'Patricia Thompson',
    parent_email: 'patricia.thompson@email.com',
    parent_phone: '(555) 000-1112',
    enrollment_date: '2023-09-01',
    status: 'active'
  }
];

const insertStudent = db.prepare(`
  INSERT INTO students (
    first_name, last_name, date_of_birth, gender, phone, address,
    emergency_contact, parent_name, parent_email, parent_phone,
    enrollment_date, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const studentIds = [];
students.forEach(student => {
  const result = insertStudent.run(
    student.first_name, student.last_name, student.date_of_birth, student.gender,
    student.phone, student.address, student.emergency_contact, student.parent_name,
    student.parent_email, student.parent_phone, student.enrollment_date, student.status
  );
  studentIds.push(result.lastInsertRowid);
});

// Seed Courses
console.log('📚 Creating courses...');
const courses = [
  {
    code: 'MATH-101',
    name: 'Algebra I',
    description: 'Introduction to algebraic concepts, equations, and problem-solving techniques.',
    teacher_id: teacherIds[0], // John Doe
    capacity: 30,
    credits: 4,
    start_date: '2024-09-01',
    end_date: '2025-05-30',
    schedule: 'Mon/Wed/Fri 9:00-10:00 AM',
    room: 'Room 201',
    status: 'active'
  },
  {
    code: 'MATH-201',
    name: 'Geometry',
    description: 'Study of shapes, angles, proofs, and spatial reasoning.',
    teacher_id: teacherIds[0], // John Doe
    capacity: 28,
    credits: 4,
    start_date: '2024-09-01',
    end_date: '2025-05-30',
    schedule: 'Tue/Thu 10:00-11:30 AM',
    room: 'Room 201',
    status: 'active'
  },
  {
    code: 'CS-101',
    name: 'Introduction to Programming',
    description: 'Learn the fundamentals of programming using Python.',
    teacher_id: teacherIds[0], // John Doe
    capacity: 25,
    credits: 3,
    start_date: '2024-09-01',
    end_date: '2025-05-30',
    schedule: 'Mon/Wed 2:00-3:30 PM',
    room: 'Computer Lab A',
    status: 'active'
  },
  {
    code: 'ENG-101',
    name: 'English Literature',
    description: 'Explore classic and contemporary literature with critical analysis.',
    teacher_id: teacherIds[1], // Jane Smith
    capacity: 30,
    credits: 4,
    start_date: '2024-09-01',
    end_date: '2025-05-30',
    schedule: 'Mon/Wed/Fri 11:00 AM-12:00 PM',
    room: 'Room 105',
    status: 'active'
  },
  {
    code: 'ENG-201',
    name: 'Creative Writing',
    description: 'Develop your creative writing skills through various genres and techniques.',
    teacher_id: teacherIds[1], // Jane Smith
    capacity: 20,
    credits: 3,
    start_date: '2024-09-01',
    end_date: '2025-05-30',
    schedule: 'Tue/Thu 1:00-2:30 PM',
    room: 'Room 106',
    status: 'active'
  },
  {
    code: 'PHY-101',
    name: 'Physics I',
    description: 'Introduction to mechanics, energy, and motion.',
    teacher_id: teacherIds[2], // Michael Johnson
    capacity: 28,
    credits: 4,
    start_date: '2024-09-01',
    end_date: '2025-05-30',
    schedule: 'Mon/Wed/Fri 10:00-11:00 AM',
    room: 'Science Lab 1',
    status: 'active'
  },
  {
    code: 'CHEM-101',
    name: 'Chemistry I',
    description: 'Fundamentals of chemistry including atomic structure and chemical reactions.',
    teacher_id: teacherIds[2], // Michael Johnson
    capacity: 24,
    credits: 4,
    start_date: '2024-09-01',
    end_date: '2025-05-30',
    schedule: 'Tue/Thu 9:00-10:30 AM',
    room: 'Science Lab 2',
    status: 'active'
  },
  {
    code: 'HIST-101',
    name: 'World History',
    description: 'Survey of major world civilizations and historical events.',
    teacher_id: teacherIds[3], // Sarah Williams
    capacity: 32,
    credits: 3,
    start_date: '2024-09-01',
    end_date: '2025-05-30',
    schedule: 'Mon/Wed/Fri 1:00-2:00 PM',
    room: 'Room 301',
    status: 'active'
  },
  {
    code: 'ART-101',
    name: 'Visual Arts',
    description: 'Introduction to drawing, painting, and visual composition.',
    teacher_id: teacherIds[4], // David Brown
    capacity: 20,
    credits: 3,
    start_date: '2024-09-01',
    end_date: '2025-05-30',
    schedule: 'Tue/Thu 2:00-4:00 PM',
    room: 'Art Studio',
    status: 'active'
  },
  {
    code: 'ART-201',
    name: 'Digital Design',
    description: 'Learn digital art and design using modern software tools.',
    teacher_id: teacherIds[4], // David Brown
    capacity: 18,
    credits: 3,
    start_date: '2024-09-01',
    end_date: '2025-05-30',
    schedule: 'Mon/Wed 3:00-5:00 PM',
    room: 'Computer Lab B',
    status: 'active'
  }
];

const insertCourse = db.prepare(`
  INSERT INTO courses (
    code, name, description, teacher_id, capacity, credits,
    start_date, end_date, schedule, room, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const courseIds = [];
courses.forEach(course => {
  const result = insertCourse.run(
    course.code, course.name, course.description, course.teacher_id,
    course.capacity, course.credits, course.start_date, course.end_date,
    course.schedule, course.room, course.status
  );
  courseIds.push(result.lastInsertRowid);
});

// Seed Enrollments
console.log('📝 Creating enrollments...');
const enrollments = [
  // Student 0: Emily Anderson
  { student_id: studentIds[0], course_id: courseIds[0], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 95.5 },
  { student_id: studentIds[0], course_id: courseIds[3], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 97.0 },
  { student_id: studentIds[0], course_id: courseIds[5], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 93.5 },
  { student_id: studentIds[0], course_id: courseIds[7], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 96.0 },

  // Student 1: James Martinez
  { student_id: studentIds[1], course_id: courseIds[0], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 88.0 },
  { student_id: studentIds[1], course_id: courseIds[2], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 92.0 },
  { student_id: studentIds[1], course_id: courseIds[6], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 85.5 },
  { student_id: studentIds[1], course_id: courseIds[8], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 90.0 },

  // Student 2: Sophia Taylor
  { student_id: studentIds[2], course_id: courseIds[1], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 98.0 },
  { student_id: studentIds[2], course_id: courseIds[3], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 99.0 },
  { student_id: studentIds[2], course_id: courseIds[4], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 97.5 },
  { student_id: studentIds[2], course_id: courseIds[9], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 96.5 },

  // Student 3: Liam Garcia
  { student_id: studentIds[3], course_id: courseIds[0], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 82.0 },
  { student_id: studentIds[3], course_id: courseIds[5], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 80.5 },
  { student_id: studentIds[3], course_id: courseIds[7], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 84.0 },

  // Student 4: Olivia Rodriguez
  { student_id: studentIds[4], course_id: courseIds[2], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 94.0 },
  { student_id: studentIds[4], course_id: courseIds[3], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 95.5 },
  { student_id: studentIds[4], course_id: courseIds[6], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 92.5 },
  { student_id: studentIds[4], course_id: courseIds[9], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 97.0 },

  // Student 5: Noah Wilson
  { student_id: studentIds[5], course_id: courseIds[1], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 91.0 },
  { student_id: studentIds[5], course_id: courseIds[5], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 89.5 },
  { student_id: studentIds[5], course_id: courseIds[7], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 90.0 },

  // Student 6: Ava Moore
  { student_id: studentIds[6], course_id: courseIds[0], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 96.5 },
  { student_id: studentIds[6], course_id: courseIds[4], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 98.0 },
  { student_id: studentIds[6], course_id: courseIds[8], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 97.5 },

  // Student 7: Ethan Davis
  { student_id: studentIds[7], course_id: courseIds[2], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 87.5 },
  { student_id: studentIds[7], course_id: courseIds[5], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 86.0 },
  { student_id: studentIds[7], course_id: courseIds[7], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 88.5 },

  // Student 8: Isabella Miller
  { student_id: studentIds[8], course_id: courseIds[3], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 93.0 },
  { student_id: studentIds[8], course_id: courseIds[6], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 91.5 },
  { student_id: studentIds[8], course_id: courseIds[8], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 94.5 },

  // Student 9: Mason Thompson
  { student_id: studentIds[9], course_id: courseIds[1], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 85.0 },
  { student_id: studentIds[9], course_id: courseIds[2], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 83.5 },
  { student_id: studentIds[9], course_id: courseIds[9], enrollment_date: '2023-09-01', status: 'enrolled', attendance_percentage: 87.0 }
];

const insertEnrollment = db.prepare(`
  INSERT INTO enrollments (student_id, course_id, enrollment_date, status, attendance_percentage)
  VALUES (?, ?, ?, ?, ?)
`);

const enrollmentIds = [];
enrollments.forEach(enrollment => {
  const result = insertEnrollment.run(
    enrollment.student_id, enrollment.course_id, enrollment.enrollment_date,
    enrollment.status, enrollment.attendance_percentage
  );
  enrollmentIds.push(result.lastInsertRowid);
});

// Seed Grades
console.log('📊 Creating grades...');
const gradeTypes = ['homework', 'quiz', 'exam', 'project', 'participation'];
const assignmentNames = {
  homework: ['Homework 1', 'Homework 2', 'Homework 3', 'Homework 4'],
  quiz: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Midterm Quiz'],
  exam: ['Midterm Exam', 'Final Exam'],
  project: ['Term Project', 'Group Project', 'Research Paper'],
  participation: ['Class Participation']
};

// Create grades for each enrollment
enrollmentIds.forEach((enrollmentId) => {
  // Homework assignments
  for (let i = 0; i < 4; i++) {
    const score = 70 + Math.random() * 30; // 70-100
    db.prepare(`
      INSERT INTO grades (enrollment_id, assignment_name, assignment_type, score, max_score, weight, due_date, submitted_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      enrollmentId,
      `Homework ${i + 1}`,
      'homework',
      Math.round(score),
      100,
      0.2,
      '2024-10-01',
      '2024-09-30'
    );
  }

  // Quizzes
  for (let i = 0; i < 3; i++) {
    const score = 65 + Math.random() * 35; // 65-100
    db.prepare(`
      INSERT INTO grades (enrollment_id, assignment_name, assignment_type, score, max_score, weight, due_date, submitted_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      enrollmentId,
      `Quiz ${i + 1}`,
      'quiz',
      Math.round(score),
      100,
      0.15,
      '2024-10-15',
      '2024-10-15'
    );
  }

  // Exams
  const midtermScore = 70 + Math.random() * 25; // 70-95
  db.prepare(`
    INSERT INTO grades (enrollment_id, assignment_name, assignment_type, score, max_score, weight, due_date, submitted_date, feedback)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    enrollmentId,
    'Midterm Exam',
    'exam',
    Math.round(midtermScore),
    100,
    1.0,
    '2024-11-01',
    '2024-11-01',
    'Good effort! Keep up the hard work.'
  );

  // Project
  const projectScore = 75 + Math.random() * 25; // 75-100
  db.prepare(`
    INSERT INTO grades (enrollment_id, assignment_name, assignment_type, score, max_score, weight, due_date, submitted_date, feedback)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    enrollmentId,
    'Term Project',
    'project',
    Math.round(projectScore),
    100,
    0.8,
    '2024-12-01',
    '2024-11-30',
    'Excellent work with creative approach!'
  );
});

// Seed Communications
console.log('💬 Creating communications...');
const communications = [
  {
    sender_id: userIds['admin@educrm.com'],
    recipient_type: 'all',
    subject: 'Welcome to the New Academic Year!',
    message: 'Dear students and parents, welcome to the 2024-2025 academic year! We are excited to embark on this learning journey together.',
    type: 'announcement',
    status: 'sent'
  },
  {
    sender_id: userIds['admin@educrm.com'],
    recipient_type: 'all',
    subject: 'Parent-Teacher Conference Scheduled',
    message: 'Parent-teacher conferences will be held on November 15-16. Please check your email for your scheduled time slot.',
    type: 'notification',
    status: 'sent'
  },
  {
    sender_id: userIds['john.doe@educrm.com'],
    recipient_type: 'student',
    subject: 'Math Competition Opportunity',
    message: 'Students interested in participating in the regional math competition should sign up by October 30th.',
    type: 'notification',
    status: 'sent'
  },
  {
    sender_id: userIds['michael.johnson@educrm.com'],
    recipient_type: 'student',
    subject: 'Science Fair Announcement',
    message: 'The annual science fair will be held on December 10th. Start thinking about your project ideas!',
    type: 'announcement',
    status: 'sent'
  },
  {
    sender_id: userIds['sarah.williams@educrm.com'],
    recipient_type: 'parent',
    subject: 'Field Trip Permission Forms',
    message: 'Please sign and return the field trip permission forms for the upcoming museum visit.',
    type: 'notification',
    status: 'sent'
  }
];

const insertCommunication = db.prepare(`
  INSERT INTO communications (sender_id, recipient_type, subject, message, type, status)
  VALUES (?, ?, ?, ?, ?, ?)
`);

communications.forEach(comm => {
  insertCommunication.run(
    comm.sender_id, comm.recipient_type, comm.subject,
    comm.message, comm.type, comm.status
  );
});

console.log('✅ Database seeding completed!');
console.log('\n📊 Summary:');
console.log(`   - ${users.length} users created`);
console.log(`   - ${teachers.length} teachers created`);
console.log(`   - ${students.length} students created`);
console.log(`   - ${courses.length} courses created`);
console.log(`   - ${enrollments.length} enrollments created`);
console.log(`   - Multiple grades and assignments created`);
console.log(`   - ${communications.length} communications created`);
console.log('\n🔑 Login credentials:');
console.log('   Email: admin@educrm.com');
console.log('   Password: password123');
console.log('\n   (All users have password: password123)');

db.close();
