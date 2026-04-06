# TrackTok Web - AI-Powered Expense Tracker

A modern, production-ready web application for intelligent expense tracking and financial analytics.

## 🚀 Features

- **Auto-detect Transactions** - Automatically tracks spending from notifications
- **AI-Powered Analytics** - Deep financial insights with charts and trends
- **Smart Categorization** - Intelligent transaction categorization
- **Multiple Accounts** - Manage all bank accounts in one dashboard
- **Real-time Charts** - Visual spending analytics and reports
- **Secure Authentication** - JWT-based user authentication
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode** - Full dark mode support
- **Privacy-First** - End-to-end encrypted data storage

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: MongoDB
- **Authentication**: JWT, bcryptjs
- **Charts**: Recharts
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn package manager

## 🏁 Getting Started

### 1. Clone Repository
```bash
git clone <repository-url>
cd tracktok-web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/tracktok

# JWT Secret (change in production!)
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Public API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=TrackTok
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 4. Setup MongoDB

#### Local MongoDB
```bash
# Start MongoDB service
mongod
```

#### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Replace `MONGODB_URI` with your connection string

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
tracktok-web/
├── app/
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── transactions/ # Transaction endpoints
│   │   ├── analytics/    # Analytics endpoints
│   │   └── user/         # User endpoints
│   ├── dashboard/        # Dashboard page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── lib/
│   ├── mongodb.ts        # MongoDB connection
│   └── auth.ts           # Authentication utilities
├── types/
│   └── index.ts          # TypeScript types
├── public/               # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

## 🔐 Authentication

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure_password"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secure_password"
  }'
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Analytics
- `GET /api/analytics` - Get spending analytics
- `GET /api/analytics/monthly` - Get monthly breakdown

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables for Production
- Set `JWT_SECRET` to a strong random string
- Use MongoDB Atlas for database
- Set `NEXT_PUBLIC_API_URL` to your production domain
- Enable HTTPS

### Security Checklist
- [ ] Change JWT_SECRET to a secure random string
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS only
- [ ] Set up CORS properly
- [ ] Enable rate limiting
- [ ] Add input validation
- [ ] Regular security audits
- [ ] Keep dependencies updated

## 📱 Mobile App Integration

The web app works seamlessly with the TrackTok mobile app:
- Shared MongoDB database
- Same authentication system
- Synchronized data across devices
- Real-time updates

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: '#2F2E51',
  'primary-light': '#47468A',
  'primary-dark': '#232247',
  // ... more colors
}
```

### Fonts
Update in `app/layout.tsx`:
```typescript
<link
  href="https://fonts.googleapis.com/css2?family=YourFont"
  rel="stylesheet"
/>
```

## 📚 Documentation

### Database Schema

**Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  phone: String,
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Transactions Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  amount: Number,
  description: String,
  category: String,
  type: 'income' | 'expense',
  date: Date,
  notes: String,
  location: String,
  paymentMethod: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/tracktok-web/issues)
- Email: support@tracktok.app
- Discord: [Join community](https://discord.gg/tracktok)

## 🙏 Acknowledgments

- Design inspired by modern fintech applications
- Built with Next.js and Tailwind CSS
- Charts powered by Recharts
- Icons from Lucide React

## 📈 Roadmap

- [ ] Mobile app authentication sync
- [ ] Real-time notifications
- [ ] Budget planning features
- [ ] Scheduled reports
- [ ] Multi-currency support
- [ ] Bank API integration
- [ ] AI-powered spending predictions
- [ ] Social features (expense sharing)
- [ ] Investment tracking
- [ ] Advanced tax reports

## 🔄 Version History

### v1.0.0 (Initial Release)
- User authentication
- Transaction management
- Analytics dashboard
- Responsive design
- Dark mode support

---

**Made with ❤️ for Financial Freedom** - TrackTok Team © 2026
