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

    if (req.method === 'POST') {
        try {
            const { connectToMongo } = require('../../src/db.cjs');
            const { Teacher, ClassModel, Subject, Student } = require('../../src/models.cjs');
            
            await connectToMongo(process.env.MONGO_URI);

            // Use your exact database structure
            const { STUDENTS_DATA, TEACHERS_DATA, CLASSES_DATA, SUBJECTS_DATA } = require('../../database-seed.js');
            
            console.log('🌱 Seeding database with your exact data structure...');
            console.log('📊 Data counts:', {
                students: STUDENTS_DATA.length,
                teachers: TEACHERS_DATA.length,
                classes: CLASSES_DATA.length,
                subjects: SUBJECTS_DATA.length
            });

            // Clear existing data
            await Teacher.deleteMany({});
            await ClassModel.deleteMany({});
            await Subject.deleteMany({});
            await Student.deleteMany({});

            // Insert new data using your exact database structure
            await Teacher.insertMany(TEACHERS_DATA);
            await ClassModel.insertMany(CLASSES_DATA);
            await Subject.insertMany(SUBJECTS_DATA);
            await Student.insertMany(STUDENTS_DATA);

            res.json({ 
                success: true, 
                message: 'Database seeded successfully with your exact data structure',
                counts: {
                    students: STUDENTS_DATA.length,
                    teachers: TEACHERS_DATA.length,
                    classes: CLASSES_DATA.length,
                    subjects: SUBJECTS_DATA.length
                },
                note: 'Now using real database data - no more dummy/fallback data!'
            });

        } catch (error) {
            console.error('Error seeding database:', error.message);
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed - use POST' });
    }
};