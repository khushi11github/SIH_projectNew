const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const TimetableGenerator = require('./src/timetable.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Multer storage to excel_data directory
const excelDir = path.join(__dirname, 'excel_data');
if (!fs.existsSync(excelDir)) fs.mkdirSync(excelDir, { recursive: true });
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, excelDir);
    },
    filename: function (req, file, cb) {
        // Preserve original filenames
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

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
        tgInstance = new TimetableGenerator();
        const loaded = await tgInstance.loadDataFromExcel(path.join(__dirname, 'excel_data'));
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
        // Optionally persist snapshot immediately to output folder
        tg.writeStudentProgressToExcel(path.join(__dirname, 'output'));
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

// Admin upload endpoint: accepts multiple Excel files and triggers regeneration
// Expected files: teachers.xlsx, classes.xlsx, subjects.xlsx, students.xlsx, config.xlsx
app.post('/api/admin/upload', upload.array('files', 10), async (req, res) => {
    try {
        // Invalidate current generator so next call reloads from disk
        tgInstance = null;
        // Optionally trigger generation immediately
        const tg = await getGenerator();
        // Regenerate full timetable
        const ok = tg.generateTimetable();
        if (!ok) return res.status(500).json({ error: 'Unable to generate timetable with uploaded data' });
        await tg.fillFreeSlotsWithActivities();
        return res.json({ ok: true, files: (req.files || []).map(f => f.originalname) });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
