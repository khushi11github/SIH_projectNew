import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom'
import StudentTimetable from './components/StudentTimetable'
import TeacherTimetable from './components/TeacherTimetable'
import AdminPanel from './components/AdminPanel'
import Home from './components/Home'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/timetable/:studentId" element={<StudentTimetable />} />
          <Route path="/timetable/teacher/:teacherId" element={<TeacherTimetable />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

