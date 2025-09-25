const mongoose = require('mongoose');

let isConnected = false;

async function connectToMongo(mongoUri) {
    if (isConnected) return mongoose.connection;
    const uri = mongoUri || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sih_timetable';
    // Extract database name from URI if not specified
    let dbName = process.env.MONGO_DB_NAME;
    if (!dbName && uri.includes('mongodb+srv://')) {
        // For Atlas, use the database name from the URI or default to 'sih_timetable'
        const match = uri.match(/\/([^?]+)\?/);
        dbName = match ? match[1] : 'sih_timetable';
    }
    const opts = { autoIndex: true };
    if (dbName) opts.dbName = dbName;
    console.log('Connecting to MongoDB:', uri, 'Database:', dbName);
    await mongoose.connect(uri, opts);
    isConnected = true;
    return mongoose.connection;
}

module.exports = { connectToMongo };