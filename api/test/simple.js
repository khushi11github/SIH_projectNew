// Very simple test without any imports
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        res.json({
            success: true,
            message: 'Basic serverless function works!',
            timestamp: new Date().toISOString(),
            env: {
                hasMongoUri: !!process.env.MONGO_URI,
                nodeEnv: process.env.NODE_ENV
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};