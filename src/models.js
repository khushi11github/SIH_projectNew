import mongoose from 'mongoose';

const AvailabilitySchema = new mongoose.Schema({
    day: String,
    startTime: String,
    endTime: String
}, { _id: false });

const TeacherSchema = new mongoose.Schema({
    id: { type: String, index: true, unique: true },
    name: String,
    subjects: [String],
    primarySubjects: [String],
    availability: [AvailabilitySchema],
    maxDailyHours: { type: Number, default: 0 },
    rating: { type: Number, default: 0 }
});

const ClassSchema = new mongoose.Schema({
    id: { type: String, index: true, unique: true },
    name: String,
    room: String,
    subjects: [String],
    totalCredits: { type: Number, default: 0 }
});

const SubjectSchema = new mongoose.Schema({
    id: { type: String, index: true, unique: true },
    name: String,
    credits: { type: Number, default: 1 },
    weeklySessions: { type: Number, default: 1 }
});

const StudentSchema = new mongoose.Schema({
    id: { type: String, index: true, unique: true },
    name: String,
    classId: String,
    interests: [String],
    skillLevel: { type: Number, default: 3 },
    goals: String
});

const ConfigSchema = new mongoose.Schema({
    key: { type: String, index: true, unique: true },
    value: mongoose.Schema.Types.Mixed
});

// Student progress: one doc per student, nested records by activityKey
const StudentProgressSchema = new mongoose.Schema({
    studentId: { type: String, index: true, unique: true },
    records: {
        type: Map,
        of: new mongoose.Schema({
            status: { type: String, default: 'pending' },
            notes: { type: String, default: '' },
            lastUpdated: { type: String }
        }, { _id: false })
    }
});

export const Teacher = mongoose.model('Teacher', TeacherSchema);
export const ClassModel = mongoose.model('Class', ClassSchema);
export const Subject = mongoose.model('Subject', SubjectSchema);
export const Student = mongoose.model('Student', StudentSchema);
export const Config = mongoose.model('Config', ConfigSchema);
export const StudentProgress = mongoose.model('StudentProgress', StudentProgressSchema);



