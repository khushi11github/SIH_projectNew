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
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method === 'POST') {
        try {
            console.log('Adding teachers to database...');
            
            // Connect to MongoDB
            const { db } = await connectToDatabase();
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

            // Clear existing teachers and insert new ones
            await teachersCollection.deleteMany({});
            const result = await teachersCollection.insertMany(teachers);

            res.json({
                success: true,
                action: 'teachers-added',
                message: `Successfully added ${result.insertedCount} teachers to database`,
                teachers: teachers.map(t => ({ id: t.id, name: t.name, subjects: t.subjects }))
            });
            
        } catch (error) {
            console.error('Error adding teachers:', error);
            res.status(500).json({
                error: 'Failed to add teachers to database',
                details: error.message
            });
        }
    } else if (req.method === 'GET') {
        try {
            console.log('Database Debug: Connecting to MongoDB...');
            
            // Connect to MongoDB
            const { db } = await connectToDatabase();
            console.log('Database Debug: Connected successfully');
            
            // List all collections
            const collections = await db.listCollections().toArray();
            console.log('Collections found:', collections.map(c => c.name));
            
            // Check each collection with more detailed data
            const results = {};
            
            for (const collectionName of ['students', 'teachers', 'classes', 'subjects']) {
                try {
                    const coll = db.collection(collectionName);
                    const count = await coll.countDocuments();
                    const allData = await coll.find({}).toArray();
                    
                    results[collectionName] = {
                        exists: true,
                        count: count,
                        allRecords: allData.map((record, index) => ({
                            index: index + 1,
                            id: record.id || record._id,
                            name: record.name,
                            data: record
                        }))
                    };
                } catch (err) {
                    results[collectionName] = {
                        exists: false,
                        error: err.message
                    };
                }
            }
            
            res.json({
                success: true,
                database: DB_NAME,
                collections: collections.map(c => c.name),
                collectionDetails: results,
                message: 'Complete database contents - this shows ALL your real data',
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Database Debug Error:', error);
            res.status(500).json({
                error: error.message,
                message: 'Failed to connect to database for debugging'
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};