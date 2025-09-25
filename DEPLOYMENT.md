# 🚀 Deploying Timetable Generator to Vercel

## Prerequisites
1. **GitHub Repository**: Make sure your code is pushed to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Atlas**: Set up a cloud MongoDB database at [mongodb.com/atlas](https://mongodb.com/atlas)
4. **Gemini API Key**: Get your API key from [Google AI Studio](https://aistudio.google.com/)

## Step 1: Prepare Environment Variables
You'll need these environment variables:
- `MONGO_URI`: Your MongoDB connection string
- `GEMINI_API_KEY`: Your Google Gemini API key

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository (`SIH_projectNew`)
4. Vercel will automatically detect it's a Vite project
5. Configure environment variables in the deployment settings:
   - Add `MONGO_URI` with your MongoDB connection string
   - Add `GEMINI_API_KEY` with your Gemini API key
6. Click "Deploy"

### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? timetable-generator
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add MONGO_URI
vercel env add GEMINI_API_KEY

# Redeploy with environment variables
vercel --prod
```

## Step 3: Set Up MongoDB Atlas (if not done)
1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create a new cluster (free tier is fine)
3. Create a database user
4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
5. Get your connection string
6. Replace `<username>` and `<password>` with your credentials

Example MongoDB URI:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/timetabledb?retryWrites=true&w=majority
```

## Step 4: Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Copy the key for use in environment variables

## Step 5: Seed Your Database
After deployment, you can seed your database by running:
```bash
# If you have the Vercel CLI
vercel env pull .env.local

# Then run locally to seed
npm run seed:mongo
```

Or manually add data through the admin panel at `your-vercel-url.vercel.app/admin`

## Project Structure for Vercel
The project is configured with:
- ✅ `vercel.json` - Vercel configuration
- ✅ `api/index.js` - Serverless API functions
- ✅ `vite.config.mjs` - Frontend build configuration
- ✅ `package.json` - Build scripts

## Expected URLs after deployment:
- **Home**: `https://your-app.vercel.app/`
- **Admin Panel**: `https://your-app.vercel.app/admin`
- **Student Timetable**: `https://your-app.vercel.app/timetable/S1`
- **Teacher Timetable**: `https://your-app.vercel.app/timetable/teacher/T1`
- **API Endpoints**: `https://your-app.vercel.app/api/*`

## Troubleshooting
1. **Build Errors**: Check the build logs in Vercel dashboard
2. **API Errors**: Ensure environment variables are set correctly
3. **Database Connection**: Verify MongoDB URI and network access
4. **Missing Data**: Seed the database using the admin panel

## Production Considerations
1. **Database Indexing**: Add indexes to MongoDB for better performance
2. **Error Handling**: Monitor logs in Vercel dashboard
3. **Rate Limiting**: Consider adding rate limiting for API endpoints
4. **Caching**: Implement caching for timetable generation

## Local Development vs Production
- **Local**: Uses `server.js` with Express
- **Production**: Uses `api/index.js` with Vercel serverless functions
- Both share the same core logic and database models

Your timetable generator is now ready for production deployment! 🎉