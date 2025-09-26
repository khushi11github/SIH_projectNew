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

                // Your real student data with complete details
                const students = [
                    { id: 1000, name: 'Aarav 1', classId: 'C1', interests: 'Reading', skillLevel: 2, goals: 'Improve weekly and participate actively' },
                    { id: 1001, name: 'Isha 2', classId: 'C1', interests: 'Clubs', skillLevel: 3, goals: 'Improve weekly and participate actively' },
                    { id: 1002, name: 'Vihaan 3', classId: 'C1', interests: 'Sports', skillLevel: 4, goals: 'Improve weekly and participate actively' },
                    { id: 1003, name: 'Anaya 4', classId: 'C1', interests: 'Library', skillLevel: 5, goals: 'Improve weekly and participate actively' },
                    { id: 1004, name: 'Advait 5', classId: 'C1', interests: 'Mentorship', skillLevel: 2, goals: 'Improve weekly and participate actively' },
                    { id: 1005, name: 'Diya 1', classId: 'C2', interests: 'Clubs', skillLevel: 3, goals: 'Improve weekly and participate actively' },
                    { id: 1006, name: 'Arjun 2', classId: 'C2', interests: 'Sports', skillLevel: 4, goals: 'Improve weekly and participate actively' },
                    { id: 1007, name: 'Sara 3', classId: 'C2', interests: 'Library', skillLevel: 5, goals: 'Improve weekly and participate actively' },
                    { id: 1008, name: 'Kabir 4', classId: 'C2', interests: 'Mentorship', skillLevel: 2, goals: 'Improve weekly and participate actively' },
                    { id: 1009, name: 'Meera 5', classId: 'C2', interests: 'Reading', skillLevel: 3, goals: 'Improve weekly and participate actively' },
                    { id: 1010, name: 'Aarav 1', classId: 'C3', interests: 'Sports', skillLevel: 4, goals: 'Improve weekly and participate actively' },
                    { id: 1011, name: 'Isha 2', classId: 'C3', interests: 'Library', skillLevel: 5, goals: 'Improve weekly and participate actively' },
                    { id: 1012, name: 'Vihaan 3', classId: 'C3', interests: 'Mentorship', skillLevel: 2, goals: 'Improve weekly and participate actively' },
                    { id: 1013, name: 'Anaya 4', classId: 'C3', interests: 'Reading', skillLevel: 3, goals: 'Improve weekly and participate actively' },
                    { id: 1014, name: 'Advait 5', classId: 'C3', interests: 'Clubs', skillLevel: 4, goals: 'Improve weekly and participate actively' }
                ];

                // Clear existing students and insert the real ones
                await studentsCollection.deleteMany({});
                const result = await studentsCollection.insertMany(students);

                await client.close();

                res.json({
                    success: true,
                    action: 'students-added',
                    message: `Successfully restored ${result.insertedCount} real students to database`,
                    students: students.map(s => ({ 
                        id: s.id, 
                        name: s.name, 
                        classId: s.classId, 
                        interests: s.interests, 
                        skillLevel: s.skillLevel, 
                        goals: s.goals 
                    })),
                    timestamp: new Date().toISOString()
                });
                
            } else if (action === 'add-subjects') {
                console.log('Adding subjects to database...');
                
                const subjectsCollection = db.collection('subjects');

                // Your real subjects data
                const subjects = [
                    { id: 'MATH', name: 'Mathematics', credits: 8, weeklySessions: 1 },
                    { id: 'PHY', name: 'Physics', credits: 6, weeklySessions: 1 },
                    { id: 'CHEM', name: 'Chemistry', credits: 6, weeklySessions: 1 },
                    { id: 'BIO', name: 'Biology', credits: 5, weeklySessions: 1 },
                    { id: 'ENG', name: 'English', credits: 5, weeklySessions: 1 },
                    { id: 'HIST', name: 'History', credits: 4, weeklySessions: 1 },
                    { id: 'CS', name: 'Computer Sci', credits: 7, weeklySessions: 1 }
                ];

                // Clear existing subjects and insert new ones
                await subjectsCollection.deleteMany({});
                const result = await subjectsCollection.insertMany(subjects);

                await client.close();

                res.json({
                    success: true,
                    action: 'subjects-added',
                    message: `Successfully added ${result.insertedCount} subjects to database`,
                    subjects: subjects.map(s => ({ id: s.id, name: s.name, credits: s.credits })),
                    timestamp: new Date().toISOString()
                });

            } else if (action === 'add-classes') {
                console.log('Adding classes to database...');
                
                const classesCollection = db.collection('classes');

                // Your real classes data
                const classes = [
                    { id: 'C1', name: 'Class 1', room: 'R101', subjects: ['MATH', 'PHY', 'CHEM', 'ENG', 'HIST'], totalCredits: 28 },
                    { id: 'C2', name: 'Class 2', room: 'R102', subjects: ['MATH', 'PHY', 'CHEM', 'BIO', 'ENG'], totalCredits: 30 },
                    { id: 'C3', name: 'Class 3', room: 'R103', subjects: ['MATH', 'CS', 'PHY', 'ENG', 'HIST'], totalCredits: 29 }
                ];

                // Clear existing classes and insert new ones
                await classesCollection.deleteMany({});
                const result = await classesCollection.insertMany(classes);

                await client.close();

                res.json({
                    success: true,
                    action: 'classes-added',
                    message: `Successfully added ${result.insertedCount} classes to database`,
                    classes: classes.map(c => ({ id: c.id, name: c.name, subjects: c.subjects })),
                    timestamp: new Date().toISOString()
                });

            } else if (action === 'add-config') {
                console.log('Adding config to database...');
                
                const configCollection = db.collection('config');

                // Your timetable configuration
                const config = [
                    { key: 'days', value: 'Mon,Tue,Wed,Thu,Fri' },
                    { key: 'startTime', value: '08:00' },
                    { key: 'endTime', value: '15:00' },
                    { key: 'periodDuration', value: 1 },
                    { key: 'specialPeriods', value: '' },
                    { key: 'fillAllPeriods', value: true },
                    { key: 'activitiesList', value: 'Reading,Clubs,Sports,Library,Mentorship' },
                    { key: 'activityStrategy', value: 'balanced' }
                ];

                // Clear existing config and insert new ones
                await configCollection.deleteMany({});
                const result = await configCollection.insertMany(config);

                await client.close();

                res.json({
                    success: true,
                    action: 'config-added',
                    message: `Successfully added ${result.insertedCount} config settings to database`,
                    config: config.map(c => ({ key: c.key, value: c.value })),
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