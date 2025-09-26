const { MongoClient } = require('mongodb');

// Your MongoDB connection details
const MONGODB_URI = 'mongodb+srv://satakratu:satakratu567@cluster0.vs3qc.mongodb.net/';
const DB_NAME = 'sih_timetable';

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method === 'POST') {
        try {
            const client = new MongoClient(MONGODB_URI);
            await client.connect();
            const db = client.db(DB_NAME);
            
            // Check if this is a request to add teachers
            console.log('Request URL:', req.url);
            const url = new URL(req.url, `http://${req.headers.host}`);
            const action = url.searchParams.get('action');
            console.log('Parsed action:', action);
            
            if (action === 'add-students') {
                console.log('Adding students to database...');
                
                const studentsCollection = db.collection('students');

                // Your real student data (the actual names you confirmed)
                const students = [
                    { id: 1000, name: 'Aarav 1', classId: 'C1', section: 'A' },
                    { id: 1001, name: 'Isha 2', classId: 'C1', section: 'A' },
                    { id: 1002, name: 'Vihaan 3', classId: 'C1', section: 'A' },
                    { id: 1003, name: 'Anaya 4', classId: 'C1', section: 'A' },
                    { id: 1004, name: 'Advait 5', classId: 'C1', section: 'A' },
                    { id: 1005, name: 'Diya 6', classId: 'C1', section: 'A' },
                    { id: 1006, name: 'Kabir 7', classId: 'C1', section: 'A' },
                    { id: 1007, name: 'Saanvi 8', classId: 'C1', section: 'A' },
                    { id: 1008, name: 'Arjun 9', classId: 'C1', section: 'A' },
                    { id: 1009, name: 'Kavya 10', classId: 'C1', section: 'A' },
                    { id: 1010, name: 'Reyansh 11', classId: 'C1', section: 'A' },
                    { id: 1011, name: 'Pihu 12', classId: 'C1', section: 'A' },
                    { id: 1012, name: 'Ayaan 13', classId: 'C1', section: 'A' },
                    { id: 1013, name: 'Myra 14', classId: 'C1', section: 'A' },
                    { id: 1014, name: 'Vivaan 15', classId: 'C1', section: 'A' }
                ];

                // Clear existing students and insert the real ones
                await studentsCollection.deleteMany({});
                const result = await studentsCollection.insertMany(students);

                await client.close();

                res.json({
                    success: true,
                    action: 'students-added',
                    message: `Successfully restored ${result.insertedCount} real students to database`,
                    students: students.map(s => ({ id: s.id, name: s.name, classId: s.classId })),
                    timestamp: new Date().toISOString()
                });
                
            } else if (action === 'add-teachers') {
                console.log('Adding teachers to database...');
                
                const teachersCollection = db.collection('teachers');

                // Your real teacher data
                const teachers = [
                    {
                        id: 'T1',
                        name: 'Dr. Smith',
                        subjects: ['MATH', 'PHY'],
                        primarySubject: 'MATH',
                        availability: 'Mon:08:00-15:00,Tue:08:00-15:00,Wed:08:00-15:00,Thu:08:00-15:00,Fri:08:00-15:00',
                        maxDailyHours: 6,
                        rating: 4.8
                    },
                    {
                        id: 'T2',
                        name: 'Prof. Johnson',
                        subjects: ['CHEM', 'BIO'],
                        primarySubject: 'CHEM',
                        availability: 'Mon:08:00-15:00,Tue:08:00-15:00,Wed:08:00-15:00,Thu:08:00-15:00,Fri:08:00-15:00',
                        maxDailyHours: 6,
                        rating: 4.6
                    },
                    {
                        id: 'T3',
                        name: 'Ms. Davis',
                        subjects: ['ENG', 'HIST'],
                        primarySubject: 'ENG',
                        availability: 'Mon:08:00-15:00,Tue:08:00-15:00,Wed:08:00-15:00,Thu:08:00-15:00,Fri:08:00-15:00',
                        maxDailyHours: 5,
                        rating: 4.9
                    },
                    {
                        id: 'T4',
                        name: 'Mr. Wilson',
                        subjects: ['MATH', 'CS'],
                        primarySubject: 'CS',
                        availability: 'Mon:08:00-15:00,Tue:08:00-15:00,Wed:08:00-15:00,Thu:08:00-15:00,Fri:08:00-15:00',
                        maxDailyHours: 7,
                        rating: 4.7
                    },
                    {
                        id: 'T5',
                        name: 'Dr. Brown',
                        subjects: ['PHY', 'CHEM'],
                        primarySubject: 'PHY',
                        availability: 'Mon:08:00-15:00,Tue:08:00-15:00,Wed:08:00-15:00,Thu:08:00-15:00,Fri:08:00-15:00',
                        maxDailyHours: 6,
                        rating: 4.5
                    }
                ];

                // Clear only existing teachers and insert new ones (don't clear students!)
                await teachersCollection.deleteMany({});
                const result = await teachersCollection.insertMany(teachers);

                await client.close();

                res.json({
                    success: true,
                    action: 'teachers-added',
                    message: `Successfully added ${result.insertedCount} teachers to database`,
                    teachers: teachers.map(t => ({ id: t.id, name: t.name, subjects: t.subjects })),
                    timestamp: new Date().toISOString()
                });
                
            } else {
                // Default behavior: clear database
                console.log('Clear Database: Connecting to MongoDB...');
                
                // Clear all collections
                const collections = ['students', 'teachers', 'classes', 'subjects'];
                const results = {};
                
                for (const collName of collections) {
                    try {
                        const collection = db.collection(collName);
                        const deleteResult = await collection.deleteMany({});
                        results[collName] = {
                            deleted: deleteResult.deletedCount,
                            success: true
                        };
                        console.log(`Cleared ${collName}: ${deleteResult.deletedCount} documents deleted`);
                    } catch (err) {
                        results[collName] = {
                            error: err.message,
                            success: false
                        };
                    }
                }
                
                await client.close();
                
                res.json({
                    success: true,
                    message: 'Database cleared! Now you can add your REAL data.',
                    cleared: results,
                    nextStep: 'Add your real student and teacher data to the database, then test the APIs again',
                    timestamp: new Date().toISOString()
                });
            }
            
        } catch (error) {
            console.error('Clear Database Error:', error);
            res.status(500).json({
                error: error.message,
                message: 'Failed to clear database'
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed - use POST' });
    }
};