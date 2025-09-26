// Simplified students API without database - just returns hardcoded data to test deployment
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
            // Your exact student data - hardcoded for now
            const students = [
                { id: "1000", name: "Aarav 1", classId: "C1", goals: "Improve weekly and participate actively", interests: ["Math"], skillLevel: 2 },
                { id: "1001", name: "Isha 2", classId: "C1", goals: "Improve weekly and participate actively", interests: ["Science"], skillLevel: 3 },
                { id: "1002", name: "Vihaan 3", classId: "C1", goals: "Improve weekly and participate actively", interests: ["English"], skillLevel: 4 },
                { id: "1003", name: "Anaya 4", classId: "C1", goals: "Improve weekly and participate actively", interests: ["History"], skillLevel: 5 },
                { id: "1004", name: "Advait 5", classId: "C1", goals: "Improve weekly and participate actively", interests: ["Physics"], skillLevel: 2 },
                { id: "1005", name: "Diya 1", classId: "C2", goals: "Improve weekly and participate actively", interests: ["Chemistry"], skillLevel: 3 },
                { id: "1006", name: "Arjun 2", classId: "C2", goals: "Improve weekly and participate actively", interests: ["Biology"], skillLevel: 4 },
                { id: "1007", name: "Sara 3", classId: "C2", goals: "Improve weekly and participate actively", interests: ["Computer Science"], skillLevel: 5 },
                { id: "1008", name: "Kabir 4", classId: "C2", goals: "Improve weekly and participate actively", interests: ["Math"], skillLevel: 2 },
                { id: "1009", name: "Meera 5", classId: "C2", goals: "Improve weekly and participate actively", interests: ["Science"], skillLevel: 3 },
                { id: "1010", name: "Aarav 1", classId: "C3", goals: "Improve weekly and participate actively", interests: ["English"], skillLevel: 4 },
                { id: "1011", name: "Isha 2", classId: "C3", goals: "Improve weekly and participate actively", interests: ["History"], skillLevel: 5 },
                { id: "1012", name: "Vihaan 3", classId: "C3", goals: "Improve weekly and participate actively", interests: ["Physics"], skillLevel: 2 },
                { id: "1013", name: "Anaya 4", classId: "C3", goals: "Improve weekly and participate actively", interests: ["Chemistry"], skillLevel: 3 },
                { id: "1014", name: "Advait 5", classId: "C3", goals: "Improve weekly and participate actively", interests: ["Biology"], skillLevel: 4 }
            ];
            
            console.log('Students API: Returning hardcoded data, count:', students.length);
            
            res.json({
                students,
                source: 'hardcoded-temporary',
                count: students.length,
                message: 'This is temporary hardcoded data to verify API deployment works',
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Students API Error:', error);
            res.status(500).json({
                error: error.message,
                source: 'error'
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};