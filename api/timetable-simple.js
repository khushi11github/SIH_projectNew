module.exports = (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { studentId } = req.query;

    if (req.method === 'GET') {
        // Return mock timetable data
        const timetableData = {
            studentId,
            name: `Student ${studentId}`,
            classId: '10A',
            timetable: {
                Monday: [
                    { time: '09:00-10:00', subject: 'Math', teacher: 'Mr. Smith', type: 'regular' },
                    { time: '10:00-11:00', subject: 'Physics', teacher: 'Ms. Johnson', type: 'regular' },
                    { time: '11:00-12:00', subject: 'Reading Activity', teacher: 'AI Generated', type: 'activity' }
                ],
                Tuesday: [
                    { time: '09:00-10:00', subject: 'English', teacher: 'Ms. Davis', type: 'regular' },
                    { time: '10:00-11:00', subject: 'Chemistry', teacher: 'Mr. Wilson', type: 'regular' },
                    { time: '11:00-12:00', subject: 'Science Experiment', teacher: 'AI Generated', type: 'activity' }
                ]
            },
            activities: [
                { key: 'read_1', title: 'Reading Practice', status: 'pending' },
                { key: 'sci_1', title: 'Science Project', status: 'completed' }
            ]
        };
        
        res.json(timetableData);
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};