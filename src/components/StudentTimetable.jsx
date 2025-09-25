import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

function StudentTimetable() {
  const { studentId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState('')
  const [days, setDays] = useState([])

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await fetch(`/api/students/${studentId}/timetable`)
        if (!response.ok) {
          throw new Error('Failed to load timetable')
        }
        const result = await response.json()
        setData(result)
        
        // Extract unique days
        const uniqueDays = [...new Set(result.data.map(item => item.Day).filter(Boolean))]
        setDays(uniqueDays)
        if (uniqueDays.length > 0 && !selectedDay) {
          setSelectedDay(uniqueDays[0])
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

  const filteredData = data?.data?.filter(item => item.Day === selectedDay) || []

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
          <span className="badge">{data.studentName} ({studentId}) • Class: {data.classId}</span>
        </div>
        
        <div className="kpis">
          <div className="kpi">Student: <span className="pill">{data.studentName || '—'}</span></div>
          <div className="kpi">Class: <span className="pill">{data.classId || '—'}</span></div>
          <div className="kpi">Status: <span className="pill">Loaded</span></div>
          <div className="kpi">Rows: <span className="pill">{data.data?.length || 0}</span></div>
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
                if (Object.keys(row).length === 0) {
                  return <tr key={index}><td colSpan="9" style={{ height: '8px' }}></td></tr>
                }
                
                return (
                  <tr key={index}>
                    <td>{row.Day}</td>
                    <td>{row.Time}</td>
                    <td>{row.Subject}</td>
                    <td>{row.Teacher}</td>
                    <td>{row.Room}</td>
                    <td>{row.Type}</td>
                    <td>{row.Progress}</td>
                    <td>{row.Notes}</td>
                    <td>
                      {row.ActivityKey ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <select
                            value={row.Progress || ''}
                            onChange={(e) => handleProgressUpdate(row.ActivityKey, e.target.value)}
                            style={{ padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          >
                            <option value="">Set status</option>
                            <option value="todo">To do</option>
                            <option value="in_progress">In progress</option>
                            <option value="done">Done</option>
                          </select>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
          <button onClick={handleRegenerateActivities}>Regenerate Activities</button>
          <small className="muted">Rebuilds plans using AI diversity rules</small>
        </div>

        <div className="panel" style={{ marginTop: '12px' }}>
          <h4>Activity Periods</h4>
          {filteredData.filter(row => row.Type === 'Activity Period').length === 0 ? (
            <em className="muted">No activity periods found.</em>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
              {filteredData
                .filter(row => row.Type === 'Activity Period')
                .map((row, index) => (
                  <div key={index} className="panel" style={{ borderRadius: '10px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '6px' }}>
                      {row.Day} {row.Time}
                    </div>
                    <div>
                      Activity: <span style={{ fontWeight: '600', color: '#000' }}>
                        {row.IndividualActivity || '—'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentTimetable

