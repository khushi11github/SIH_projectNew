import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

function StudentTimetable() {
  const { studentId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState('')
  const [days, setDays] = useState([])

  const getProgressBadge = (progress, type) => {
    if (type === 'Activity Period') {
      return <span className="progress-badge activity">Activity Period</span>
    }
    if (type === 'Special Period') {
      return <span className="progress-badge special">Special Period</span>
    }
    
    if (progress) {
      const badges = {
        'todo': <span className="progress-badge todo">To Do</span>,
        'in_progress': <span className="progress-badge in-progress">In Progress</span>,
        'done': <span className="progress-badge done">Done</span>
      }
      return badges[progress] || <span className="progress-badge regular">Regular Class</span>
    }
    
    return <span className="progress-badge regular">Regular Class</span>
  }

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await fetch(`/api/students/${studentId}/timetable`)
        if (!response.ok) {
          throw new Error('Failed to load timetable')
        }
        const result = await response.json()
        console.log('API Response:', result) // Debug log
        setData(result)
        
        // Extract unique days from timetable object
        if (result.timetable) {
          const uniqueDays = Object.keys(result.timetable)
          setDays(uniqueDays)
          if (uniqueDays.length > 0 && !selectedDay) {
            setSelectedDay(uniqueDays[0])
          }
        }
      } catch (error) {
        console.error('Error fetching timetable:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTimetable()
  }, [studentId, selectedDay])

  const handleRegenerateActivities = async () => {
    try {
      await fetch('/api/generate', { cache: 'no-store' })
      // Reload the timetable
      const response = await fetch(`/api/students/${studentId}/timetable`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error regenerating activities:', error)
    }
  }

  const handleProgressUpdate = async (activityKey, status) => {
    try {
      await fetch(`/api/students/${studentId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityKey, status })
      })
      // Reload the timetable to show updated progress
      const response = await fetch(`/api/students/${studentId}/timetable`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const filteredData = data?.timetable?.[selectedDay] || []

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h1>Student Timetable</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container">
        <div className="card">
          <h1>Student Timetable</h1>
          <p className="error">Failed to load timetable for student {studentId}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <h1>Student Timetable</h1>
          <span className="badge">{data.name} ({data.studentId}) • Class: {data.classId}</span>
        </div>
        
        <div className="kpis">
          <div className="kpi">
            Student: <span className="pill">{data.name || '—'}</span>
          </div>
          <div className="kpi">
            Class: <span className="pill">{data.classId || '—'}</span>
          </div>
          <div className="kpi">
            Status: <span className="pill">Loaded</span>
          </div>
          <div className="kpi">
            Days: <span className="pill">{days.length || 0}</span>
          </div>
        </div>

        {days.length > 0 && (
          <div className="tabs">
            {days.map(day => (
              <button
                key={day}
                className={`tab ${day === selectedDay ? 'active' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        )}

        <div className="panel" style={{ overflow: 'auto', maxHeight: '560px' }}>
          <table className="grid">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Room</th>
                <th>Type</th>
                <th>Progress</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => {
                return (
                  <tr key={index}>
                    <td>{selectedDay}</td>
                    <td style={{ fontWeight: '600' }}>{row.time}</td>
                    <td style={{ fontWeight: '500' }}>{row.subject}</td>
                    <td>{row.teacher}</td>
                    <td>{row.room || '—'}</td>
                    <td>{row.type}</td>
                    <td>{getProgressBadge(row.status, row.type)}</td>
                    <td style={{ color: '#64748b', fontSize: '13px' }}>{row.notes || '—'}</td>
                    <td>
                      {row.type === 'activity' ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <select
                            value={row.status || ''}
                            onChange={(e) => handleProgressUpdate(row.key, e.target.value)}
                            className="status-dropdown"
                          >
                            <option value="">Set status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                          </select>
                          <button className="action-button" title="Edit notes">
                            Edit
                          </button>
                        </div>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <button className="regenerate" onClick={handleRegenerateActivities}>
            Regenerate Activities
          </button>
          <small className="muted" style={{ fontSize: '13px' }}>Rebuilds plans using AI diversity rules</small>
        </div>

        {data.activities && data.activities.length > 0 && (
          <div className="panel" style={{ marginTop: '20px' }}>
            <h4 style={{ marginBottom: '16px', color: '#1e293b' }}>
              Activities & Progress
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {data.activities.map((activity, index) => (
                <div key={index} style={{ 
                  background: activity.status === 'completed' ? '#f0fdf4' : '#fefce8', 
                  border: `1px solid ${activity.status === 'completed' ? '#bbf7d0' : '#fde68a'}`, 
                  borderRadius: '12px', 
                  padding: '16px',
                  transition: 'transform 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <div style={{ 
                    fontWeight: '600', 
                    marginBottom: '8px', 
                    color: activity.status === 'completed' ? '#16a34a' : '#92400e'
                  }}>
                    {activity.title}
                  </div>
                  <div style={{ color: activity.status === 'completed' ? '#15803d' : '#451a03' }}>
                    <strong>Status:</strong> <span style={{ 
                      fontWeight: '600', 
                      color: activity.status === 'completed' ? '#16a34a' : '#92400e',
                      textTransform: 'capitalize'
                    }}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentTimetable

