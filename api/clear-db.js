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
            console.log('Clear Database: Connecting to MongoDB...');
            
            const client = new MongoClient(MONGODB_URI);
            await client.connect();
            const db = client.db(DB_NAME);
            
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