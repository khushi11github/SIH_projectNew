// Keep a singleton generator in memory for timetables
let tgInstance = null;
let lastLoadTime = 0;

async function getGenerator() {
    // Reload every 10 minutes or if not loaded
    const now = Date.now();
    if (!tgInstance || (now - lastLoadTime) > 10 * 60 * 1000) {
        const { connectToMongo } = require('../../../src/db.cjs');
        
        // Import the full timetable generator (ES module)
        const TimetableGenerator = (await import('../../../src/timetable.js')).default;
        
        await connectToMongo(process.env.MONGO_URI);
        tgInstance = new TimetableGenerator();
        
        const loaded = await tgInstance.loadDataFromMongo();
        if (!loaded || !tgInstance.validateData()) {
            throw new Error('Failed to load or validate data from database');
        }
        
        tgInstance.initializeGenerator();
        const success = tgInstance.generateTimetable();
        if (!success) {
            throw new Error('Failed to generate timetable with current constraints');
        }
        
        await tgInstance.fillFreeSlotsWithActivities();
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
            const studentData = tg.formatStudentTimetable(studentId);
            
            if (!studentData || !studentData.studentName) {
                return res.status(404).json({ error: 'Student not found' });
            }
            
            // Transform data to match UI expectations
            const transformedData = {
                studentId: studentData.studentId,
                name: studentData.studentName,
                classId: studentData.classId,
                className: studentData.className,
                timetable: {},
                activities: []
            };
            
            // Group by days and extract activities
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
                    type: row.Type.toLowerCase().replace(' ', ''),
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
            
            res.json(transformedData);
            
        } catch (error) {
            console.error('Error fetching student timetable:', error.message);
            res.status(500).json({ 
                error: error.message,
                note: 'Failed to generate timetable from database'
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}