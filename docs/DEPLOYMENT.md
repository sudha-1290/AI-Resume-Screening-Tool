# Deployment Guide - AI Resume Screening Tool

This guide covers deploying the AI Resume Screening Tool to various cloud platforms.

## 🚀 **Quick Start - Netlify + Railway (Recommended)**

### **Step 1: Deploy Backend to Railway**

1. **Sign up for Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Connect Repository**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables**:
   ```bash
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=your-postgresql-url
   REDIS_URL=your-redis-url
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   OPENAI_API_KEY=your-openai-api-key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=noreply@yourdomain.com
   FRONTEND_URL=https://your-frontend-domain.netlify.app
   ```

4. **Add PostgreSQL Database**:
   - Go to "Variables" tab
   - Click "New Variable"
   - Add `DATABASE_URL` with your PostgreSQL connection string

5. **Add Redis Database**:
   - Go to "Variables" tab
   - Click "New Variable"
   - Add `REDIS_URL` with your Redis connection string

6. **Deploy**:
   - Railway will automatically deploy when you push to main branch
   - Get your backend URL (e.g., `https://your-app.railway.app`)

### **Step 2: Deploy Frontend to Netlify**

1. **Sign up for Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Connect Repository**:
   - Click "New site from Git"
   - Choose GitHub and your repository
   - Set build settings:
     - **Build command**: `cd frontend && npm run build`
     - **Publish directory**: `frontend/build`

3. **Configure Environment Variables**:
   ```bash
   REACT_APP_API_URL=https://your-backend-url.railway.app/api/v1
   REACT_APP_WS_URL=wss://your-backend-url.railway.app
   REACT_APP_ENABLE_VIDEO_SCREENING=true
   REACT_APP_ENABLE_BIAS_DETECTION=true
   REACT_APP_ENABLE_DIVERSITY_ANALYTICS=true
   REACT_APP_ENABLE_LINKEDIN_INTEGRATION=true
   REACT_APP_ENABLE_GITHUB_INTEGRATION=true
   ```

4. **Deploy**:
   - Netlify will automatically deploy when you push to main branch
   - Get your frontend URL (e.g., `https://your-app.netlify.app`)

## 🌐 **Vercel Deployment (Full-Stack)**

### **Step 1: Prepare for Vercel**

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Configure Environment Variables**:
   Create `.env.local` file:
   ```bash
   NODE_ENV=production
   DATABASE_URL=your-postgresql-url
   REDIS_URL=your-redis-url
   JWT_SECRET=your-super-secret-jwt-key
   OPENAI_API_KEY=your-openai-api-key
   ```

### **Step 2: Deploy**

1. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

2. **Configure Custom Domain** (Optional):
   ```bash
   vercel domains add yourdomain.com
   ```

## ☁️ **DigitalOcean App Platform**

### **Step 1: Prepare Repository**

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for DigitalOcean deployment"
   git push origin main
   ```

2. **Update App Spec**:
   Edit `.do/app.yaml` with your repository details.

### **Step 2: Deploy**

1. **Sign up for DigitalOcean**:
   - Go to [digitalocean.com](https://digitalocean.com)
   - Create account

2. **Create App**:
   - Go to "Apps" section
   - Click "Create App"
   - Connect your GitHub repository
   - Select the `.do/app.yaml` file

3. **Configure Resources**:
   - Backend: 512MB RAM, 0.25 vCPU
   - Frontend: 256MB RAM, 0.25 vCPU
   - Database: PostgreSQL 15, 1GB storage
   - Redis: 256MB RAM

4. **Deploy**:
   - Click "Create Resources"
   - Wait for deployment to complete

## 🐳 **AWS Deployment**

### **Prerequisites**

1. **Install AWS CLI**:
   ```bash
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   ```

2. **Configure AWS CLI**:
   ```bash
   aws configure
   ```

3. **Install Docker**:
   ```bash
   sudo apt-get update
   sudo apt-get install docker.io
   sudo usermod -aG docker $USER
   ```

### **Deploy to AWS**

1. **Run Deployment Script**:
   ```bash
   chmod +x scripts/deploy-aws.sh
   ./scripts/deploy-aws.sh
   ```

2. **Manual Steps** (if needed):
   - Create RDS PostgreSQL instance
   - Create ElastiCache Redis instance
   - Configure VPC and security groups
   - Set up Application Load Balancer
   - Configure Route 53 for domain

## 🔧 **Environment Configuration**

### **Required Environment Variables**

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
MONGODB_URI=mongodb://username:password@host:port/database

# Redis Configuration
REDIS_URL=redis://host:port

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_REFRESH_EXPIRES_IN=30d

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Frontend Configuration
FRONTEND_URL=https://your-frontend-domain.com

# Feature Flags
ENABLE_VIDEO_SCREENING=true
ENABLE_BIAS_DETECTION=true
ENABLE_DIVERSITY_ANALYTICS=true
ENABLE_LINKEDIN_INTEGRATION=true
ENABLE_GITHUB_INTEGRATION=true
```

