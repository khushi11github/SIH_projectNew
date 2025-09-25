import React, { useState } from 'react'

function AdminPanel() {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    subjects: '',
    primarySubjects: '',
    availability: '',
    maxDailyHours: 0,
    rating: 0
  })
  const [status, setStatus] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Saving...')
    
    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (result.ok) {
        setStatus('Saved successfully!')
        setFormData({
          id: '',
          name: '',
          subjects: '',
          primarySubjects: '',
          availability: '',
          maxDailyHours: 0,
          rating: 0
        })
      } else {
        setStatus('Failed: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      setStatus('Failed: ' + error.message)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0 }}>Admin Panel</h1>
          <p className="muted" style={{ margin: '8px 0 0 0', fontSize: '16px' }}>Add or update teacher information in the system</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>
                Teacher ID (e.g., T1)
              </label>
              <input
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                placeholder="T1"
                required
                style={{ width: '100%' }}
              />
            </div>
            <div className="form-group">
              <label>
                Teacher Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Dr. Smith"
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>
                Subjects (comma separated)
              </label>
              <input
                name="subjects"
                value={formData.subjects}
                onChange={handleInputChange}
                placeholder="MATH,PHY,CHEM"
                style={{ width: '100%' }}
              />
            </div>
            <div className="form-group">
              <label>
                Primary Subjects
              </label>
              <input
                name="primarySubjects"
                value={formData.primarySubjects}
                onChange={handleInputChange}
                placeholder="MATH"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>
                Availability Schedule
              </label>
              <input
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                placeholder="Mon:09:00-15:00,Tue:09:00-15:00"
                style={{ width: '100%' }}
              />
              <small className="muted" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Format: Day:StartTime-EndTime (e.g., Mon:09:00-15:00,Tue:10:00-16:00)
              </small>
            </div>
            <div className="form-group">
              <label>
                Max Daily Hours
              </label>
              <input
                name="maxDailyHours"
                type="number"
                min="0"
                max="12"
                value={formData.maxDailyHours}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>
                Teacher Rating (0-5)
              </label>
              <input
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
              <small className="muted" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Performance rating from 0 to 5 stars
              </small>
            </div>
            <div></div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            alignItems: 'center', 
            marginTop: '24px',
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <button type="submit" className="primary">
              Save Teacher
            </button>
            {status && (
              <span 
                className={`status-indicator ${
                  status.includes('Failed') ? 'error' : 
                  status.includes('Saved') ? 'success' : 'info'
                }`}
                style={{
                  background: status.includes('Failed') ? '#fee2e2' : 
                             status.includes('Saved') ? '#dcfce7' : '#e0f2fe',
                  color: status.includes('Failed') ? '#dc2626' : 
                         status.includes('Saved') ? '#059669' : '#0369a1',
                  border: `1px solid ${
                    status.includes('Failed') ? '#fecaca' : 
                    status.includes('Saved') ? '#bbf7d0' : '#bae6fd'
                  }`
                }}
              >
                {status}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminPanel

