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
            const { connectToMongo } = require('../../src/db.cjs');
            const { Teacher } = require('../../src/models.cjs');
            
            await connectToMongo(process.env.MONGO_URI);
            const teachers = await Teacher.find({}).sort({ id: 1 });
            res.json({ teachers });
        } catch (error) {
            console.error('Error fetching teachers:', error.message);
            // Return mock data if database fails
            const mockTeachers = [
                { id: 'T001', name: 'Mr. Smith', subjects: ['Math'], availability: [] },
                { id: 'T002', name: 'Ms. Johnson', subjects: ['Physics'], availability: [] },
                { id: 'T003', name: 'Ms. Davis', subjects: ['English'], availability: [] }
            ];
            res.json({ teachers: mockTeachers, note: 'Using mock data due to DB error: ' + error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}