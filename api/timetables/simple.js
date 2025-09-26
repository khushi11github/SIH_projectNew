// Simple timetables API without complex imports
module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method === 'GET') {
        try {
            const { connectToMongo } = require('../../src/db.cjs');
            const { Student, Teacher, ClassModel, Subject } = require('../../src/models.cjs');
            
            // Connect to database
            await connectToMongo(process.env.MONGO_URI);
            
            // Get all data
            const students = await Student.find({});
            const teachers = await Teacher.find({});
            const classes = await ClassModel.find({});
            const subjects = await Subject.find({});
            
            // Simple timetable generation with proper timing
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            const timeSlots = [
                { start: '09:00', end: '10:00' },
                { start: '10:00', end: '11:00' },
                { start: '11:15', end: '12:15' }, // Break after 11:00
                { start: '12:15', end: '13:15' },
                { start: '14:00', end: '15:00' }, // Lunch break
                { start: '15:00', end: '16:00' },
                { start: '16:00', end: '17:00' }
            ];
            
            const timetables = {};
            
            // Generate timetable for each class
            classes.forEach((classItem, classIndex) => {
                const classTimetable = {};
                
                days.forEach((day, dayIndex) => {
                    classTimetable[day] = [];
                    
                    timeSlots.forEach((slot, slotIndex) => {
                        // Assign subjects cyclically
                        const subjectIndex = (dayIndex * timeSlots.length + slotIndex) % subjects.length;
                        const teacherIndex = (dayIndex * timeSlots.length + slotIndex) % teachers.length;
                        
                        if (subjects[subjectIndex] && teachers[teacherIndex]) {
                            classTimetable[day].push({
                                time: `${slot.start}-${slot.end}`,
                                subject: subjects[subjectIndex].name,
                                subjectId: subjects[subjectIndex].id,
                                teacher: teachers[teacherIndex].name,
                                teacherId: teachers[teacherIndex].id,
                                room: classItem.room,
                                classId: classItem.id,
                                className: classItem.name
                            });
                        }
                    });
                });
                
                timetables[classItem.id] = classTimetable;
            });
            
            res.json({
                success: true,
                timetables,
                metadata: {
                    studentsCount: students.length,
                    teachersCount: teachers.length,
                    classesCount: classes.length,
                    subjectsCount: subjects.length,
                    generatedAt: new Date().toISOString()
                }
            });
            
        } catch (error) {
            console.error('Timetable generation error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Failed to generate timetables from database'
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};