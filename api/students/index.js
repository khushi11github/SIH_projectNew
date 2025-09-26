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
            // First ensure database has data
            const { ensureDataExists } = require('../../database-seed.js');
            console.log('Students API: Ensuring database data exists...');
            
            const dataCheck = await ensureDataExists();
            if (!dataCheck.success) {
                console.error('Students API: Database initialization failed:', dataCheck.error);
                return res.status(500).json({ 
                    error: 'Database initialization failed: ' + dataCheck.error 
                });
            }
            
            // Now fetch from database
            const { connectToMongo } = require('../../src/db.cjs');
            const { Student } = require('../../src/models.cjs');
            
            console.log('Students API: Connecting to MongoDB...');
            await connectToMongo(process.env.MONGO_URI);
            console.log('Students API: MongoDB connected successfully');
            
            const students = await Student.find({}).sort({ id: 1 });
            console.log('Students API: Found', students.length, 'students in database');
            
            // Transform to match expected format
            const formattedStudents = students.map(student => ({
                id: student.id,
                name: student.name,
                classId: student.classId,
                goals: student.goals,
                interests: student.interests,
                skillLevel: student.skillLevel
            }));
            
            console.log('Students API: Returning', formattedStudents.length, 'formatted students');
            res.json({ 
                students: formattedStudents,
                source: 'database',
                count: formattedStudents.length,
                databaseCounts: dataCheck.counts
            });
            
        } catch (error) {
            console.error('Error fetching students:', error.message);
            res.status(500).json({ 
                error: 'Failed to fetch students from database: ' + error.message,
                source: 'error'
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}