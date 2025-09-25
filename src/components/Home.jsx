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
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: 0 }}>
            <span style={{ fontSize: '32px' }}>📅</span>
            Timetable Generator
          </h1>
          <p className="muted" style={{ fontSize: '16px', marginTop: '8px' }}>
            Select a student or teacher to view their personalized timetable
          </p>
        </div>
        
        <div className="card-grid">
          <div className="info-card">
            <h3>
              <span style={{ fontSize: '20px' }}>🎓</span>
              Students ({students.length})
            </h3>
            <div className="entity-list">
              {students.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '8px' }}>📚</span>
                  No students found
                </div>
              ) : (
                students.map(student => (
                  <div key={student.id} className="entity-item">
                    <a href={`/timetable/${student.id}`} className="entity-link">
                      <div className="entity-id">{student.id}</div>
                      <div className="entity-details">
                        {student.name} • Class: {student.classId}
                      </div>
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="info-card">
            <h3>
              <span style={{ fontSize: '20px' }}>👨‍🏫</span>
              Teachers ({teachers.length})
            </h3>
            <div className="entity-list">
              {teachers.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '8px' }}>👩‍🏫</span>
                  No teachers found
                </div>
              ) : (
                teachers.map(teacher => (
                  <div key={teacher.id} className="entity-item">
                    <a href={`/timetable/teacher/${teacher.id}`} className="entity-link">
                      <div className="entity-id">{teacher.id}</div>
                      <div className="entity-details">
                        {teacher.name}
                        {teacher.subjects && (
                          <span style={{ marginLeft: '8px', color: '#3b82f6' }}>
                            • {teacher.subjects.slice(0, 2).join(', ')}
                            {teacher.subjects.length > 2 && ' +more'}
                          </span>
                        )}
                      </div>
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '32px', 
          textAlign: 'center',
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>⚙️</span>
            Administrative Actions
          </h4>
          <a href="/admin" style={{ textDecoration: 'none' }}>
            <button className="primary" style={{ fontSize: '16px', padding: '12px 24px' }}>
              <span>👑</span>
              Admin Panel
            </button>
          </a>
          <p className="muted" style={{ fontSize: '13px', marginTop: '8px' }}>
            Manage teachers, subjects, and system configuration
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home

