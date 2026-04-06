# TrackTok Web - Quick Start Guide

Welcome to TrackTok! This guide will help you get the application running in minutes.

## ⚡ 5-Minute Setup

### Option 1: Using Docker (Recommended)

```bash
# 1. Install Docker Desktop if not already installed

# 2. Start MongoDB with Docker Compose
docker-compose up -d

# 3. Install dependencies
npm install

# 4. Create .env.local file
cp .env.example .env.local

# 5. Run development server
npm run dev

# 6. Open browser
# Web app: http://localhost:3000
# Mongo Express (Database UI): http://localhost:8081
```

### Option 2: Local MongoDB

```bash
# 1. Install MongoDB from https://www.mongodb.com/try/download/community

# 2. Start MongoDB service
# On macOS:
brew services start mongodb-community

# On Windows: MongoDB runs as a service by default

# 3. Install dependencies
npm install

# 4. Create .env.local file
cp .env.example .env.local

# 5. Run development server
npm run dev

# 6. Open http://localhost:3000
```

### Option 3: MongoDB Atlas (Cloud)

```bash
# 1. Create free account at https://www.mongodb.com/cloud/atlas

# 2. Create a cluster and get connection string

# 3. Create .env.local file
cp .env.example .env.local

# 4. Update MONGODB_URI in .env.local with your connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tracktok

# 5. Install dependencies
npm install

# 6. Run development server
npm run dev

# 7. Open http://localhost:3000
```

## 📝 Test the Application

### Create Test Account
1. Go to http://localhost:3000
2. Click "Get Started" or go to /register
3. Create account with test data:
   - Name: John Doe
   - Email: john@example.com
   - Password: Test123456

### Login
1. Go to /login
2. Use your test credentials

### View Dashboard
1. After login, you'll see the dashboard with:
   - Balance overview
   - Monthly spending chart
   - Spending by category pie chart
   - Recent transactions list

## 📊 Sample Data

The dashboard comes with mock data for demonstration:
- Total Balance: $5,420.50
- Monthly Income: $3,500
- Monthly Expenses: $1,256.75
- 6 sample transactions

To use real data, you'll need to:
1. Create transactions via the API
2. Or implement the "Add Transaction" feature in the UI

## 🔧 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type check
npm run type-check

# View MongoDB with Mongo Express
# http://localhost:8081 (username: admin, password: admin)
```

## 🌐 API Testing

### Using cURL

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

#### Get User Profile (requires token)
```bash
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get Analytics (requires token)
```bash
curl http://localhost:3000/api/analytics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🗄️ Database

### MongoDB Collections

The app creates these collections automatically:

1. **users** - User accounts
   ```
   { _id, name, email, password, phone, avatar, createdAt, updatedAt }
   ```

2. **transactions** - Spending records
   ```
   { _id, userId, amount, description, category, type, date, notes, createdAt, updatedAt }
   ```

3. **accounts** - User accounts (banks, cards)
   ```
   { _id, userId, accountName, accountType, balance, currency, createdAt, updatedAt }
   ```

### View Data with Mongo Express
1. Visit http://localhost:8081
2. Username: admin
3. Password: admin
4. Database: tracktok

## 🚨 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
```bash
# Using Docker
docker-compose up -d

# Or manually start MongoDB
mongod
```

### Port Already in Use
```
Error: Port 3000 is already in use
```
**Solution**: Kill the process or use a different port
```bash
# On macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or set a different port
PORT=3001 npm run dev
```

### Module Not Found
```
Error: Cannot find module 'next'
```
**Solution**: Install dependencies
```bash
npm install
```

### TypeScript Errors
```bash
# Type check the project
npm run type-check

# Build with type checking
npm run build
```

## 📱 Mobile App Integration

This web app works with the TrackTok mobile app:
- Same MongoDB database
- Shared user accounts
- Synchronized transactions
- Real-time data updates

## 🔐 Security Notes

For **development**:
- JWT_SECRET is simple (change in production!)
- MongoDB has no authentication
- HTTP is used (not HTTPS)

For **production**:
- Use strong JWT_SECRET
- Enable MongoDB authentication
- Use HTTPS
- Set environment variables securely
- Use .env file only for development

## 📚 Next Steps

1. **Understand the Structure**: Read the main README.md
2. **Explore the Code**: Check out the app directory structure
3. **Modify Styling**: Edit tailwind.config.ts and globals.css
4. **Add Features**: Create new API routes and components
5. **Deploy**: Follow the deployment guide in README.md

## 🆘 Need Help?

- Check the README.md for detailed documentation
- Review API endpoints in app/api/
- Check TypeScript types in types/index.ts
- Look at components and pages for examples

## 📞 Support

- GitHub Issues: https://github.com/yourusername/tracktok-web/issues
- Email: support@tracktok.app
- Discord: https://discord.gg/tracktok

---

**Happy coding! 🎉**