### **Frontend Environment Variables**

```bash
REACT_APP_API_URL=https://your-backend-domain.com/api/v1
REACT_APP_WS_URL=wss://your-backend-domain.com
REACT_APP_ENABLE_VIDEO_SCREENING=true
REACT_APP_ENABLE_BIAS_DETECTION=true
REACT_APP_ENABLE_DIVERSITY_ANALYTICS=true
REACT_APP_ENABLE_LINKEDIN_INTEGRATION=true
REACT_APP_ENABLE_GITHUB_INTEGRATION=true
```

## 📊 **Database Setup**

### **PostgreSQL Setup**

1. **Create Database**:
   ```sql
   CREATE DATABASE ai_resume_screening;
   CREATE USER ai_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE ai_resume_screening TO ai_user;
   ```

2. **Run Migrations**:
   ```bash
   npm run migrate
   ```

3. **Seed Data** (Optional):
   ```bash
   npm run seed
   ```

### **Redis Setup**

1. **Install Redis**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install redis-server
   
   # macOS
   brew install redis
   ```

2. **Configure Redis**:
   ```bash
   # Start Redis
   sudo systemctl start redis-server
   
   # Enable on boot
   sudo systemctl enable redis-server
   ```

## 🔒 **Security Configuration**

### **SSL/TLS Setup**

1. **Get SSL Certificate**:
   - Use Let's Encrypt (free)
   - Or purchase from certificate provider

2. **Configure Nginx**:
   ```nginx
   server {
       listen 443 ssl;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### **Security Headers**

Add to your server configuration:
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## 📈 **Monitoring and Analytics**

### **Application Monitoring**

1. **Set up Logging**:
   - Winston for application logs
   - CloudWatch (AWS) or similar service

2. **Health Checks**:
   - Endpoint: `/health`
   - Database connectivity
   - External service status

3. **Performance Monitoring**:
   - Response time tracking
   - Error rate monitoring
   - Resource usage tracking

### **Analytics Setup**

1. **Google Analytics**:
   ```javascript
   // Add to frontend
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   ```

2. **Custom Analytics**:
   - Track user interactions
   - Monitor feature usage
   - Performance metrics

## 🚀 **CI/CD Pipeline**

### **GitHub Actions**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to Railway
        uses: railway/deploy@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './frontend/build'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🔧 **Troubleshooting**

### **Common Issues**

1. **Database Connection**:
   - Check connection string format
   - Verify network access
   - Test with database client

2. **Environment Variables**:
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify variable values

3. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for errors

4. **Runtime Errors**:
   - Check application logs
   - Verify external service connectivity
   - Monitor resource usage

### **Performance Optimization**

1. **Database Optimization**:
   - Add indexes for frequently queried columns
   - Optimize slow queries
   - Use connection pooling

2. **Caching Strategy**:
   - Redis for session storage
   - CDN for static assets
   - Browser caching headers

3. **Code Optimization**:
   - Lazy loading for components
   - Code splitting
   - Image optimization

## 📞 **Support**

For deployment support:

- **Documentation**: Check this guide and API docs
- **GitHub Issues**: Report bugs and feature requests
- **Community**: Join our Discord/Slack for help
- **Email**: deployment-support@airesumescreening.com

## 🔄 **Updates and Maintenance**

### **Regular Maintenance**

1. **Security Updates**:
   - Keep dependencies updated
   - Monitor security advisories
   - Regular security audits

2. **Performance Monitoring**:
   - Monitor application performance
   - Optimize slow queries
   - Scale resources as needed

3. **Backup Strategy**:
   - Regular database backups
   - Configuration backups
   - Disaster recovery plan

### **Scaling Considerations**

1. **Horizontal Scaling**:
   - Load balancers
   - Multiple application instances
   - Database read replicas

2. **Vertical Scaling**:
   - Increase server resources
   - Optimize application code
   - Database optimization

3. **Cost Optimization**:
   - Monitor resource usage
   - Use auto-scaling
   - Optimize for cost efficiency 