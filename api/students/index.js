import { connectToMongo } from '../../src/db.js';
import { Student } from '../../src/models.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            await connectToMongo(process.env.MONGO_URI);
            const students = await Student.find({}).sort({ id: 1 });
            res.json({ students });
        } catch (error) {
            console.error('Error fetching students:', error.message);
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}