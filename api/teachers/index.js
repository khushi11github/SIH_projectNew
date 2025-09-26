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
            const { Teacher } = require('../../src/models.cjs');
            
            console.log('Teachers API: Attempting to connect to MongoDB...');
            await connectToMongo(process.env.MONGO_URI);
            console.log('Teachers API: MongoDB connected successfully');
            
            const teachers = await Teacher.find({}).sort({ id: 1 });
            console.log('Teachers API: Found', teachers.length, 'teachers in database');
            
            if (teachers.length === 0) {
                console.log('Teachers API: No teachers found in database, using fallback data');
                throw new Error('No teachers found in database');
            }
            
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
                count: formattedTeachers.length
            });
        } catch (error) {
            console.error('Error fetching teachers:', error.message);
            // Return actual teacher IDs from your database structure
            const mockTeachers = [
                { id: 'T1', name: 'Dr. Smith', subjects: ['Mathematics', 'Physics'], rating: 4.8 },
                { id: 'T2', name: 'Prof. Johnson', subjects: ['Chemistry', 'Biology'], rating: 4.6 },
                { id: 'T3', name: 'Ms. Davis', subjects: ['English', 'History'], rating: 4.9 },
                { id: 'T4', name: 'Mr. Wilson', subjects: ['Computer Sci', 'Mathematics'], rating: 4.7 },
                { id: 'T5', name: 'Dr. Brown', subjects: ['Physics', 'Chemistry'], rating: 4.5 }
            ];
            res.json({ 
                teachers: mockTeachers, 
                source: 'fallback',
                note: 'Using fallback data due to DB error: ' + error.message,
                count: mockTeachers.length
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}