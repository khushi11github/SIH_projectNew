// Debug endpoint to check database connection and data
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
            const { Student, Teacher, ClassModel, Subject } = require('../../src/models.cjs');
            
            // Test database connection
            console.log('Testing database connection...');
            await connectToMongo(process.env.MONGO_URI);
            console.log('Database connected successfully');
            
            // Fetch actual data from database
            const students = await Student.find({}).limit(5);
            const teachers = await Teacher.find({}).limit(5);
            const classes = await ClassModel.find({}).limit(5);
            const subjects = await Subject.find({}).limit(5);
            
            const debugInfo = {
                databaseConnection: 'SUCCESS',
                mongoUri: process.env.MONGO_URI ? 'SET' : 'NOT_SET',
                collections: {
                    students: {
                        count: students.length,
                        sample: students.map(s => ({ id: s.id, name: s.name, classId: s.classId }))
                    },
                    teachers: {
                        count: teachers.length,
                        sample: teachers.map(t => ({ id: t.id, name: t.name, subjects: t.subjects }))
                    },
                    classes: {
                        count: classes.length,
                        sample: classes.map(c => ({ id: c.id, name: c.name, room: c.room }))
                    },
                    subjects: {
                        count: subjects.length,
                        sample: subjects.map(s => ({ id: s.id, name: s.name, credits: s.credits }))
                    }
                }
            };
            
            console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
            res.json(debugInfo);
            
        } catch (error) {
            console.error('Database debug error:', error.message);
            res.status(500).json({ 
                error: error.message,
                databaseConnection: 'FAILED',
                mongoUri: process.env.MONGO_URI ? 'SET' : 'NOT_SET'
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}