-- ตารางผู้ใช้งานระบบ
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'employee')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ตารางโปรเจกต์
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ตารางงาน
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('To Do', 'Done')) DEFAULT 'To Do',
  assigned_to INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index สำหรับค้นหาผู้รับผิดชอบงาน
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);