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

    if (req.method === 'POST') {
        try {
            const { connectToMongo } = require('../../src/db.cjs');
            const { Teacher, ClassModel, Subject, Student } = require('../../src/models.cjs');
            
            await connectToMongo(process.env.MONGO_URI);

            // Sample data to seed the database
            const teachers = [
                { id: 'T001', name: 'Dr. Smith', subjects: ['Math', 'Physics'], primarySubjects: ['Math'], maxDailyHours: 6, rating: 4.5 },
                { id: 'T002', name: 'Ms. Johnson', subjects: ['English', 'Literature'], primarySubjects: ['English'], maxDailyHours: 5, rating: 4.2 },
                { id: 'T003', name: 'Mr. Wilson', subjects: ['Chemistry', 'Biology'], primarySubjects: ['Chemistry'], maxDailyHours: 6, rating: 4.7 },
                { id: 'T004', name: 'Ms. Davis', subjects: ['History', 'Geography'], primarySubjects: ['History'], maxDailyHours: 5, rating: 4.3 }
            ];

            const classes = [
                { id: '10A', name: 'Class 10A', room: 'Room 101', subjects: ['Math', 'English', 'Chemistry', 'History'], totalCredits: 20 },
                { id: '10B', name: 'Class 10B', room: 'Room 102', subjects: ['Math', 'English', 'Physics', 'Geography'], totalCredits: 20 },
                { id: '9A', name: 'Class 9A', room: 'Room 201', subjects: ['Math', 'English', 'Biology', 'History'], totalCredits: 18 }
            ];

            const subjects = [
                { id: 'MATH', name: 'Mathematics', credits: 4, weeklySessions: 5 },
                { id: 'ENG', name: 'English', credits: 3, weeklySessions: 4 },
                { id: 'CHEM', name: 'Chemistry', credits: 3, weeklySessions: 4 },
                { id: 'PHYS', name: 'Physics', credits: 3, weeklySessions: 4 },
                { id: 'HIST', name: 'History', credits: 2, weeklySessions: 3 },
                { id: 'GEO', name: 'Geography', credits: 2, weeklySessions: 3 },
                { id: 'BIO', name: 'Biology', credits: 3, weeklySessions: 4 }
            ];

            const students = [
                { id: '1000', name: 'Alice Johnson', classId: '10A', interests: ['Math', 'Science'], skillLevel: 4, goals: 'Engineering' },
                { id: '1001', name: 'Bob Smith', classId: '10A', interests: ['Literature', 'History'], skillLevel: 3, goals: 'Liberal Arts' },
                { id: '1002', name: 'Carol Davis', classId: '10B', interests: ['Chemistry', 'Biology'], skillLevel: 5, goals: 'Medicine' },
                { id: '1003', name: 'David Wilson', classId: '10B', interests: ['Physics', 'Math'], skillLevel: 4, goals: 'Physics Research' },
                { id: '1004', name: 'Eva Brown', classId: '9A', interests: ['English', 'Art'], skillLevel: 3, goals: 'Creative Writing' }
            ];

            // Clear existing data
            await Teacher.deleteMany({});
            await ClassModel.deleteMany({});
            await Subject.deleteMany({});
            await Student.deleteMany({});

            // Insert new data
            await Teacher.insertMany(teachers);
            await ClassModel.insertMany(classes);
            await Subject.insertMany(subjects);
            await Student.insertMany(students);

            res.json({ 
                success: true, 
                message: 'Database seeded successfully',
                counts: {
                    teachers: teachers.length,
                    classes: classes.length,
                    subjects: subjects.length,
                    students: students.length
                }
            });

        } catch (error) {
            console.error('Error seeding database:', error.message);
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed - use POST' });
    }
};