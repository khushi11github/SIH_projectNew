// Direct seeding fallback function
async function directSeedDatabase() {
    try {
        const { connectToMongo } = require('../../src/db.cjs');
        const { Student, Teacher, ClassModel, Subject } = require('../../src/models.cjs');
        
        await connectToMongo(process.env.MONGO_URI);
        
        // Check if data already exists
        const studentCount = await Student.countDocuments();
        if (studentCount > 0) {
            return { success: true, message: 'Data already exists', counts: { students: studentCount } };
        }
        
        // Your exact database structure
        const studentsData = [
            { id: "1000", name: "Aarav 1", classId: "C1", goals: "Improve weekly and participate actively", interests: ["Math"], skillLevel: 2 },
            { id: "1001", name: "Isha 2", classId: "C1", goals: "Improve weekly and participate actively", interests: ["Science"], skillLevel: 3 },
            { id: "1002", name: "Vihaan 3", classId: "C1", goals: "Improve weekly and participate actively", interests: ["English"], skillLevel: 4 },
            { id: "1003", name: "Anaya 4", classId: "C1", goals: "Improve weekly and participate actively", interests: ["History"], skillLevel: 5 },
            { id: "1004", name: "Advait 5", classId: "C1", goals: "Improve weekly and participate actively", interests: ["Physics"], skillLevel: 2 },
            { id: "1005", name: "Diya 1", classId: "C2", goals: "Improve weekly and participate actively", interests: ["Chemistry"], skillLevel: 3 },
            { id: "1006", name: "Arjun 2", classId: "C2", goals: "Improve weekly and participate actively", interests: ["Biology"], skillLevel: 4 },
            { id: "1007", name: "Sara 3", classId: "C2", goals: "Improve weekly and participate actively", interests: ["Computer Science"], skillLevel: 5 },
            { id: "1008", name: "Kabir 4", classId: "C2", goals: "Improve weekly and participate actively", interests: ["Math"], skillLevel: 2 },
            { id: "1009", name: "Meera 5", classId: "C2", goals: "Improve weekly and participate actively", interests: ["Science"], skillLevel: 3 },
            { id: "1010", name: "Aarav 1", classId: "C3", goals: "Improve weekly and participate actively", interests: ["English"], skillLevel: 4 },
            { id: "1011", name: "Isha 2", classId: "C3", goals: "Improve weekly and participate actively", interests: ["History"], skillLevel: 5 },
            { id: "1012", name: "Vihaan 3", classId: "C3", goals: "Improve weekly and participate actively", interests: ["Physics"], skillLevel: 2 },
            { id: "1013", name: "Anaya 4", classId: "C3", goals: "Improve weekly and participate actively", interests: ["Chemistry"], skillLevel: 3 },
            { id: "1014", name: "Advait 5", classId: "C3", goals: "Improve weekly and participate actively", interests: ["Biology"], skillLevel: 4 }
        ];
        
        const teachersData = [
            { id: "T1", name: "Dr. Smith", primarySubjects: ["MATH"], subjects: ["MATH", "PHY"], availability: [], maxDailyHours: 6, rating: 4.8 },
            { id: "T2", name: "Prof. Johnson", primarySubjects: ["PHY"], subjects: ["PHY", "CHEM"], availability: [], maxDailyHours: 6, rating: 4.6 },
            { id: "T3", name: "Ms. Davis", primarySubjects: ["ENG"], subjects: ["ENG", "HIST"], availability: [], maxDailyHours: 5, rating: 4.9 },
            { id: "T4", name: "Mr. Wilson", primarySubjects: ["CS"], subjects: ["CS", "MATH"], availability: [], maxDailyHours: 7, rating: 4.7 },
            { id: "T5", name: "Dr. Brown", primarySubjects: ["BIO"], subjects: ["BIO", "CHEM"], availability: [], maxDailyHours: 6, rating: 4.5 }
        ];
        
        const classesData = [
            { id: "C1", name: "Class1", room: "R101", subjects: ["MATH", "PHY", "CHEM", "ENG"], totalCredits: 25 },
            { id: "C2", name: "Class2", room: "R102", subjects: ["MATH", "PHY", "CHEM", "ENG"], totalCredits: 28 },
            { id: "C3", name: "Class3", room: "R103", subjects: ["MATH", "PHY", "CHEM", "ENG"], totalCredits: 30 }
        ];
        
        const subjectsData = [
            { id: "MATH", name: "Mathematics", credits: 8, weeklySessions: 1 },
            { id: "PHY", name: "Physics", credits: 6, weeklySessions: 1 },
            { id: "CHEM", name: "Chemistry", credits: 6, weeklySessions: 1 },
            { id: "BIO", name: "Biology", credits: 5, weeklySessions: 1 },
            { id: "ENG", name: "English", credits: 5, weeklySessions: 1 },
            { id: "HIST", name: "History", credits: 4, weeklySessions: 1 },
            { id: "CS", name: "Computer Sci", credits: 7, weeklySessions: 1 }
        ];
        
        // Clear and insert data
        await Promise.all([
            Student.deleteMany({}),
            Teacher.deleteMany({}),
            ClassModel.deleteMany({}),
            Subject.deleteMany({})
        ]);
        
        await Promise.all([
            Student.insertMany(studentsData),
            Teacher.insertMany(teachersData),
            ClassModel.insertMany(classesData),
            Subject.insertMany(subjectsData)
        ]);
        
        const counts = {
            students: studentsData.length,
            teachers: teachersData.length,
            classes: classesData.length,
            subjects: subjectsData.length
        };
        
        console.log('Direct seeding completed:', counts);
        return { success: true, message: 'Database seeded directly', counts };
        
    } catch (error) {
        console.error('Direct seeding failed:', error.message);
        return { success: false, error: error.message };
    }
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

    if (req.method === 'GET') {
        try {
            // First ensure database has data
            console.log('Students API: Ensuring database data exists...');
            
            let dataCheck;
            try {
                const { ensureDataExists } = require('../../database-seed.js');
                dataCheck = await ensureDataExists();
            } catch (seedError) {
                console.error('Students API: Seeding system error:', seedError.message);
                // Try direct seeding as fallback
                dataCheck = await directSeedDatabase();
            }
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