interface EnvironmentConfig {
  apiUrl: string;
  wsUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    videoScreening: boolean;
    biasDetection: boolean;
    diversityAnalytics: boolean;
    linkedinIntegration: boolean;
    githubIntegration: boolean;
  };
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const env = process.env.NODE_ENV || 'development';
  
  // Development environment
  if (env === 'development') {
    return {
      apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
      wsUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:3000',
      environment: 'development',
      features: {
        videoScreening: true,
        biasDetection: true,
        diversityAnalytics: true,
        linkedinIntegration: true,
        githubIntegration: true,
      },
    };
  }
  
  // Production environment
  if (env === 'production') {
    return {
      apiUrl: process.env.REACT_APP_API_URL || 'https://api.airesumescreening.com/api/v1',
      wsUrl: process.env.REACT_APP_WS_URL || 'wss://api.airesumescreening.com',
      environment: 'production',
      features: {
        videoScreening: process.env.REACT_APP_ENABLE_VIDEO_SCREENING === 'true',
        biasDetection: process.env.REACT_APP_ENABLE_BIAS_DETECTION === 'true',
        diversityAnalytics: process.env.REACT_APP_ENABLE_DIVERSITY_ANALYTICS === 'true',
        linkedinIntegration: process.env.REACT_APP_ENABLE_LINKEDIN_INTEGRATION === 'true',
        githubIntegration: process.env.REACT_APP_ENABLE_GITHUB_INTEGRATION === 'true',
      },
    };
  }
  
  // Staging environment
  return {
    apiUrl: process.env.REACT_APP_API_URL || 'https://staging-api.airesumescreening.com/api/v1',
    wsUrl: process.env.REACT_APP_WS_URL || 'wss://staging-api.airesumescreening.com',
    environment: 'staging',
    features: {
      videoScreening: true,
      biasDetection: true,
      diversityAnalytics: true,
      linkedinIntegration: true,
      githubIntegration: true,
    },
  };
};

export const config = getEnvironmentConfig();

export default config; 