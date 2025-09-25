require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectToMongo } = require('./src/db');
const { Teacher, Student } = require('./src/models');
const TimetableGenerator = require('./src/timetable.js');

const app = express();
const PORT ="https://sih-project-new.vercel.app/" 

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve teacher timetable page by URL: /timetable/teacher/:teacherId
app.get('/timetable/teacher/:teacherId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve student timetable page by URL: /timetable/:studentId
app.get('/timetable/:studentId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Simple Admin UI page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

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
app.get('/api/generate', async (req, res) => {
	try {
        tgInstance = null; // force rebuild
        const tg = await getGenerator();
        const classes = tg.displayTimetable();
		return res.json({ classes });
	} catch (e) {
		return res.status(500).json({ error: e.message });
	}
});

// Class timetable by class id
app.get('/api/classes/:classId', async (req, res) => {
	try {
        const tg = await getGenerator();
		const classId = req.params.classId;
		const data = tg.formatClassTimetableForExcel(classId);
		return res.json({ classId, data });
	} catch (e) {
		return res.status(500).json({ error: e.message });
	}
});

// Teacher timetable by teacher id
app.get('/api/teachers/:teacherId', async (req, res) => {
    try {
        const tg = await getGenerator();
        const teacherId = String(req.params.teacherId);
        const data = tg.formatTeacherTimetableForExcel(teacherId);
        // Include teacher name and subjects directly to avoid extra calls
        const teacher = (tg.teachers || []).find(t => String(t.id) === teacherId) || null;
        const subjectIds = teacher && Array.isArray(teacher.subjects) ? teacher.subjects : [];
        const subjectNames = subjectIds
            .map(id => (tg.subjects || []).find(s => String(s.id) === String(id)))
            .filter(Boolean)
            .map(s => s.name || String(s.id));
        const name = teacher ? (teacher.name || '') : '';
        return res.json({ teacherId, name, subjectNames, data });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Teacher info: name and subjects they teach
app.get('/api/teachers/:teacherId/info', async (req, res) => {
    try {
        const tg = await getGenerator();
        const teacherId = String(req.params.teacherId);
        const teacher = (tg.teachers || []).find(t => String(t.id) === teacherId);
        if (!teacher) return res.json({ teacherId, name: '', subjects: [], subjectNames: [] });
        const subjectIds = Array.isArray(teacher.subjects) ? teacher.subjects : [];
        const subjectNames = subjectIds
            .map(id => (tg.subjects || []).find(s => String(s.id) === String(id)))
            .filter(Boolean)
            .map(s => s.name || String(s.id));
        return res.json({ teacherId, name: teacher.name || '', subjects: subjectIds, subjectNames });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Student activity plan by student id
app.get('/api/students/:studentId/plan', async (req, res) => {
    try {
        const tg = await getGenerator();
        const studentId = req.params.studentId;
        const plan = tg.getStudentPlan(studentId);
        return res.json({ studentId, plan });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Get student progress
app.get('/api/students/:studentId/progress', async (req, res) => {
    try {
        const tg = await getGenerator();
        const studentId = req.params.studentId;
        const progress = tg.getStudentProgress(studentId);
        return res.json({ studentId, progress });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Get merged student timetable with AI activities and progress
app.get('/api/students/:studentId/timetable', async (req, res) => {
    try {
        const tg = await getGenerator();
        const studentId = req.params.studentId;
        const result = tg.formatStudentTimetable(studentId);
        return res.json(result);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Get basic student info (name, classId, className)
app.get('/api/students/:studentId', async (req, res) => {
    try {
        const tg = await getGenerator();
        const studentId = String(req.params.studentId);
        const student = (tg.students || []).find(s => String(s.id) === studentId) || null;
        const classId = student ? String(student.classId || '') : '';
        const classObj = (tg.classes || []).find(c => String(c.id) === classId) || null;
        return res.json({
            studentId,
            studentName: student ? (student.name || '') : '',
            classId: classId || '',
            className: classObj ? (classObj.name || '') : ''
        });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Update student progress
app.post('/api/students/:studentId/progress', async (req, res) => {
    try {
        const tg = await getGenerator();
        const studentId = req.params.studentId;
        const { activityKey, status, notes } = req.body || {};
        if (!activityKey) return res.status(400).json({ error: 'activityKey is required' });
        const rec = tg.updateStudentProgress(studentId, activityKey, status, notes);
        // Persist to MongoDB
        await tg.writeStudentProgressToMongo();
        return res.json({ studentId, activityKey, record: rec });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Export all Excel outputs (class/teacher/student)
app.post('/api/export', async (req, res) => {
    try {
        const tg = await getGenerator();
        const ok = tg.exportTimetableToExcel(path.join(__dirname, 'output'));
        if (!ok) return res.status(500).json({ error: 'Export failed' });
        return res.json({ ok: true });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Admin upload is disabled; data must be pre-seeded in MongoDB
app.post('/api/admin/upload', async (req, res) => {
    return res.status(410).json({ error: 'Upload disabled. Seed data into MongoDB instead.' });
});

// Helper endpoints to discover IDs
app.get('/api/teachers', async (req, res) => {
    try {
        await connectToMongo(process.env.MONGO_URI);
        const docs = await Teacher.find({}, { _id: 0, id: 1, name: 1 }).lean();
        return res.json({ teachers: docs });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

app.get('/api/students', async (req, res) => {
    try {
        await connectToMongo(process.env.MONGO_URI);
        const docs = await Student.find({}, { _id: 0, id: 1, name: 1, classId: 1 }).lean();
        return res.json({ students: docs });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Admin: add/update teacher
app.post('/api/admin/teachers', async (req, res) => {
    try {
        await connectToMongo(process.env.MONGO_URI);
        const body = req.body || {};
        const id = String(body.id || '').trim();
        if (!id) return res.status(400).json({ error: 'id is required' });
        const name = String(body.name || '').trim();
        const subjects = Array.isArray(body.subjects) ? body.subjects.map(String) : String(body.subjects || '').split(',').map(s => String(s).trim()).filter(Boolean);
        const primarySubjects = Array.isArray(body.primarySubjects) ? body.primarySubjects.map(String) : String(body.primarySubjects || '').split(',').map(s => String(s).trim()).filter(Boolean);
        // availability as array of { day, startTime, endTime } or string "Mon:09:00-15:00,..."
        let availability = [];
        if (Array.isArray(body.availability)) {
            availability = body.availability.map(a => ({ day: String(a.day||'').trim(), startTime: String(a.startTime||'').trim(), endTime: String(a.endTime||'').trim() })).filter(a => a.day && a.startTime && a.endTime);
        } else if (typeof body.availability === 'string') {
            availability = body.availability.split(',').map(v => {
                const [day, rng] = v.split(':');
                if (!day || !rng) return null;
                const [startTime, endTime] = rng.split('-');
                if (!startTime || !endTime) return null;
                return { day: day.trim(), startTime: startTime.trim(), endTime: endTime.trim() };
            }).filter(Boolean);
        }
        const maxDailyHours = Number(body.maxDailyHours || 0);
        const rating = Number(body.rating || 0);
        await Teacher.updateOne({ id }, { $set: { id, name, subjects, primarySubjects, availability, maxDailyHours, rating } }, { upsert: true });
        return res.json({ ok: true });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
