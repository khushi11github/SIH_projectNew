import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

function TeacherTimetable() {
  const { teacherId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await fetch(`/api/teachers/${teacherId}`)
        if (!response.ok) {
          throw new Error('Failed to load timetable')
        }
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching timetable:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTimetable()
  }, [teacherId])

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h1>Teacher Timetable</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container">
        <div className="card">
          <h1>Teacher Timetable</h1>
          <p className="error">Failed to load timetable for teacher {teacherId}</p>
        </div>
      </div>
    )
  }

  // Build unique ordered days and times
  const orderIndex = (d) => {
    const map = {
      'Mon': 1, 'Monday': 1,
      'Tue': 2, 'Tues': 2, 'Tuesday': 2,
      'Wed': 3, 'Wednesday': 3,
      'Thu': 4, 'Thur': 4, 'Thursday': 4,
      'Fri': 5, 'Friday': 5,
      'Sat': 6, 'Saturday': 6,
      'Sun': 7, 'Sunday': 7
    }
    return map[d] || 99
  }

  const apiDays = Array.from(new Set(data.data.map(r => r.Day).filter(Boolean)))
  const days = apiDays.slice().sort((a, b) => orderIndex(a) - orderIndex(b))
  const times = Array.from(new Set(data.data.map(r => (r.Time || '').replace(/\s+/g, '')).filter(Boolean))).sort((a, b) => a.localeCompare(b))

  // Map (time, day) -> class label
  const cell = {}
  data.data.forEach(r => {
    const d = r.Day
    const t = (r.Time || '').replace(/\s+/g, '')
    if (!d || !t) return
    cell[`${t}|${d}`] = (r.Status === 'Teaching') ? (r.Class || '') : (r.Room || 'Staff Room')
  })

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <h1>Teacher Timetable</h1>
          <span className="badge">{data.name} ({teacherId})</span>
        </div>
        
        <div className="kpis">
          <div className="kpi">Teacher: <span className="pill">{data.name || '—'}</span></div>
          <div className="kpi">Subjects: <span className="pill">{data.subjectNames?.join(', ') || '—'}</span></div>
        </div>

        <div className="panel table-scroll">
          <table className="grid" style={{ width: 'max-content' }}>
            <thead>
              <tr>
                <th>Time \\ Day</th>
                {days.map(d => <th key={d}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {times.map(t => {
                const displayTime = t.replace(/-/g, ' - ')
                return (
                  <tr key={t}>
                    <td><strong>{displayTime}</strong></td>
                    {days.map(d => {
                      const cellValue = cell[`${t}|${d}`] || ''
                      return (
                        <td key={d}>{cellValue}</td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TeacherTimetable

