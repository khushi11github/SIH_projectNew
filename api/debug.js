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
            console.log('Database Debug: Connecting to MongoDB...');
            
            // Connect to MongoDB
            const { db } = await connectToDatabase();
            console.log('Database Debug: Connected successfully');
            
            // List all collections
            const collections = await db.listCollections().toArray();
            console.log('Collections found:', collections.map(c => c.name));
            
            // Check each collection
            const results = {};
            
            for (const collection of ['students', 'teachers', 'classes', 'subjects']) {
                try {
                    const coll = db.collection(collection);
                    const count = await coll.countDocuments();
                    const sample = await coll.find({}).limit(2).toArray();
                    
                    results[collection] = {
                        exists: true,
                        count: count,
                        sampleData: sample
                    };
                } catch (err) {
                    results[collection] = {
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
                message: 'This shows what is ACTUALLY in your MongoDB database',
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