const mongoose = require('mongoose');

// Schema definitions inline
const StudentSchema = new mongoose.Schema({
    id: { type: String, index: true, unique: true },
    name: String,
    classId: String,
    interests: [String],
    skillLevel: { type: Number, default: 3 },
    goals: String
});

const TeacherSchema = new mongoose.Schema({
    id: { type: String, index: true, unique: true },
    name: String,
    subjects: [String],
    primarySubjects: [String],
    availability: [],
    maxDailyHours: { type: Number, default: 0 },
    rating: { type: Number, default: 0 }
});

const ClassSchema = new mongoose.Schema({
    id: { type: String, index: true, unique: true },
    name: String,
    room: String,
    subjects: [String],
    totalCredits: { type: Number, default: 0 }
});

const SubjectSchema = new mongoose.Schema({
    id: { type: String, index: true, unique: true },
    name: String,
    credits: { type: Number, default: 1 },
    weeklySessions: { type: Number, default: 1 }
});

// Connection function
let isConnected = false;
async function connectDB() {
    if (isConnected) return;
    
    const uri = 'mongodb+srv://satakratu:satakratu567@cluster0.vs3qc.mongodb.net/sih_timetable';
    await mongoose.connect(uri, { 
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000
    });
    isConnected = true;
    console.log('Connected to MongoDB Atlas');
}

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method === 'GET') {
        try {
            console.log('Students API: Starting...');
            
            // Connect to database
            await connectDB();
            console.log('Students API: Database connected');
            
            // Get or create models (safe for serverless)
            const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
            const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);
            const Class = mongoose.models.Class || mongoose.model('Class', ClassSchema);
            const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
            
            console.log('Students API: Models ready');
            
            // Check if we have data
            let studentCount = await Student.countDocuments();
            console.log('Students API: Current student count:', studentCount);
            
            // If no data, seed it
            if (studentCount === 0) {
                console.log('Students API: Seeding database...');
                
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
                
                // Insert data
                await Student.insertMany(studentsData);
                await Teacher.insertMany(teachersData);
                await Class.insertMany(classesData);
                await Subject.insertMany(subjectsData);
                
                console.log('Students API: Database seeded successfully');
                studentCount = studentsData.length;
            }
            
            // Fetch students
            const students = await Student.find({}).sort({ id: 1 });
            console.log('Students API: Fetched', students.length, 'students');
            
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
                source: 'mongodb-direct',
                count: formattedStudents.length,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Students API Error:', error);
            res.status(500).json({
                error: error.message,
                source: 'error',
                stack: error.stack
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};