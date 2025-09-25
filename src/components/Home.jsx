import React, { useState, useEffect } from 'react'

function Home() {
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, teachersRes] = await Promise.all([
          fetch('/api/students'),
          fetch('/api/teachers')
        ])
        const studentsData = await studentsRes.json()
        const teachersData = await teachersRes.json()
        setStudents(studentsData.students || [])
        setTeachers(teachersData.teachers || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h1>Timetable Generator</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Timetable Generator</h1>
        <p className="muted">Select a student or teacher to view their timetable.</p>
        
        <div className="row">
          <div>
            <h3>Students ({students.length})</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px' }}>
              {students.map(student => (
                <div key={student.id} style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
                  <a href={`/timetable/${student.id}`} style={{ textDecoration: 'none', color: '#000' }}>
                    <strong>{student.id}</strong> - {student.name} (Class: {student.classId})
                  </a>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3>Teachers ({teachers.length})</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px' }}>
              {teachers.map(teacher => (
                <div key={teacher.id} style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
                  <a href={`/timetable/teacher/${teacher.id}`} style={{ textDecoration: 'none', color: '#000' }}>
                    <strong>{teacher.id}</strong> - {teacher.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/admin" style={{ textDecoration: 'none' }}>
            <button className="primary">Admin Panel</button>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Home

