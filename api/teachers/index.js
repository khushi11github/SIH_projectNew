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
            console.log('Teachers API: Connecting to MongoDB...');
            
            // Connect to MongoDB
            const { db } = await connectToDatabase();
            console.log('Teachers API: Connected to MongoDB successfully');
            
            // Fetch real teachers from database
            const teachersCollection = db.collection('teachers');
            const teachers = await teachersCollection.find({}).sort({ id: 1 }).toArray();
            
            console.log(`Teachers API: Found ${teachers.length} real teachers from database`);
            
            // Format teachers for frontend
            const formattedTeachers = teachers.map(teacher => ({
                id: teacher.id,
                name: teacher.name,
                subjects: teacher.subjects,
                primarySubjects: teacher.primarySubjects,
                availability: teacher.availability,
                maxDailyHours: teacher.maxDailyHours,
                rating: teacher.rating
            }));
            
            res.json({
                teachers: formattedTeachers,
                source: 'mongodb-real-database',
                count: formattedTeachers.length,
                message: `Real teachers from MongoDB: ${formattedTeachers.map(t => t.name).join(', ')}`,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Teachers API MongoDB Error:', error);
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