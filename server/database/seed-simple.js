import bcrypt from 'bcryptjs';
import { getDatabase, saveDatabase } from './init.js';
import { initDatabase } from './init.js';

async function seed() {
  console.log('🌱 Starting database seeding...');

  // Initialize database
  console.log('📋 Initializing database tables...');
  await initDatabase();

  const db = await getDatabase();

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  db.run('PRAGMA foreign_keys = OFF');
  db.run('DELETE FROM communications');
  db.run('DELETE FROM payments');
  db.run('DELETE FROM attendance');
  db.run('DELETE FROM grades');
  db.run('DELETE FROM enrollments');
  db.run('DELETE FROM courses');
  db.run('DELETE FROM teachers');
  db.run('DELETE FROM students');
  db.run('DELETE FROM users');
  db.run('PRAGMA foreign_keys = ON');

  // Helper to get last insert ID
  function getLastId() {
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  }

  // Seed Users
  console.log('👥 Creating users...');
  const hashedPassword = bcrypt.hashSync('password123', 10);

  const users = [
    ['admin@educrm.com', hashedPassword, 'admin'],
    ['john.doe@educrm.com', hashedPassword, 'teacher'],
    ['jane.smith@educrm.com', hashedPassword, 'teacher'],
    ['michael.johnson@educrm.com', hashedPassword, 'teacher'],
    ['sarah.williams@educrm.com', hashedPassword, 'teacher'],
    ['david.brown@educrm.com', hashedPassword, 'teacher'],
  ];

  const userIds = {};
  users.forEach(([email, password, role]) => {
    db.run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, password, role]);
    userIds[email] = getLastId();
  });

  // Seed Teachers
  console.log('👨‍🏫 Creating teachers...');
  const teachers = [
    [userIds['john.doe@educrm.com'], 'John', 'Doe', 'john.doe@educrm.com', '(555) 123-4567', 'Mathematics & Computer Science', 'Ph.D. in Computer Science', '2020-08-15', 'active', 'Experienced educator with 10+ years in teaching mathematics and programming.'],
    [userIds['jane.smith@educrm.com'], 'Jane', 'Smith', 'jane.smith@educrm.com', '(555) 234-5678', 'English Literature & Writing', 'M.A. in English Literature', '2019-09-01', 'active', 'Passionate about helping students develop strong writing and critical thinking skills.'],
    [userIds['michael.johnson@educrm.com'], 'Michael', 'Johnson', 'michael.johnson@educrm.com', '(555) 345-6789', 'Physics & Chemistry', 'Ph.D. in Physics', '2018-01-10', 'active', 'Dedicated to making science engaging and accessible to all students.'],
    [userIds['sarah.williams@educrm.com'], 'Sarah', 'Williams', 'sarah.williams@educrm.com', '(555) 456-7890', 'History & Social Studies', 'M.A. in History', '2021-02-15', 'active', 'History enthusiast dedicated to connecting past events with modern life.'],
    [userIds['david.brown@educrm.com'], 'David', 'Brown', 'david.brown@educrm.com', '(555) 567-8901', 'Art & Design', 'M.F.A. in Fine Arts', '2020-06-01', 'active', 'Creative professional helping students express themselves through art.']
  ];

  const teacherIds = [];
  teachers.forEach(teacher => {
    db.run(`INSERT INTO teachers (user_id, first_name, last_name, email, phone, specialization, qualification, hire_date, status, bio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, teacher);
    teacherIds.push(getLastId());
  });

  // Seed Students
  console.log('👨‍🎓 Creating students...');
  const students = [
    ['Emily', 'Anderson', '2007-03-15', 'Female', '(555) 111-2222', '123 Oak Street, Springfield, IL 62701', '(555) 111-2223', 'Robert Anderson', 'robert.anderson@email.com', '(555) 111-2223', '2023-09-01', 'active'],
    ['James', 'Martinez', '2007-07-22', 'Male', '(555) 222-3333', '456 Maple Avenue, Springfield, IL 62702', '(555) 222-3334', 'Maria Martinez', 'maria.martinez@email.com', '(555) 222-3334', '2023-09-01', 'active'],
    ['Sophia', 'Taylor', '2008-01-10', 'Female', '(555) 333-4444', '789 Pine Road, Springfield, IL 62703', '(555) 333-4445', 'Jennifer Taylor', 'jennifer.taylor@email.com', '(555) 333-4445', '2023-09-01', 'active'],
    ['Liam', 'Garcia', '2007-11-05', 'Male', '(555) 444-5555', '321 Elm Street, Springfield, IL 62704', '(555) 444-5556', 'Carlos Garcia', 'carlos.garcia@email.com', '(555) 444-5556', '2023-09-01', 'active'],
    ['Olivia', 'Rodriguez', '2008-04-18', 'Female', '(555) 555-6666', '654 Cedar Lane, Springfield, IL 62705', '(555) 555-6667', 'Ana Rodriguez', 'ana.rodriguez@email.com', '(555) 555-6667', '2023-09-01', 'active'],
    ['Noah', 'Wilson', '2007-09-30', 'Male', '(555) 666-7777', '987 Birch Court, Springfield, IL 62706', '(555) 666-7778', 'Thomas Wilson', 'thomas.wilson@email.com', '(555) 666-7778', '2023-09-01', 'active'],
    ['Ava', 'Moore', '2008-02-14', 'Female', '(555) 777-8888', '147 Spruce Drive, Springfield, IL 62707', '(555) 777-8889', 'Lisa Moore', 'lisa.moore@email.com', '(555) 777-8889', '2023-09-01', 'active'],
    ['Ethan', 'Davis', '2007-06-08', 'Male', '(555) 888-9999', '258 Willow Path, Springfield, IL 62708', '(555) 888-9990', 'Mark Davis', 'mark.davis@email.com', '(555) 888-9990', '2023-09-01', 'active'],
    ['Isabella', 'Miller', '2008-05-20', 'Female', '(555) 999-0000', '369 Ash Boulevard, Springfield, IL 62709', '(555) 999-0001', 'Susan Miller', 'susan.miller@email.com', '(555) 999-0001', '2023-09-01', 'active'],
    ['Mason', 'Thompson', '2007-12-25', 'Male', '(555) 000-1111', '741 Cherry Street, Springfield, IL 62710', '(555) 000-1112', 'Patricia Thompson', 'patricia.thompson@email.com', '(555) 000-1112', '2023-09-01', 'active']
  ];

  const studentIds = [];
  students.forEach(student => {
    db.run(`INSERT INTO students (first_name, last_name, date_of_birth, gender, phone, address, emergency_contact, parent_name, parent_email, parent_phone, enrollment_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, student);
    studentIds.push(getLastId());
  });

  // Seed Courses
  console.log('📚 Creating courses...');
  const courses = [
    ['MATH-101', 'Algebra I', 'Introduction to algebraic concepts, equations, and problem-solving techniques.', teacherIds[0], 30, 4, '2024-09-01', '2025-05-30', 'Mon/Wed/Fri 9:00-10:00 AM', 'Room 201', 'active'],
    ['MATH-201', 'Geometry', 'Study of shapes, angles, proofs, and spatial reasoning.', teacherIds[0], 28, 4, '2024-09-01', '2025-05-30', 'Tue/Thu 10:00-11:30 AM', 'Room 201', 'active'],
    ['CS-101', 'Introduction to Programming', 'Learn the fundamentals of programming using Python.', teacherIds[0], 25, 3, '2024-09-01', '2025-05-30', 'Mon/Wed 2:00-3:30 PM', 'Computer Lab A', 'active'],
    ['ENG-101', 'English Literature', 'Explore classic and contemporary literature with critical analysis.', teacherIds[1], 30, 4, '2024-09-01', '2025-05-30', 'Mon/Wed/Fri 11:00 AM-12:00 PM', 'Room 105', 'active'],
    ['ENG-201', 'Creative Writing', 'Develop your creative writing skills through various genres and techniques.', teacherIds[1], 20, 3, '2024-09-01', '2025-05-30', 'Tue/Thu 1:00-2:30 PM', 'Room 106', 'active'],
    ['PHY-101', 'Physics I', 'Introduction to mechanics, energy, and motion.', teacherIds[2], 28, 4, '2024-09-01', '2025-05-30', 'Mon/Wed/Fri 10:00-11:00 AM', 'Science Lab 1', 'active'],
    ['CHEM-101', 'Chemistry I', 'Fundamentals of chemistry including atomic structure and chemical reactions.', teacherIds[2], 24, 4, '2024-09-01', '2025-05-30', 'Tue/Thu 9:00-10:30 AM', 'Science Lab 2', 'active'],
    ['HIST-101', 'World History', 'Survey of major world civilizations and historical events.', teacherIds[3], 32, 3, '2024-09-01', '2025-05-30', 'Mon/Wed/Fri 1:00-2:00 PM', 'Room 301', 'active'],
    ['ART-101', 'Visual Arts', 'Introduction to drawing, painting, and visual composition.', teacherIds[4], 20, 3, '2024-09-01', '2025-05-30', 'Tue/Thu 2:00-4:00 PM', 'Art Studio', 'active'],
    ['ART-201', 'Digital Design', 'Learn digital art and design using modern software tools.', teacherIds[4], 18, 3, '2024-09-01', '2025-05-30', 'Mon/Wed 3:00-5:00 PM', 'Computer Lab B', 'active']
  ];

  const courseIds = [];
  courses.forEach(course => {
    db.run(`INSERT INTO courses (code, name, description, teacher_id, capacity, credits, start_date, end_date, schedule, room, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, course);
    courseIds.push(getLastId());
  });

  // Seed Enrollments
  console.log('📝 Creating enrollments...');
  const enrollments = [
    [studentIds[0], courseIds[0], '2023-09-01', 'enrolled', 95.5],
    [studentIds[0], courseIds[3], '2023-09-01', 'enrolled', 97.0],
    [studentIds[1], courseIds[0], '2023-09-01', 'enrolled', 88.0],
    [studentIds[1], courseIds[2], '2023-09-01', 'enrolled', 92.0],
    [studentIds[2], courseIds[1], '2023-09-01', 'enrolled', 98.0],
    [studentIds[2], courseIds[3], '2023-09-01', 'enrolled', 99.0],
    [studentIds[3], courseIds[0], '2023-09-01', 'enrolled', 82.0],
    [studentIds[4], courseIds[2], '2023-09-01', 'enrolled', 94.0],
    [studentIds[5], courseIds[1], '2023-09-01', 'enrolled', 91.0],
    [studentIds[6], courseIds[0], '2023-09-01', 'enrolled', 96.5],
    [studentIds[7], courseIds[2], '2023-09-01', 'enrolled', 87.5],
    [studentIds[8], courseIds[3], '2023-09-01', 'enrolled', 93.0],
    [studentIds[9], courseIds[1], '2023-09-01', 'enrolled', 85.0]
  ];

  const enrollmentIds = [];
  enrollments.forEach(enrollment => {
    db.run(`INSERT INTO enrollments (student_id, course_id, enrollment_date, status, attendance_percentage)
            VALUES (?, ?, ?, ?, ?)`, enrollment);
    enrollmentIds.push(getLastId());
  });

  // Seed Grades
  console.log('📊 Creating grades...');
  enrollmentIds.forEach(enrollmentId => {
    // Add 2 assignments per enrollment
    for (let i = 1; i <= 2; i++) {
      const score = 70 + Math.random() * 30;
      db.run(`INSERT INTO grades (enrollment_id, assignment_name, assignment_type, score, max_score, weight, due_date, submitted_date)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [enrollmentId, `Assignment ${i}`, 'homework', Math.round(score), 100, 0.3, '2024-10-01', '2024-09-30']);
    }
  });

  // Seed Communications
  console.log('💬 Creating communications...');
  const communications = [
    [userIds['admin@educrm.com'], 'all', 'Welcome to the New Academic Year!', 'Dear students and parents, welcome to the 2024-2025 academic year!', 'announcement', 'sent'],
    [userIds['john.doe@educrm.com'], 'student', 'Math Competition Opportunity', 'Students interested in the regional math competition should sign up by October 30th.', 'notification', 'sent'],
  ];

  communications.forEach(comm => {
    db.run(`INSERT INTO communications (sender_id, recipient_type, subject, message, type, status)
            VALUES (?, ?, ?, ?, ?, ?)`, comm);
  });

  saveDatabase();

  console.log('✅ Database seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`   - ${users.length} users created`);
  console.log(`   - ${teachers.length} teachers created`);
  console.log(`   - ${students.length} students created`);
  console.log(`   - ${courses.length} courses created`);
  console.log(`   - ${enrollments.length} enrollments created`);
  console.log(`   - Grades and communications created`);
  console.log('\n🔑 Login credentials:');
  console.log('   Email: admin@educrm.com');
  console.log('   Password: password123');
  console.log('\n   (All users have password: password123)');
}

seed().catch(console.error).finally(() => process.exit());
