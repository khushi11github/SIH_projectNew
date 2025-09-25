const path = require('path');
const XLSX = require('xlsx');
const { connectToMongo } = require('../src/db');
const { Teacher, ClassModel, Subject, Student, Config } = require('../src/models');

function readFirstSheet(filePath) {
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws || {});
}

function parseAvailability(str) {
    if (!str || typeof str !== 'string') return [];
    return str.split(',').map(v => {
        const [day, rng] = v.split(':');
        if (!day || !rng) return null;
        const [startTime, endTime] = rng.split('-');
        if (!startTime || !endTime) return null;
        return { day: day.trim(), startTime: startTime.trim(), endTime: endTime.trim() };
    }).filter(Boolean);
}

async function main() {
    const ROOT = path.resolve(__dirname, '..');
    const DATA_DIR = path.join(ROOT, 'excel_data');
    await connectToMongo(process.env.MONGO_URI);

    // Load Excel files
    const teachersRows = readFirstSheet(path.join(DATA_DIR, 'teachers.xlsx'));
    const classesRows = readFirstSheet(path.join(DATA_DIR, 'classes.xlsx'));
    const subjectsRows = readFirstSheet(path.join(DATA_DIR, 'subjects.xlsx'));
    let studentsRows = [];
    try {
        studentsRows = readFirstSheet(path.join(DATA_DIR, 'students.xlsx'));
    } catch (e) { studentsRows = []; }
    const configRows = readFirstSheet(path.join(DATA_DIR, 'config.xlsx'));

    // Upsert subjects
    const subjectOps = subjectsRows.map(r => ({
        updateOne: {
            filter: { id: String(r.id) },
            update: {
                $set: {
                    id: String(r.id),
                    name: r.name,
                    credits: Number(r.credits || r.Credits || 1),
                    weeklySessions: Number(r.weeklySessions || r.WeeklySessions || 1)
                }
            },
            upsert: true
        }
    }));
    if (subjectOps.length) await Subject.bulkWrite(subjectOps, { ordered: false });

    // Upsert teachers
    const teacherOps = teachersRows.map(t => {
        const subjects = t.subjects ? String(t.subjects).split(',').map(s => String(s).trim()).filter(Boolean) : [];
        const primarySubjects = t.primarySubjects ? String(t.primarySubjects).split(',').map(s => String(s).trim()).filter(Boolean) : [];
        return ({
            updateOne: {
                filter: { id: String(t.id) },
                update: {
                    $set: {
                        id: String(t.id || ''),
                        name: t.name || '',
                        subjects,
                        primarySubjects,
                        availability: parseAvailability(t.availability),
                        maxDailyHours: Number(t.maxDailyHours || t.MaxDailyHours || 0),
                        rating: Number(t.rating || t.Rating || 0)
                    }
                },
                upsert: true
            }
        });
    });
    if (teacherOps.length) await Teacher.bulkWrite(teacherOps, { ordered: false });

    // Upsert classes
    const classOps = classesRows.map(c => ({
        updateOne: {
            filter: { id: String(c.id) },
            update: {
                $set: {
                    id: String(c.id),
                    name: c.name,
                    room: c.room,
                    subjects: String(c.subjects || '').split(',').map(s => String(s).trim()).filter(Boolean),
                    totalCredits: Number(c.totalCredits || c.TotalCredits || 0)
                }
            },
            upsert: true
        }
    }));
    if (classOps.length) await ClassModel.bulkWrite(classOps, { ordered: false });

    // Upsert students
    const studentOps = studentsRows.map(s => ({
        updateOne: {
            filter: { id: String(s.id || s.ID || s.studentId || s.StudentId || s.StudentID || '') },
            update: {
                $set: {
                    id: String(s.id || s.ID || s.studentId || s.StudentId || s.StudentID || ''),
                    name: s.name || s.Name || '',
                    classId: String(s.classId || s.ClassId || s.class || s.Class || ''),
                    interests: s.interests ? String(s.interests).split(',').map(x => String(x).trim()).filter(Boolean) : [],
                    skillLevel: Number(s.skillLevel || s.Skill || s.proficiency || 3) || 3,
                    goals: s.goals || s.Goals || ''
                }
            },
            upsert: true
        }
    }));
    if (studentOps.length) await Student.bulkWrite(studentOps, { ordered: false });

    // Upsert config
    const configOps = configRows.map(r => ({
        updateOne: {
            filter: { key: String(r.key) },
            update: { $set: { key: String(r.key), value: r.value } },
            upsert: true
        }
    }));
    if (configOps.length) await Config.bulkWrite(configOps, { ordered: false });

    console.log('Mongo seed complete from excel_data/*.xlsx');
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });



