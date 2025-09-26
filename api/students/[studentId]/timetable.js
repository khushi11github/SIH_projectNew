// Keep a singleton generator in memory for timetables
let tgInstance = null;
let lastLoadTime = 0;

// Helper functions for fallback data
function getStudentNameById(studentId) {
    const studentNames = {
        '1000': 'Aarav 1', '1001': 'Isha 2', '1002': 'Vihaan 3', '1003': 'Anaya 4', '1004': 'Advait 5',
        '1005': 'Diya 1', '1006': 'Arjun 2', '1007': 'Sara 3', '1008': 'Kabir 4', '1009': 'Meera 5',
        '1010': 'Aarav 1', '1011': 'Isha 2', '1012': 'Vihaan 3', '1013': 'Anaya 4', '1014': 'Advait 5'
    };
    return studentNames[studentId] || `Student ${studentId}`;
}

function getClassIdByStudentId(studentId) {
    if (['1000', '1001', '1002', '1003', '1004'].includes(studentId)) return 'C1';
    if (['1005', '1006', '1007', '1008', '1009'].includes(studentId)) return 'C2';
    if (['1010', '1011', '1012', '1013', '1014'].includes(studentId)) return 'C3';
    return 'C1';
}

function generateFallbackTimetable() {
    return {
        Monday: [
            { time: '09:00 - 10:00', subject: 'Mathematics', teacher: 'Dr. Smith', room: 'R101', type: 'regular', status: 'pending' },
            { time: '10:00 - 11:00', subject: 'Physics', teacher: 'Prof. Johnson', room: 'R101', type: 'regular', status: 'pending' },
            { time: '11:00 - 12:00', subject: 'Chemistry', teacher: 'Ms. Davis', room: 'R101', type: 'regular', status: 'pending' },
            { time: '01:00 - 02:00', subject: 'English', teacher: 'Mr. Wilson', room: 'R101', type: 'regular', status: 'pending' },
            { time: '02:00 - 03:00', subject: 'Biology', teacher: 'Dr. Brown', room: 'R101', type: 'regular', status: 'pending' }
        ],
        Tuesday: [
            { time: '09:00 - 10:00', subject: 'Chemistry', teacher: 'Ms. Davis', room: 'R101', type: 'regular', status: 'pending' },
            { time: '10:00 - 11:00', subject: 'Mathematics', teacher: 'Dr. Smith', room: 'R101', type: 'regular', status: 'pending' },
            { time: '11:00 - 12:00', subject: 'Physics', teacher: 'Prof. Johnson', room: 'R101', type: 'regular', status: 'pending' },
            { time: '01:00 - 02:00', subject: 'Biology', teacher: 'Dr. Brown', room: 'R101', type: 'regular', status: 'pending' },
            { time: '02:00 - 03:00', subject: 'Computer Sci', teacher: 'Mr. Wilson', room: 'R101', type: 'regular', status: 'pending' }
        ],
        Wednesday: [
            { time: '09:00 - 10:00', subject: 'English', teacher: 'Mr. Wilson', room: 'R101', type: 'regular', status: 'pending' },
            { time: '10:00 - 11:00', subject: 'Biology', teacher: 'Dr. Brown', room: 'R101', type: 'regular', status: 'pending' },
            { time: '11:00 - 12:00', subject: 'Mathematics', teacher: 'Dr. Smith', room: 'R101', type: 'regular', status: 'pending' },
            { time: '01:00 - 02:00', subject: 'Physics', teacher: 'Prof. Johnson', room: 'R101', type: 'regular', status: 'pending' },
            { time: '02:00 - 03:00', subject: 'Chemistry', teacher: 'Ms. Davis', room: 'R101', type: 'regular', status: 'pending' }
        ],
        Thursday: [
            { time: '09:00 - 10:00', subject: 'Biology', teacher: 'Dr. Brown', room: 'R101', type: 'regular', status: 'pending' },
            { time: '10:00 - 11:00', subject: 'Computer Sci', teacher: 'Mr. Wilson', room: 'R101', type: 'regular', status: 'pending' },
            { time: '11:00 - 12:00', subject: 'English', teacher: 'Mr. Wilson', room: 'R101', type: 'regular', status: 'pending' },
            { time: '01:00 - 02:00', subject: 'Mathematics', teacher: 'Dr. Smith', room: 'R101', type: 'regular', status: 'pending' },
            { time: '02:00 - 03:00', subject: 'Physics', teacher: 'Prof. Johnson', room: 'R101', type: 'regular', status: 'pending' }
        ],
        Friday: [
            { time: '09:00 - 10:00', subject: 'Physics', teacher: 'Prof. Johnson', room: 'R101', type: 'regular', status: 'pending' },
            { time: '10:00 - 11:00', subject: 'Chemistry', teacher: 'Ms. Davis', room: 'R101', type: 'regular', status: 'pending' },
            { time: '11:00 - 12:00', subject: 'Biology', teacher: 'Dr. Brown', room: 'R101', type: 'regular', status: 'pending' },
            { time: '01:00 - 02:00', subject: 'Computer Sci', teacher: 'Mr. Wilson', room: 'R101', type: 'regular', status: 'pending' },
            { time: '02:00 - 03:00', subject: 'Mathematics', teacher: 'Dr. Smith', room: 'R101', type: 'activity', status: 'pending' }
        ]
    };
}

function generateFallbackActivities() {
    return [
        { key: 'math_practice', title: 'Mathematics Practice Problems', status: 'pending' },
        { key: 'science_lab', title: 'Science Laboratory Experiment', status: 'pending' },
        { key: 'reading_comp', title: 'Reading Comprehension Exercise', status: 'pending' }
    ];
}

async function getGenerator() {
    // Reload every 10 minutes or if not loaded
    const now = Date.now();
    if (!tgInstance || (now - lastLoadTime) > 10 * 60 * 1000) {
        const { connectToMongo } = require('../../../src/db.cjs');
        
        try {
            // Try importing the full timetable generator (ES module)
            const TimetableGenerator = (await import('../../../src/timetable.js')).default;
            
            await connectToMongo(process.env.MONGO_URI);
            tgInstance = new TimetableGenerator();
            
            const loaded = await tgInstance.loadDataFromMongo();
            if (!loaded || !tgInstance.validateData()) {
                console.log('Full generator: Failed to load/validate data, falling back to simplified version');
                throw new Error('Data validation failed');
            }
            
            tgInstance.initializeGenerator();
            const success = tgInstance.generateTimetable();
            if (!success) {
                console.log('Full generator: Failed to generate timetable, falling back to simplified version');
                throw new Error('Timetable generation failed');
            }
            
            await tgInstance.fillFreeSlotsWithActivities();
            console.log('Full generator: Successfully loaded');
            
        } catch (fullGeneratorError) {
            console.error('Full generator failed:', fullGeneratorError.message);
            
            // Fallback to simplified timetable generator
            try {
                const SimpleTimetableGenerator = require('../../../src/timetable.cjs');
                await connectToMongo(process.env.MONGO_URI);
                tgInstance = new SimpleTimetableGenerator();
                
                const loaded = await tgInstance.loadDataFromMongo();
                if (!loaded || !tgInstance.validateData()) {
                    throw new Error('Simplified generator also failed to load data');
                }
                
                tgInstance.initializeGenerator();
                const success = tgInstance.generateTimetable();
                if (!success) {
                    throw new Error('Simplified generator failed to generate timetable');
                }
                
                await tgInstance.fillFreeSlotsWithActivities();
                console.log('Simplified generator: Successfully loaded as fallback');
                
            } catch (simplifiedError) {
                console.error('Both generators failed:', simplifiedError.message);
                throw new Error('All timetable generators failed: ' + simplifiedError.message);
            }
        }
        
        lastLoadTime = now;
    }
    return tgInstance;
}

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { studentId } = req.query;

    if (req.method === 'GET') {
        try {
            const tg = await getGenerator();
            
            // Use the real formatStudentTimetable method
            let studentData;
            try {
                studentData = tg.formatStudentTimetable(studentId);
            } catch (formatError) {
                console.error('Format error:', formatError.message);
                // Try the simplified method if available
                studentData = tg.getStudentTimetable ? tg.getStudentTimetable(studentId) : null;
            }
            
            if (!studentData || (!studentData.studentName && !studentData.name)) {
                // Return fallback data for the requested student ID
                const studentName = getStudentNameById(studentId);
                const classId = getClassIdByStudentId(studentId);
                
                return res.json({
                    studentId: studentId,
                    name: studentName,
                    classId: classId,
                    className: `Class ${classId}`,
                    timetable: generateFallbackTimetable(),
                    activities: generateFallbackActivities(),
                    note: 'Using fallback timetable data - student not found in generator'
                });
            }
            
            // Transform data to match UI expectations
            const transformedData = {
                studentId: studentData.studentId,
                name: studentData.studentName || studentData.name,
                classId: studentData.classId,
                className: studentData.className || `Class ${studentData.classId}`,
                timetable: {},
                activities: []
            };
            
            // Handle different data formats
            if (studentData.data && Array.isArray(studentData.data)) {
                // Full generator format
                const activities = [];
                studentData.data.forEach(row => {
                    if (!row.Day) return; // Skip empty rows
                    
                    if (!transformedData.timetable[row.Day]) {
                        transformedData.timetable[row.Day] = [];
                    }
                    
                    transformedData.timetable[row.Day].push({
                        time: row.Time,
                        subject: row.Subject,
                        teacher: row.Teacher,
                        room: row.Room,
                        type: row.Type ? row.Type.toLowerCase().replace(' ', '') : 'regular',
                        status: row.Progress,
                        notes: row.Notes,
                        key: row.ActivityKey
                    });
                    
                    // Collect activities
                    if (row.IndividualActivity && row.ActivityKey) {
                        activities.push({
                            key: row.ActivityKey,
                            title: row.IndividualActivity,
                            status: row.Progress || 'pending'
                        });
                    }
                });
                transformedData.activities = activities;
            } else if (studentData.timetable) {
                // Simplified generator format
                transformedData.timetable = studentData.timetable;
                transformedData.activities = studentData.activities || [];
            }
            
            res.json(transformedData);
            
        } catch (error) {
            console.error('Error fetching student timetable:', error.message, error.stack);
            
            // Return comprehensive fallback data
            const studentName = getStudentNameById(studentId);
            const classId = getClassIdByStudentId(studentId);
            
            res.json({
                studentId: studentId,
                name: studentName,
                classId: classId,
                className: `Class ${classId}`,
                timetable: generateFallbackTimetable(),
                activities: generateFallbackActivities(),
                error: error.message,
                note: 'Using complete fallback timetable due to server error'
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}