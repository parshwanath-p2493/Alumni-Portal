-- Seed data for Alumni Portal
-- Insert sample users

INSERT INTO users (id, name, email, password_hash, role, student_id, graduation_year, cgpa, company, position, location, experience, skills, github_url, linkedin_url, is_verified, is_active) VALUES
-- Admin user
('admin001', 'System Administrator', 'admin@drait.edu.in', '$2b$10$example_hash_admin', 'admin', NULL, NULL, NULL, 'Dr. AIT', 'System Administrator', 'Bangalore, Karnataka', NULL, '["System Administration", "Database Management"]', NULL, NULL, TRUE, TRUE),

-- Faculty users
('faculty001', 'Dr. Anita Reddy', 'anita.reddy@drait.edu.in', '$2b$10$example_hash_faculty1', 'faculty', NULL, NULL, NULL, 'Dr. AIT', 'Associate Professor', 'Bangalore, Karnataka', '12 years', '["Signal Processing", "Communication Systems", "Digital Electronics"]', NULL, 'https://linkedin.com/in/anita-reddy', TRUE, TRUE),

('faculty002', 'Prof. Rajesh Kumar', 'rajesh.kumar@drait.edu.in', '$2b$10$example_hash_faculty2', 'faculty', NULL, NULL, NULL, 'Dr. AIT', 'Professor', 'Bangalore, Karnataka', '15 years', '["VLSI Design", "Embedded Systems", "Microprocessors"]', NULL, 'https://linkedin.com/in/rajesh-kumar', TRUE, TRUE),

-- Alumni users
('alumni001', 'Priya Sharma', 'priya.sharma@gmail.com', '$2b$10$example_hash_alumni1', 'alumni', '1DA18ET015', 2022, 8.7, 'Google', 'Software Engineer', 'Bangalore, Karnataka', '2 years', '["React", "Node.js", "Python", "Machine Learning", "JavaScript", "MongoDB"]', 'https://github.com/priya-sharma', 'https://linkedin.com/in/priya-sharma', TRUE, TRUE),

('alumni002', 'Vikram Singh', 'vikram.singh@outlook.com', '$2b$10$example_hash_alumni2', 'alumni', '1DA17ET045', 2021, 8.9, 'Microsoft', 'Senior Software Engineer', 'Hyderabad, Telangana', '3 years', '["Azure", "C#", ".NET", "Cloud Computing", "DevOps"]', 'https://github.com/vikram-singh', 'https://linkedin.com/in/vikram-singh', TRUE, TRUE),

('alumni003', 'Sneha Gupta', 'sneha.gupta@yahoo.com', '$2b$10$example_hash_alumni3', 'alumni', '1DA19ET028', 2023, 9.1, 'Amazon', 'Data Scientist', 'Mumbai, Maharashtra', '1 year', '["Python", "TensorFlow", "AWS", "Data Analysis", "Machine Learning", "SQL"]', 'https://github.com/sneha-gupta', 'https://linkedin.com/in/sneha-gupta', TRUE, TRUE),

('alumni004', 'Amit Patel', 'amit.patel@gmail.com', '$2b$10$example_hash_alumni4', 'alumni', '1DA16ET022', 2020, 8.5, 'Telecom Giants', 'Network Engineer', 'Mumbai, Maharashtra', '4 years', '["5G Technology", "Network Protocols", "RF Engineering", "Python", "Telecommunications"]', 'https://github.com/amit-patel', 'https://linkedin.com/in/amit-patel', TRUE, TRUE),

-- Student users
('student001', 'Rahul Kumar', 'rahul.kumar@student.drait.edu.in', '$2b$10$example_hash_student1', 'student', '1DA21ET032', 2025, 8.5, NULL, NULL, NULL, NULL, '["C++", "Embedded Systems", "IoT", "Arduino", "Python"]', 'https://github.com/rahul-kumar', 'https://linkedin.com/in/rahul-kumar', TRUE, TRUE),

('student002', 'Karthik Reddy', 'karthik.reddy@student.drait.edu.in', '$2b$10$example_hash_student2', 'student', '1DA22ET019', 2026, 9.2, NULL, NULL, NULL, NULL, '["VLSI", "Verilog", "MATLAB", "Digital Design", "Circuit Analysis"]', 'https://github.com/karthik-reddy', NULL, TRUE, TRUE),

('student003', 'Ananya Nair', 'ananya.nair@student.drait.edu.in', '$2b$10$example_hash_student3', 'student', '1DA21ET008', 2025, 8.8, NULL, NULL, NULL, NULL, '["Signal Processing", "MATLAB", "Python", "Communication Systems"]', 'https://github.com/ananya-nair', 'https://linkedin.com/in/ananya-nair', TRUE, TRUE);

-- Insert sample projects
INSERT INTO projects (id, title, description, project_type, technologies, github_url, demo_url, author_id, likes_count, views_count, created_at) VALUES
('project001', 'IoT-Based Smart Home Automation System', 'A comprehensive home automation system using ESP32, sensors, and mobile app control. Features include voice control, scheduling, and energy monitoring with real-time data visualization.', 'major', '["ESP32", "React Native", "Firebase", "IoT", "Node.js", "MongoDB"]', 'https://github.com/rahul-kumar/smart-home', 'https://smart-home-demo.com', 'student001', 24, 156, '2024-01-15 10:30:00'),

('project002', '5G Network Performance Analysis Tool', 'A comprehensive tool for analyzing 5G network performance metrics including latency, throughput, and signal strength across different geographical locations with interactive visualizations.', 'mini', '["Python", "Matplotlib", "Pandas", "5G", "NumPy", "Tkinter"]', 'https://github.com/karthik-reddy/5g-analysis', NULL, 'student002', 18, 89, '2024-02-10 14:20:00'),

('project003', 'RFID-Based Attendance Management System', 'An automated attendance system using RFID technology with web dashboard for teachers and students to track attendance records, generate reports, and manage student data.', 'major', '["Arduino", "RFID", "PHP", "MySQL", "Bootstrap", "JavaScript"]', 'https://github.com/ananya-nair/rfid-attendance', 'https://attendance-demo.com', 'student003', 31, 203, '2024-01-28 09:15:00'),

('project004', 'Machine Learning Based ECG Arrhythmia Detection', 'A deep learning model to detect cardiac arrhythmias from ECG signals with high accuracy using CNN and LSTM networks. Includes real-time monitoring capabilities.', 'major', '["Python", "TensorFlow", "Keras", "Signal Processing", "OpenCV", "Flask"]', 'https://github.com/student/ecg-detection', NULL, 'student001', 42, 287, '2024-02-05 16:45:00');

-- Insert sample jobs
INSERT INTO jobs (id, title, company, location, job_type, experience_required, salary_range, description, requirements, posted_by, applicants_count, expires_at, created_at) VALUES
('job001', 'Software Engineer - Frontend', 'TechCorp Solutions', 'Bangalore, Karnataka', 'full-time', '0-2 years', '₹6-10 LPA', 'We are looking for a passionate Frontend Developer to join our team. You will work on cutting-edge web applications using React, TypeScript, and modern development tools. Great opportunity for fresh graduates.', '["React.js", "TypeScript", "HTML/CSS", "Git", "JavaScript", "REST APIs"]', 'alumni001', 23, '2024-03-15 23:59:59', '2024-02-15 10:00:00'),

('job002', 'Electronics Design Engineer', 'InnovateTech Pvt Ltd', 'Hyderabad, Telangana', 'full-time', '1-3 years', '₹8-12 LPA', 'Join our hardware team to design and develop next-generation electronic products. Work with PCB design, embedded systems, and IoT devices in a collaborative environment.', '["PCB Design", "Embedded C", "MATLAB", "Circuit Analysis", "Altium Designer", "Microcontrollers"]', 'alumni002', 15, '2024-03-20 23:59:59', '2024-02-12 11:30:00'),

('job003', 'Network Engineer - 5G', 'Telecom Giants', 'Mumbai, Maharashtra', 'full-time', '2-4 years', '₹10-15 LPA', 'Exciting opportunity to work on 5G network infrastructure. Design, implement, and optimize 5G networks for enterprise and consumer applications. Work with cutting-edge technology.', '["5G Technology", "Network Protocols", "RF Engineering", "Python", "Telecommunications", "Network Security"]', 'alumni004', 31, '2024-03-25 23:59:59', '2024-02-10 09:45:00'),

('job004', 'Data Scientist - ML/AI', 'DataTech Analytics', 'Pune, Maharashtra', 'full-time', '1-3 years', '₹9-14 LPA', 'Work on machine learning projects involving signal processing, computer vision, and predictive analytics. Great opportunity for ECE graduates to transition into AI/ML domain.', '["Python", "Machine Learning", "TensorFlow", "Signal Processing", "Data Analysis", "SQL"]', 'alumni003', 42, '2024-03-30 23:59:59', '2024-02-08 15:20:00'),

('job005', 'Embedded Systems Intern', 'RoboTech Innovations', 'Chennai, Tamil Nadu', 'internship', '0-1 years', '₹15,000-25,000/month', '6-month internship program focusing on embedded systems development for robotics applications. Hands-on experience with microcontrollers, sensors, and real-time systems.', '["C/C++", "Microcontrollers", "Arduino/Raspberry Pi", "Basic Electronics", "Embedded C", "Sensors"]', 'alumni001', 67, '2024-04-15 23:59:59', '2024-02-14 12:00:00');

-- Insert sample events
INSERT INTO events (id, title, description, event_date, location, event_type, max_attendees, current_attendees, created_by, created_at) VALUES
('event001', 'Tech Symposium 2024', 'Annual technical symposium featuring latest trends in Electronics and Telecommunication. Includes keynote speeches, technical paper presentations, and networking sessions.', '2024-03-15 09:00:00', 'Dr. AIT Main Auditorium', 'Symposium', 500, 234, 'admin001', '2024-02-01 10:00:00'),

