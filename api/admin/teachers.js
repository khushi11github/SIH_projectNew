const { connectToMongo } = require('../../src/db');
const { Teacher } = require('../../src/models');

let tgInstance = null; // Reset generator when data changes

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            await connectToMongo(process.env.MONGO_URI);
            const {
                id, name, subjects, primarySubjects,
                availability, maxDailyHours, rating
            } = req.body;

            const subjectsList = subjects ? subjects.split(',').map(s => s.trim()) : [];
            const primarySubjectsList = primarySubjects ? primarySubjects.split(',').map(s => s.trim()) : [];

            const teacher = await Teacher.findOneAndUpdate(
                { id },
                {
                    id, name, subjects: subjectsList, primarySubjects: primarySubjectsList,
                    availability, maxDailyHours: Number(maxDailyHours) || 0,
                    rating: Number(rating) || 0
                },
                { upsert: true, new: true }
            );

            tgInstance = null; // Reset generator to pick up changes
            res.json({ ok: true, teacher });
        } catch (error) {
            console.error('Error saving teacher:', error.message);
            res.status(500).json({ ok: false, error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}