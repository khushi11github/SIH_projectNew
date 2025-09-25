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
            
            // Transform to match expected format
            const formattedStudents = students.map(student => ({
                id: student.id,
                name: student.name,
                classId: student.classId,
                goals: student.goals,
                interests: student.interests,
                skillLevel: student.skillLevel
            }));
            
            res.json({ students: formattedStudents });
        } catch (error) {
            console.error('Error fetching students:', error.message);
            // Return actual student IDs from your database structure
            const mockStudents = [
                { id: '1000', name: 'Aarav 1', classId: 'C1' },
                { id: '1001', name: 'Isha 2', classId: 'C1' },
                { id: '1002', name: 'Vihaan 3', classId: 'C1' },
                { id: '1003', name: 'Anaya 4', classId: 'C1' },
                { id: '1004', name: 'Advait 5', classId: 'C1' },
                { id: '1005', name: 'Diya 1', classId: 'C2' },
                { id: '1006', name: 'Arjun 2', classId: 'C2' },
                { id: '1007', name: 'Sara 3', classId: 'C2' },
                { id: '1008', name: 'Kabir 4', classId: 'C2' },
                { id: '1009', name: 'Meera 5', classId: 'C2' },
                { id: '1010', name: 'Aarav 1', classId: 'C3' },
                { id: '1011', name: 'Isha 2', classId: 'C3' },
                { id: '1012', name: 'Vihaan 3', classId: 'C3' },
                { id: '1013', name: 'Anaya 4', classId: 'C3' },
                { id: '1014', name: 'Advait 5', classId: 'C3' }
            ];
            res.json({ students: mockStudents, note: 'Using fallback data due to DB error: ' + error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}