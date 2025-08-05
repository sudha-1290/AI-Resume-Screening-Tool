# AI Resume Screening Tool

A comprehensive, production-ready AI-powered resume screening platform for recruiters. This tool leverages advanced AI to automate the recruitment process, providing intelligent candidate matching, scoring, and analysis.

## Features

### Core Functionality
- **Resume Upload & Parsing**: Support for PDF and DOCX files with intelligent text extraction
- **Job Description Analysis**: Parse and extract key requirements and criteria
- **AI-Powered Matching**: Keyword and semantic matching between resumes and job descriptions
- **Candidate Ranking**: Intelligent scoring and ranking system
- **Skill Gap Analysis**: Identify missing skills with upskilling suggestions

### Advanced AI Features
- **Soft Skills Analysis**: Sentiment analysis and communication skills assessment
- **Bias Detection**: AI-powered bias detection and mitigation in screening results
- **Profile Enrichment**: LinkedIn and GitHub integration for comprehensive candidate profiles
- **Video Screening**: Optional AI analysis of communication skills through video interviews
- **Diversity Analytics**: Comprehensive diversity metrics and reporting

### Collaboration & Management
- **Collaborative Dashboard**: Multi-user review, rating, and commenting system
- **Customizable Scoring**: Configurable scoring models and criteria
- **Secure Authentication**: Role-based access control and security
- **API Integration**: RESTful APIs for third-party integrations

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for modern, responsive UI
- **React Query** for state management
- **React Router** for navigation
- **Chart.js** for analytics and visualizations

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** for primary database
- **Redis** for caching and session management
- **MongoDB** for document storage (resumes, job descriptions)

### AI & ML
- **OpenAI GPT-4** for text analysis and generation
- **Python ML Services** for advanced AI features
- **TensorFlow/PyTorch** for custom ML models
- **NLTK/SpaCy** for NLP processing

### Infrastructure
- **Docker** for containerization
- **JWT** for authentication
- **Multer** for file uploads
- **PDF.js** and **Mammoth** for document parsing
- **Socket.io** for real-time features

## Project Structure

```
ai-resume-screening-tool/
├── frontend/                 # React frontend application
├── backend/                  # Node.js backend API
├── ml-service/              # Python ML service
├── docker/                  # Docker configuration
├── docs/                    # Documentation
└── scripts/                 # Utility scripts
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-resume-screening-tool
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Or run locally**
   ```bash
   # Install dependencies
   npm install
   cd frontend && npm install
   cd ../ml-service && pip install -r requirements.txt
   
   # Start services
   npm run dev
   ```

## API Documentation

The API documentation is available at `/api/docs` when the server is running.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue in the GitHub repository or contact the development team. 