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
        <h1>Admin Panel</h1>
        <p className="muted">Add or update teacher info directly in MongoDB.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div>
              <label>Teacher ID (e.g., T1)</label>
              <input
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                placeholder="T1"
                required
              />
            </div>
            <div>
              <label>Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Dr. Smith"
                required
              />
            </div>
          </div>
          
          <div className="row">
            <div>
              <label>Subjects (comma separated IDs)</label>
              <input
                name="subjects"
                value={formData.subjects}
                onChange={handleInputChange}
                placeholder="MATH,PHY"
              />
            </div>
            <div>
              <label>Primary Subjects (comma separated IDs)</label>
              <input
                name="primarySubjects"
                value={formData.primarySubjects}
                onChange={handleInputChange}
                placeholder="MATH"
              />
            </div>
          </div>
          
          <div className="row">
            <div>
              <label>Availability (e.g., Mon:09:00-15:00,Tue:09:00-15:00)</label>
              <input
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                placeholder="Mon:09:00-15:00,Tue:09:00-15:00"
              />
            </div>
            <div>
              <label>Max Daily Hours</label>
              <input
                name="maxDailyHours"
                type="number"
                min="0"
                value={formData.maxDailyHours}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="row">
            <div>
              <label>Rating</label>
              <input
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button type="submit" className="primary">Save Teacher</button>
            <span className={status.includes('Failed') ? 'error' : status.includes('Saved') ? 'success' : 'status'}>
              {status}
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminPanel

