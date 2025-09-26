// Simple test endpoint to debug the issue
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Test basic require paths
        console.log('Testing basic imports...');
        
        const dbPath = require.resolve('../../src/db.cjs');
        const modelsPath = require.resolve('../../src/models.cjs');
        const seedPath = require.resolve('../../database-seed.js');
        
        console.log('Paths resolved:', { dbPath, modelsPath, seedPath });
        
        // Test database connection
        const { connectToMongo } = require('../../src/db.cjs');
        console.log('DB module imported successfully');
        
        const { Student } = require('../../src/models.cjs');
        console.log('Models imported successfully');
        
        // Try connecting
        await connectToMongo(process.env.MONGO_URI);
        console.log('Database connected successfully');
        
        // Test count
        const count = await Student.countDocuments();
        console.log('Student count:', count);
        
        res.json({
            success: true,
            message: 'All tests passed',
            paths: { dbPath, modelsPath, seedPath },
            mongoUri: process.env.MONGO_URI ? 'Set' : 'Not set',
            studentCount: count
        });
        
    } catch (error) {
        console.error('Test error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack,
            mongoUri: process.env.MONGO_URI ? 'Set' : 'Not set'
        });
    }
};