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
            // Dynamic import to avoid module loading issues
            const { connectToMongo } = require('../../src/db.cjs');
            const { Student } = require('../../src/models.cjs');
            
            await connectToMongo(process.env.MONGO_URI);
            const students = await Student.find({}).sort({ id: 1 });
            res.json({ students });
        } catch (error) {
            console.error('Error fetching students:', error.message);
            // Return mock data if database fails
            const mockStudents = [
                { id: '1000', name: 'Alice Johnson', classId: '10A' },
                { id: '1001', name: 'Bob Smith', classId: '10A' },
                { id: '1002', name: 'Carol Davis', classId: '10B' }
            ];
            res.json({ students: mockStudents, note: 'Using mock data due to DB error: ' + error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}