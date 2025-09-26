const { MongoClient } = require('mongodb');

// Your MongoDB connection details
const MONGODB_URI = 'mongodb+srv://satakratu:satakratu567@cluster0.vs3qc.mongodb.net/';
const DB_NAME = 'sih_timetable';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
}

// Your exact student data for seeding
const STUDENTS_DATA = [
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

const TEACHERS_DATA = [
    { id: "T1", name: "Dr. Smith", primarySubjects: ["MATH"], subjects: ["MATH", "PHY"], availability: [], maxDailyHours: 6, rating: 4.8 },
    { id: "T2", name: "Prof. Johnson", primarySubjects: ["PHY"], subjects: ["PHY", "CHEM"], availability: [], maxDailyHours: 6, rating: 4.6 },
    { id: "T3", name: "Ms. Davis", primarySubjects: ["ENG"], subjects: ["ENG", "HIST"], availability: [], maxDailyHours: 5, rating: 4.9 },
    { id: "T4", name: "Mr. Wilson", primarySubjects: ["CS"], subjects: ["CS", "MATH"], availability: [], maxDailyHours: 7, rating: 4.7 },
    { id: "T5", name: "Dr. Brown", primarySubjects: ["BIO"], subjects: ["BIO", "CHEM"], availability: [], maxDailyHours: 6, rating: 4.5 }
];

const CLASSES_DATA = [
    { id: "C1", name: "Class1", room: "R101", subjects: ["MATH", "PHY", "CHEM", "ENG"], totalCredits: 25 },
    { id: "C2", name: "Class2", room: "R102", subjects: ["MATH", "PHY", "CHEM", "ENG"], totalCredits: 28 },
    { id: "C3", name: "Class3", room: "R103", subjects: ["MATH", "PHY", "CHEM", "ENG"], totalCredits: 30 }
];

const SUBJECTS_DATA = [
    { id: "MATH", name: "Mathematics", credits: 8, weeklySessions: 1 },
    { id: "PHY", name: "Physics", credits: 6, weeklySessions: 1 },
    { id: "CHEM", name: "Chemistry", credits: 6, weeklySessions: 1 },
    { id: "BIO", name: "Biology", credits: 5, weeklySessions: 1 },
    { id: "ENG", name: "English", credits: 5, weeklySessions: 1 },
    { id: "HIST", name: "History", credits: 4, weeklySessions: 1 },
    { id: "CS", name: "Computer Sci", credits: 7, weeklySessions: 1 }
];

async function ensureDataExists(db) {
    const studentsCollection = db.collection('students');
    const teachersCollection = db.collection('teachers');
    const classesCollection = db.collection('classes');
    const subjectsCollection = db.collection('subjects');
    
    // Check if students exist
    const studentCount = await studentsCollection.countDocuments();
    
    if (studentCount === 0) {
        console.log('Seeding database with your real data...');
        
        // Insert all data
        await Promise.all([
            studentsCollection.insertMany(STUDENTS_DATA),
            teachersCollection.insertMany(TEACHERS_DATA),
            classesCollection.insertMany(CLASSES_DATA),
            subjectsCollection.insertMany(SUBJECTS_DATA)
        ]);
        
        console.log('Database seeded successfully!');
    }
    
    return studentCount;
}

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method === 'GET') {
        try {
            console.log('Students API: Connecting to MongoDB...');
            
            // Connect to MongoDB
            const { db } = await connectToDatabase();
            console.log('Students API: Connected to MongoDB successfully');
            
            // Ensure data exists
            await ensureDataExists(db);
            
            // Fetch real students from database
            const studentsCollection = db.collection('students');
            const students = await studentsCollection.find({}).sort({ id: 1 }).toArray();
            
            console.log(`Students API: Found ${students.length} real students from database`);
            
            // Format students for frontend
            const formattedStudents = students.map(student => ({
                id: student.id,
                name: student.name,
                classId: student.classId,
                goals: student.goals,
                interests: student.interests,
                skillLevel: student.skillLevel
            }));
            
            res.json({
                students: formattedStudents,
                source: 'mongodb-real-database',
                count: formattedStudents.length,
                message: `Real data from MongoDB: ${formattedStudents.length} students (${formattedStudents[0]?.id} to ${formattedStudents[formattedStudents.length-1]?.id})`,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Students API MongoDB Error:', error);
            res.status(500).json({
                error: error.message,
                source: 'mongodb-error',
                message: 'Failed to connect to real database'
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};