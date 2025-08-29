# BlackBook Vocabulary - MERN Stack Application

A comprehensive vocabulary learning application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring one-word substitutions, idioms & phrases, quizzes, and payment integration.

## Features

- **Vocabulary Learning**: One-Word Substitutions (OWS), Idioms & Phrases (IPH), Synonyms, and Antonyms organized by letters A-Z
- **Interactive Quizzes**: Smart distractor generation with immediate feedback and scoring
- **Word of the Day**: Daily vocabulary with practice queue functionality
- **User Authentication**: JWT-based authentication with secure cookie handling
- **Progress Tracking**: User progress, practice queue, and performance analytics
- **Payment Integration**: PhonePe payment gateway for subscription plans
- **Premium Features**: Synonyms and Antonyms with subscription gating
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live progress tracking and immediate feedback

## Tech Stack

### Frontend
- React 18 with React Router v6
- Tailwind CSS for styling
- Axios for API communication
- Vite for build tooling

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication with httpOnly cookies
- PhonePe payment integration
- Helmet, CORS, and rate limiting for security

## Prerequisites

- Node.js 16+ and npm
- MongoDB (local or MongoDB Atlas)
- PhonePe merchant account (for payments)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd blackbook-vocab
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install

# Return to root
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```bash
# Copy the example file
cp env.example .env

# Edit with your configuration
nano .env
```

Required environment variables:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/blackbook-vocab
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/blackbook-vocab

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Client Configuration
CLIENT_ORIGIN=http://localhost:3000

# PhonePe Payment Configuration
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_MERCHANT_KEY=your_merchant_key
PHONEPE_ENVIRONMENT=UAT
PHONEPE_REDIRECT_URL=http://localhost:3001/api/pay/callback

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=120
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# Seed the database with vocabulary data
npm run seed
```

## Running the Application

### Development Mode
```bash
# Terminal 1: Start the backend server
npm run server

# Terminal 2: Start the React development server
npm run client

# Or run both concurrently
npm run dev
```

### Production Mode
```bash
# Build the React application
npm run client:build

# Start the production server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Vocabulary
- `GET /api/vocab/ows/:letter` - Get OWS vocabulary by letter
- `GET /api/vocab/iph/:letter` - Get IPH vocabulary by letter
- `GET /api/vocab/synonyms/:letter` - Get synonyms vocabulary by letter
- `GET /api/vocab/antonyms/:letter` - Get antonyms vocabulary by letter
- `GET /api/vocab/wotd` - Get word of the day
- `GET /api/vocab/overview` - Get vocabulary statistics

### Quizzes
- `GET /api/quiz/generate` - Generate quiz questions
- `POST /api/quiz/submit` - Submit quiz results

### User Management
- `GET /api/user/practice-queue` - Get user's practice queue
- `POST /api/user/practice-queue` - Add item to practice queue
- `DELETE /api/user/practice-queue` - Clear practice queue
- `POST /api/user/mark-known` - Mark word as known

### Payments
- `POST /api/pay/create` - Create payment order
- `POST /api/pay/verify` - Verify payment
- `POST /api/pay/webhook` - Payment webhook handler

## Project Structure

```
blackbook-vocab/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── index.js           # Server entry point
│   └── seed.js            # Database seeder
├── data/                  # JSON vocabulary data
├── payment/               # PhonePe integration
├── package.json           # Root package.json
└── README.md
```

## Database Models

### User
- Authentication details
- Subscription information
- Progress tracking

### Vocab
- Vocabulary items with definitions
- Categorized by type (OWS/IPH) and letter
- Metadata for quiz generation

### Order
- Payment orders and subscriptions
- User plan management

## Deployment

### MongoDB Atlas
1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Update `MONGODB_URI` in environment variables

### Vercel (Frontend)
1. Connect your GitHub repository
2. Set build command: `npm run client:build`
3. Set output directory: `client/dist`
4. Configure environment variables

### Heroku (Backend)
1. Create a new Heroku app
2. Connect your GitHub repository
3. Set environment variables
4. Deploy from main branch

### Railway
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

## Testing

```bash
# Run backend tests
cd server && npm test

# Run frontend tests (if configured)
cd ../client && npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License

## Support

For support and questions, please open an issue in the GitHub repository.

## Roadmap

- [x] Synonyms and Antonyms features
- [ ] Advanced analytics dashboard
- [ ] Spaced repetition algorithm
- [ ] Mobile app (React Native)
- [ ] Social learning features
- [ ] AI-powered word recommendations