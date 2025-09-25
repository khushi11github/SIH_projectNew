const { connectToMongo } = require('../../src/db');
const TimetableGenerator = require('../../src/timetable.js');

// Keep a singleton generator in memory for activity plans and progress
let tgInstance = null;
async function getGenerator() {
    if (!tgInstance) {
        await connectToMongo(process.env.MONGO_URI);
        tgInstance = new TimetableGenerator();
        const loaded = await tgInstance.loadDataFromMongo();
        if (!loaded || !tgInstance.validateData()) {
            tgInstance = null;
            throw new Error('Invalid data');
        }
        tgInstance.initializeGenerator();
        const ok = tgInstance.generateTimetable();
        if (!ok) {
            tgInstance = null;
            throw new Error('Unable to generate timetable with given constraints');
        }
        await tgInstance.fillFreeSlotsWithActivities();
    }
    return tgInstance;
}

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            tgInstance = null; // Force regeneration
            const tg = await getGenerator();
            res.json({ ok: true, message: 'Timetables regenerated' });
        } catch (error) {
            console.error('Error generating timetables:', error.message);
            res.status(500).json({ ok: false, error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}