('event002', 'Industry Expert Talk: 5G and Beyond', 'Expert talk on the future of telecommunications technology, covering 5G implementation, challenges, and upcoming 6G research. Interactive Q&A session included.', '2024-02-25 14:00:00', 'ETE Department Seminar Hall', 'Expert Talk', 100, 78, 'faculty001', '2024-02-05 11:30:00'),

('event003', 'Alumni Meet 2024', 'Annual alumni gathering to reconnect with fellow graduates, share experiences, and network with current students. Includes cultural programs and dinner.', '2024-04-20 17:00:00', 'Dr. AIT Campus Grounds', 'Alumni Meet', 300, 156, 'admin001', '2024-02-10 09:15:00'),

('event004', 'Workshop: PCB Design and Fabrication', 'Hands-on workshop on PCB design using industry-standard tools. Covers design principles, fabrication process, and testing methodologies.', '2024-03-05 10:00:00', 'ETE Lab Complex', 'Workshop', 50, 42, 'faculty002', '2024-02-12 14:20:00');

-- Insert sample gallery images
INSERT INTO gallery (id, title, description, image_url, tags, event_id, uploaded_by, created_at) VALUES
('gallery001', 'Tech Symposium 2023 - Opening Ceremony', 'Opening ceremony of the annual tech symposium with distinguished guests and faculty members.', '/placeholder.svg?height=400&width=600', '["symposium", "opening ceremony", "2023"]', 'event001', 'faculty001', '2024-01-20 10:30:00'),

('gallery002', 'Student Project Exhibition', 'Final year students presenting their major projects to industry experts and faculty members.', '/placeholder.svg?height=400&width=600', '["projects", "exhibition", "students"]', NULL, 'faculty002', '2024-01-25 15:45:00'),

('gallery003', 'Alumni Meet 2023 Group Photo', 'Group photo of alumni from different batches during the annual alumni meet celebration.', '/placeholder.svg?height=400&width=600', '["alumni", "group photo", "2023"]', NULL, 'admin001', '2024-01-30 18:20:00'),

('gallery004', 'PCB Design Workshop', 'Students working on PCB design during the hands-on workshop session.', '/placeholder.svg?height=400&width=600', '["workshop", "pcb design", "hands-on"]', 'event004', 'faculty002', '2024-02-01 11:15:00');

-- Insert sample messages
INSERT INTO messages (id, sender_id, recipient_id, subject, content, is_read, created_at) VALUES
('msg001', 'alumni001', 'student001', 'Regarding Software Engineer Position', 'Hi! I saw your project on IoT-based home automation. Very impressive work! We have an opening for a Software Engineer role at Google. Would you be interested?', FALSE, '2024-02-15 09:00:00'),

('msg002', 'student001', 'alumni001', 'Re: Regarding Software Engineer Position', 'Thank you for reaching out! I am definitely interested in the opportunity. Could you please share more details about the role and requirements?', TRUE, '2024-02-15 09:15:00'),

('msg003', 'student002', 'faculty001', 'Major Project Guidance', 'Good morning ma\'am. I wanted to discuss my major project proposal on 5G network analysis. Could we schedule a meeting to discuss the implementation details?', TRUE, '2024-02-14 14:00:00'),

('msg004', 'faculty001', 'student002', 'Re: Major Project Guidance', 'Hello Karthik! Your project proposal looks interesting. Let\'s schedule a meeting this Friday at 2 PM in my office to discuss the technical aspects and timeline.', FALSE, '2024-02-14 16:45:00'),

('msg005', 'student003', 'alumni003', 'Career Guidance', 'Hello ma\'am, I am interested in pursuing a career in data science after graduation. Could you please guide me on the skills I should focus on and any internship opportunities?', FALSE, '2024-02-13 11:20:00');

-- Insert sample notifications
INSERT INTO notifications (id, user_id, title, message, notification_type, related_id, is_read, created_at) VALUES
('notif001', 'student001', 'New Job Posted', 'A new Software Engineer position has been posted by Priya Sharma at Google', 'job_posted', 'job001', FALSE, '2024-02-15 10:05:00'),

('notif002', 'student002', 'New Job Posted', 'A new Electronics Design Engineer position has been posted by Vikram Singh at Microsoft', 'job_posted', 'job002', TRUE, '2024-02-12 11:35:00'),

('notif003', 'alumni001', 'New Message', 'You have received a new message from Rahul Kumar', 'message_received', 'msg002', FALSE, '2024-02-15 09:16:00'),

('notif004', 'student001', 'Project Liked', 'Your IoT Smart Home project has been liked by 5 users', 'project_liked', 'project001', TRUE, '2024-02-14 16:30:00'),

('notif005', 'alumni001', 'Interest Received', 'Rahul Kumar has shown interest in your Software Engineer job posting', 'interest_received', 'job001', FALSE, '2024-02-15 14:20:00');

-- Insert sample job interests
INSERT INTO job_interests (id, job_id, user_id, created_at) VALUES
('interest001', 'job001', 'student001', '2024-02-15 14:20:00'),
('interest002', 'job001', 'student002', '2024-02-15 15:30:00'),
('interest003',
