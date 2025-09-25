const express = require('express');
const { connectToMongo } = require('../src/db');
const { Teacher, Student } = require('../src/models');
const TimetableGenerator = require('../src/timetable.js');

const app = express();
app.use(express.json());

// Keep a singleton generator in memory for activity plans and progress
let tgInstance = null;
async function getGenerator() {
    if (!tgInstance) {
        await connectToMongo(process.env.MONGO_URI);
        tgInstance = new TimetableGenerator();
        const loaded = await tgInstance.loadDataFromMongo();
        if (!loaded || !tgInstance.validateData()) {
            tgInstance = null;
            throw new Error('Invalid data');
        }
        tgInstance.initializeGenerator();
        const ok = tgInstance.generateTimetable();
        if (!ok) {
            tgInstance = null;
            throw new Error('Unable to generate timetable with given constraints');
        }
        await tgInstance.fillFreeSlotsWithActivities();
    }
    return tgInstance;
}

// Generate and get timetables
app.get('/generate', async (req, res) => {
    try {
        tgInstance = null; // Force regeneration
        const tg = await getGenerator();
        res.json({ ok: true, message: 'Timetables regenerated' });
    } catch (error) {
        console.error('Error generating timetables:', error.message);
        res.status(500).json({ ok: false, error: error.message });
    }
});

// Get student timetable with AI activity periods
app.get('/students/:studentId/timetable', async (req, res) => {
    const { studentId } = req.params;
    try {
        const tg = await getGenerator();
        const studentData = tg.getStudentTimetable(studentId);
        if (!studentData) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(studentData);
    } catch (error) {
        console.error('Error fetching student timetable:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Update student progress on activity
app.post('/students/:studentId/progress', async (req, res) => {
    const { studentId } = req.params;
    const { activityKey, status } = req.body;
    try {
        const tg = await getGenerator();
        tg.updateStudentProgress(studentId, activityKey, status);
        res.json({ ok: true, message: 'Progress updated' });
    } catch (error) {
        console.error('Error updating progress:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get all students
app.get('/students', async (req, res) => {
    try {
        await connectToMongo(process.env.MONGO_URI);
        const students = await Student.find({}).sort({ id: 1 });
        res.json({ students });
    } catch (error) {
        console.error('Error fetching students:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get teacher timetable
app.get('/teachers/:teacherId', async (req, res) => {
    const { teacherId } = req.params;
    try {
        const tg = await getGenerator();
        const teacherData = tg.getTeacherTimetable(teacherId);
        if (!teacherData) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.json(teacherData);
    } catch (error) {
        console.error('Error fetching teacher timetable:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get all teachers
app.get('/teachers', async (req, res) => {
    try {
        await connectToMongo(process.env.MONGO_URI);
        const teachers = await Teacher.find({}).sort({ id: 1 });
        res.json({ teachers });
    } catch (error) {
        console.error('Error fetching teachers:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Add/update teacher
app.post('/admin/teachers', async (req, res) => {
    try {
        await connectToMongo(process.env.MONGO_URI);
        const {
            id, name, subjects, primarySubjects,
            availability, maxDailyHours, rating
        } = req.body;

        const subjectsList = subjects ? subjects.split(',').map(s => s.trim()) : [];
        const primarySubjectsList = primarySubjects ? primarySubjects.split(',').map(s => s.trim()) : [];

        const teacher = await Teacher.findOneAndUpdate(
            { id },
            {
                id, name, subjects: subjectsList, primarySubjects: primarySubjectsList,
                availability, maxDailyHours: Number(maxDailyHours) || 0,
                rating: Number(rating) || 0
            },
            { upsert: true, new: true }
        );

        tgInstance = null; // Reset generator to pick up changes
        res.json({ ok: true, teacher });
    } catch (error) {
        console.error('Error saving teacher:', error.message);
        res.status(500).json({ ok: false, error: error.message });
    }
});

module.exports = app;