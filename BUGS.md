# รายงานข้อผิดพลาด (BUGS.md)

| # | ไฟล์:บรรทัด | ประเภท | ความรุนแรง | ปัญหา (เกิดอะไร เมื่อไหร่) | วิธีแก้ | วิธีพิสูจน์ |
|---|---|---|---|---|---|---|
| 1 | routes/tasks.js:23 | Security | Critical | Admin ดึง task โดยไม่กรอง assigned_to ทำให้พนักงานเห็นงานคนอื่นถ้าระบบผิดพลาด และการต่อ SQL string ตรงๆ เสี่ยง Injection | ปรับเงื่อนไขตรวจสอบสิทธิ์และใช้ Prepared Statements ให้ถูกต้อง | ทำ: Employee พยายามดึงข้อมูล Task คนอื่น → โค้ดเดิมได้: ข้อมูลหลุด → ที่ถูกต้องคือ: ถูกปฏิเสธสิทธิ์หรือเห็นเฉพาะของตัวเอง |
| 2 | pages/EmployeeTasks.jsx:26 | Async | High | ใช้ useEffect แบบ setInterval แต่ไม่มี cleanup function ทำให้ timer ทำงานซ้ำซ้อนเมื่อ component unmount | เพิ่ม clearInterval ใน cleanup function ของ useEffect | ทำ: เปิดและปิดหน้า Employee ซ้ำๆ หลายรอบ → โค้ดเดิมได้: API ถูกยิงรัวๆ เบื้องหลัง → ที่ถูกต้องคือ: เคลียร์ timer ทิ้งเมื่อออกจากหน้า |