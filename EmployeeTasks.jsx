import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function EmployeeTasks() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getTasks(token).then((data) => {
      setTasks(data.tasks);
      setLoading(false);
    }).catch(() => {
      setError('โหลดข้อมูลไม่สำเร็จ');
      setLoading(false);
    });
  }, [token]);

  useEffect(() => {
    const timer = setInterval(() => {
      api.getTasks(token).then((data) => {
        setTasks(data.tasks);
      }).catch(() => {});
    }, 10000);

    return () => clearInterval(timer);
  }, [token]);

  const visible = tasks.filter(
    (t) => t.assigned_to === user.id && (filter === 'All' || t.status === filter)
  );

  const markDone = async (task) => {
    setError('');
    try {
      const updated = await api.updateStatus(token, task.id, 'Done');
      setTasks(tasks.map((t) => (t.id === task.id ? updated.task : t)));
    } catch (e) {
      setError('อัปเดตไม่สำเร็จ');
    }
  };

  return (
    <div className="page">
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option>All</option>
        <option>To Do</option>
        <option>Done</option>
      </select>

      {loading && <p>กำลังโหลด...</p>}
      {error && <p className="error">{error}</p>}

      <ul>
        {visible.map((t) => (
          <li key={t.id}>
            {t.title} — {t.status}
            {t.status !== 'Done' && (
              <button onClick={() => markDone(t)}>เปลี่ยนเป็น Done</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}