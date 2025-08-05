# AI Resume Screening Tool

A comprehensive, production-ready AI-powered resume screening platform for recruiters. This tool leverages advanced AI to automate the recruitment process, providing intelligent candidate matching, scoring, and analysis.

## 🚀 Live Demo

**Frontend Application**: [https://ai-resume-screening-tool-2oh54n2ro-sudha-1290s-projects.vercel.app](https://ai-resume-screening-tool-2oh54n2ro-sudha-1290s-projects.vercel.app)

**Backend API**: [https://ai-resume-screening-tool-5dndbenxs-sudha-1290s-projects.vercel.app](https://ai-resume-screening-tool-5dndbenxs-sudha-1290s-projects.vercel.app)

## ✨ Features

### Core Functionality

* **Resume Upload & Parsing**: Support for PDF and DOCX files with intelligent text extraction
* **Job Description Analysis**: Parse and extract key requirements and criteria
* **AI-Powered Matching**: Keyword and semantic matching between resumes and job descriptions
* **Candidate Ranking**: Intelligent scoring and ranking system
* **Skill Gap Analysis**: Identify missing skills with upskilling suggestions

### Advanced AI Features

* **Soft Skills Analysis**: Sentiment analysis and communication skills assessment
* **Bias Detection**: AI-powered bias detection and mitigation in screening results
* **Profile Enrichment**: LinkedIn and GitHub integration for comprehensive candidate profiles
* **Video Screening**: Optional AI analysis of communication skills through video interviews
* **Diversity Analytics**: Comprehensive diversity metrics and reporting

### Collaboration & Management

* **Collaborative Dashboard**: Multi-user review, rating, and commenting system
* **Customizable Scoring**: Configurable scoring models and criteria
* **Secure Authentication**: Role-based access control and security
* **API Integration**: RESTful APIs for third-party integrations

## 🛠️ Tech Stack

### Frontend

* **React 18** with TypeScript
* **Tailwind CSS** for modern, responsive UI
* **React Query** for state management
* **React Router** for navigation
* **Chart.js** for analytics and visualizations

### Backend

* **Node.js** with Express.js
* **TypeScript** for type safety
* **PostgreSQL** for primary database (planned)
* **Redis** for caching and session management (planned)
* **MongoDB** for document storage (planned)

### AI & ML

* **OpenAI GPT-4** for text analysis and generation (planned)
* **Python ML Services** for advanced AI features (planned)
* **TensorFlow/PyTorch** for custom ML models (planned)
* **NLTK/SpaCy** for NLP processing (planned)

### Infrastructure

* **Vercel** for deployment
* **JWT** for authentication
* **Multer** for file uploads
* **PDF.js** and **Mammoth** for document parsing
* **Socket.io** for real-time features

## 📁 Project Structure

```
ai-resume-screening-tool/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── contexts/       # React contexts
│   │   └── config/         # Configuration files
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── src/                    # Backend API source code
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── vercel.json            # Vercel configuration
└── package.json           # Root package.json
```

## 🚀 Quick Start

### Prerequisites

* Node.js 18+
* npm or yarn
* Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sudha-1290/AI-Resume-Screening-Tool.git
   cd AI-Resume-Screening-Tool
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Start backend (from root directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   cd frontend && npm start
   ```

## 🌐 Deployment

### Current Deployment

The application is currently deployed on **Vercel**:

- **Frontend**: React application with authentication and UI
- **Backend**: Express.js API with placeholder endpoints
- **Status**: ✅ **Live and Running**

### Deployment URLs

- **Frontend**: https://ai-resume-screening-tool-2oh54n2ro-sudha-1290s-projects.vercel.app
- **Backend API**: https://ai-resume-screening-tool-5dndbenxs-sudha-1290s-projects.vercel.app

### Features Currently Working

✅ **User Authentication** (Mock implementation)
✅ **Dashboard Interface**
✅ **Resume Upload UI**
✅ **Job Management Interface**
✅ **Screening Results Display**
✅ **Analytics Dashboard**
✅ **Responsive Design**
✅ **Modern UI with Tailwind CSS**

### Planned Features

🔄 **Database Integration** (PostgreSQL, Redis, MongoDB)
🔄 **AI/ML Services** (OpenAI GPT-4, Custom ML models)
🔄 **Real-time Features** (Socket.io)
🔄 **File Upload Processing** (PDF/DOCX parsing)
🔄 **Advanced Analytics** (Chart.js integration)

## 📚 API Documentation

The API documentation is available in the `docs/` directory:

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🧪 Testing

### Authentication Test

Visit the test page to verify authentication functionality:
```
https://ai-resume-screening-tool-2oh54n2ro-sudha-1290s-projects.vercel.app/test-auth
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue in the [GitHub repository](https://github.com/sudha-1290/AI-Resume-Screening-Tool/issues)
- Contact the development team

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Frontend UI/UX
- [x] Authentication System
- [x] Basic Dashboard
- [x] Deployment Setup

### Phase 2: Backend Integration 🔄
- [ ] Database Setup
- [ ] API Endpoints
- [ ] File Upload Processing
- [ ] User Management

### Phase 3: AI Features 🔄
- [ ] Resume Parsing
- [ ] Job Description Analysis
- [ ] Matching Algorithms
- [ ] Scoring System

### Phase 4: Advanced Features 🔄
- [ ] Real-time Collaboration
- [ ] Advanced Analytics
- [ ] Video Screening
- [ ] Integration APIs

---

**Built with ❤️ using React, Node.js, and Vercel** 