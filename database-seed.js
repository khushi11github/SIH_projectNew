// Database seeding and initialization system
const { connectToMongo } = require('./src/db.cjs');
const { Student, Teacher, ClassModel, Subject } = require('./src/models.cjs');

// Your exact database data structure
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
    { id: "C3", name: "Class3", room: "R103", subjects: ["MATH", "PHY", "CHEM", "ENG"], totalCredits: 30 },
    { id: "C10", name: "Class10", room: "R101", subjects: ["MATH", "PHY", "CHEM", "BIO"], totalCredits: 0 },
    { id: "C11", name: "Class11", room: "R102", subjects: ["MATH", "PHY", "CHEM", "BIO"], totalCredits: 0 },
    { id: "C12", name: "Class12", room: "R103", subjects: ["MATH", "PHY", "CHEM", "BIO"], totalCredits: 0 }
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

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        await connectToMongo(process.env.MONGO_URI);
        
        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            Student.deleteMany({}),
            Teacher.deleteMany({}),
            ClassModel.deleteMany({}),
            Subject.deleteMany({})
        ]);
        
        // Seed new data
        console.log('📝 Inserting students...');
        await Student.insertMany(STUDENTS_DATA);
        
        console.log('👨‍🏫 Inserting teachers...');
        await Teacher.insertMany(TEACHERS_DATA);
        
        console.log('🏫 Inserting classes...');
        await ClassModel.insertMany(CLASSES_DATA);
        
        console.log('📚 Inserting subjects...');
        await Subject.insertMany(SUBJECTS_DATA);
        
        // Verify counts
        const counts = {
            students: await Student.countDocuments(),
            teachers: await Teacher.countDocuments(),
            classes: await ClassModel.countDocuments(),
            subjects: await Subject.countDocuments()
        };
        
        console.log('✅ Database seeding completed!');
        console.log('📊 Final counts:', counts);
        
        return {
            success: true,
            message: 'Database seeded successfully',
            counts
        };
        
    } catch (error) {
        console.error('❌ Database seeding failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

async function ensureDataExists() {
    try {
        await connectToMongo(process.env.MONGO_URI);
        
        const counts = {
            students: await Student.countDocuments(),
            teachers: await Teacher.countDocuments(),
            classes: await ClassModel.countDocuments(),
            subjects: await Subject.countDocuments()
        };
        
        console.log('📊 Current database counts:', counts);
        
        // If any collection is empty, seed the database
        if (counts.students === 0 || counts.teachers === 0 || counts.classes === 0 || counts.subjects === 0) {
            console.log('🚨 Missing data detected, running database seed...');
            return await seedDatabase();
        }
        
        return {
            success: true,
            message: 'Database data exists',
            counts
        };
        
    } catch (error) {
        console.error('❌ Database check failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = { seedDatabase, ensureDataExists, STUDENTS_DATA, TEACHERS_DATA, CLASSES_DATA, SUBJECTS_DATA };