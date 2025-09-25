// Debug endpoint to check available students in the timetable generator
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

    if (req.method === 'GET') {
        try {
            const { connectToMongo } = require('../../src/db.cjs');
            
            // Import the full timetable generator (ES module)
            const TimetableGenerator = (await import('../../src/timetable.js')).default;
            
            await connectToMongo(process.env.MONGO_URI);
            const tg = new TimetableGenerator();
            
            const loaded = await tg.loadDataFromMongo();
            if (!loaded || !tg.validateData()) {
                return res.status(500).json({ error: 'Failed to load data from database' });
            }
            
            tg.initializeGenerator();
            const success = tg.generateTimetable();
            if (!success) {
                return res.status(500).json({ error: 'Failed to generate timetable' });
            }
            
            // Return debug info about students
            const studentsInfo = {
                studentsCount: tg.students ? tg.students.length : 0,
                students: tg.students ? tg.students.map(s => ({ 
                    id: s.id, 
                    name: s.name, 
                    classId: s.classId,
                    type: typeof s.id
                })) : [],
                classesCount: tg.classes ? tg.classes.length : 0,
                classes: tg.classes ? tg.classes.map(c => ({ 
                    id: c.id, 
                    name: c.name,
                    type: typeof c.id
                })) : []
            };
            
            res.json(studentsInfo);
            
        } catch (error) {
            console.error('Debug error:', error.message);
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}