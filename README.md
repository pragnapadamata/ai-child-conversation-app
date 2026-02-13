# AI Child Conversation App

[![Deployed on Vercel](https://vercel.com/button)](https://your-app-url.vercel.app)

A real-time AI-powered voice conversation interface for children that analyzes images and engages in interactive conversations.

## 🚀 **Live Demo**
👉 **Deployed Application:** [https://ai-child-conversation-app.vercel.app](https://ai-child-conversation-app.vercel.app)

## 🌟 Features

- **Image Analysis**: Upload images and get AI-powered descriptions and conversation starters
- **Voice Conversations**: 1-minute timed voice conversations using Web Speech API
- **Real-time Chat**: Interactive chat interface with message history
- **AI Integration**: Powered by OpenAI GPT-4 Vision and GPT-3.5 Turbo
- **Text-to-Speech**: AI responses converted to natural-sounding speech
- **Database Storage**: All conversations and images stored in Supabase
- **Responsive Design**: Beautiful UI built with React, TypeScript, and Tailwind CSS
- **Type Safety**: Full TypeScript implementation across frontend and backend

## 🏗️ Project Structure

```
📦 root
├── README.md
├── package.json
├── vercel.json
├── .gitignore
├── .github/workflows/deploy.yml
├── web/                     # Next.js React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageDisplay.tsx
│   │   │   ├── VoiceRecorder.tsx
│   │   │   └── ChatUI.tsx
│   │   ├── pages/
│   │   │   └── index.tsx
│   │   ├── utils/ai.ts
│   │   ├── types/index.ts
│   │   └── styles/globals.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
├── api/                     # Express.js backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── analyzeImage.ts
│   │   │   ├── conversation.ts
│   │   │   └── upload.ts
│   │   ├── config/
│   │   │   ├── openai.ts
│   │   │   └── supabase.ts
│   │   ├── middleware/
│   │   │   └── errorHandler.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── supabase/               # Database setup
│   ├── migrations/
│   │   └── 001_create_conversations.sql
│   └── storage/
│       └── setup.sql
└── .env.example
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ai-child-conversation-app
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server
PORT=3001
FRONTEND_URL=http://localhost:3000

# Frontend (for Vercel deployment)
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
```

### 4. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database migration:
   ```bash
   # In Supabase Dashboard > SQL Editor
   # Copy and run the contents of supabase/migrations/001_create_conversations.sql
   ```
3. Set up storage buckets:
   ```bash
   # In Supabase Dashboard > SQL Editor  
   # Copy and run the contents of supabase/storage/setup.sql
   ```

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:web    # Frontend on http://localhost:3000
npm run dev:api   # Backend on http://localhost:3001
```

## 🌐 Deployment

### Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy Frontend**:
   ```bash
   cd web
   vercel --prod
   ```

3. **Deploy Backend**:
   ```bash
   cd api
   vercel --prod
   ```

4. **Configure Environment Variables**:
   ```bash
   vercel env add OPENAI_API_KEY
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

### Automatic Deployment with GitHub Actions

1. Fork and push to your GitHub repository
2. Set up these repository secrets in GitHub Settings:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID` 
   - `VERCEL_PROJECT_ID`
3. Push to `main` branch to trigger automatic deployment

## 📱 API Endpoints

### Image Analysis
- `POST /api/analyzeImage` - Analyze uploaded image with AI

### Conversation Management  
- `POST /api/startConversation` - Start a new conversation session
- `POST /api/sendVoiceInput` - Send voice input and get AI response

### File Upload
- `POST /api/uploadImage` - Upload image to Supabase storage

## 🎯 How It Works

1. **Image Upload**: User uploads an image through the React frontend
2. **AI Analysis**: Backend sends image to OpenAI GPT-4 Vision for analysis
3. **Conversation Start**: AI generates a child-friendly conversation starter
4. **Voice Interaction**: User speaks, Web Speech API transcribes to text
5. **AI Response**: Text sent to OpenAI GPT-3.5 Turbo for response
6. **Text-to-Speech**: AI response converted to speech using OpenAI TTS
7. **Storage**: All data stored in Supabase database and storage

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with SSR
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Web Speech API** - Voice recognition and synthesis

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Type safety
- **OpenAI API** - GPT-4 Vision, GPT-3.5 Turbo, TTS
- **Supabase** - PostgreSQL database and storage
- **Multer** - File upload handling

### Infrastructure
- **Vercel** - Serverless deployment
- **GitHub Actions** - CI/CD pipeline
- **Supabase** - Backend-as-a-Service

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:web          # Frontend only
npm run dev:api          # Backend only

# Building
npm run build            # Build both
npm run build:web        # Frontend only  
npm run build:api        # Backend only

# Testing
npm test                 # Run all tests

# Production
npm start                # Start production server
```

## 🧪 Testing

```bash
# Run tests for both frontend and backend
npm test

# Run tests individually
cd web && npm test
cd api && npm test
```

## 📝 Environment Variables

### Required for Development
- `OPENAI_API_KEY` - OpenAI API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Optional
- `PORT` - Backend port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)

### Required for Production
- `NEXT_PUBLIC_API_URL` - API endpoint URL for frontend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Q: Voice recording not working**
A: Ensure you're using HTTPS or localhost. Microphone permissions are required.

**Q: OpenAI API errors**
A: Check your API key and usage limits. Ensure the key has sufficient credits.

**Q: Supabase connection issues**
A: Verify your Supabase URL and service role key are correct.

**Q: Build errors**
A: Run `npm run install:all` to ensure all dependencies are installed.

### Getting Help

- Check the [Issues](../../issues) page for known problems
- Create a new issue for bugs or feature requests
- Review the code comments for additional context

## 🎉 Acknowledgments

- OpenAI for the powerful AI models
- Supabase for the excellent backend services
- Vercel for seamless deployment
- The open-source community for amazing tools and libraries
