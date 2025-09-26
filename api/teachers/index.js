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
            console.log('Teachers API: Ensuring database data exists...');
            
            let dataCheck;
            try {
                const { ensureDataExists } = require('../../database-seed.js');
                dataCheck = await ensureDataExists();
            } catch (seedError) {
                console.error('Teachers API: Seeding system error:', seedError.message);
                // Use direct database connection and check
                const { connectToMongo } = require('../../src/db.cjs');
                const { Teacher } = require('../../src/models.cjs');
                await connectToMongo(process.env.MONGO_URI);
                const teacherCount = await Teacher.countDocuments();
                dataCheck = { success: teacherCount > 0, counts: { teachers: teacherCount } };
            }
            if (!dataCheck.success) {
                console.error('Teachers API: Database initialization failed:', dataCheck.error);
                return res.status(500).json({ 
                    error: 'Database initialization failed: ' + dataCheck.error 
                });
            }
            
            // Now fetch from database
            const { connectToMongo } = require('../../src/db.cjs');
            const { Teacher } = require('../../src/models.cjs');
            
            console.log('Teachers API: Connecting to MongoDB...');
            await connectToMongo(process.env.MONGO_URI);
            console.log('Teachers API: MongoDB connected successfully');
            
            const teachers = await Teacher.find({}).sort({ id: 1 });
            console.log('Teachers API: Found', teachers.length, 'teachers in database');
            
            // Transform to match expected format
            const formattedTeachers = teachers.map(teacher => ({
                id: teacher.id,
                name: teacher.name,
                subjects: teacher.subjects || [],
                primarySubjects: teacher.primarySubjects || [],
                availability: teacher.availability || [],
                maxDailyHours: teacher.maxDailyHours,
                rating: teacher.rating
            }));
            
            console.log('Teachers API: Returning', formattedTeachers.length, 'formatted teachers');
            res.json({ 
                teachers: formattedTeachers,
                source: 'database',
                count: formattedTeachers.length,
                databaseCounts: dataCheck.counts
            });
            
        } catch (error) {
            console.error('Error fetching teachers:', error.message);
            res.status(500).json({ 
                error: 'Failed to fetch teachers from database: ' + error.message,
                source: 'error'
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}