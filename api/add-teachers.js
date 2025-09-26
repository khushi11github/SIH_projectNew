import { MongoClient } from 'mongodb';

let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }

    const uri = 'mongodb+srv://satakratu:satakratu567@cluster0.vs3qc.mongodb.net/';
    cachedClient = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    });

    await cachedClient.connect();
    return cachedClient;
}

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const client = await connectToDatabase();
        const db = client.db('sih_timetable');
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

        res.status(200).json({
            success: true,
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
}