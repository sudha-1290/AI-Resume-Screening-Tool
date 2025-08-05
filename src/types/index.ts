// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'recruiter' | 'hiring_manager' | 'super_admin';

// Company Types
export interface Company {
  id: string;
  name: string;
  industry: string;
  size: CompanySize;
  website?: string;
  logo?: string;
  settings: CompanySettings;
  createdAt: Date;
  updatedAt: Date;
}

export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';

export interface CompanySettings {
  enableVideoScreening: boolean;
  enableBiasDetection: boolean;
  enableDiversityAnalytics: boolean;
  enableLinkedInIntegration: boolean;
  enableGitHubIntegration: boolean;
  customScoringModel?: ScoringModel;
}

// Resume Types
export interface Resume {
  id: string;
  candidateId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  parsedData: ParsedResumeData;
  status: ResumeStatus;
  uploadedBy: string;
  uploadedAt: Date;
  processedAt?: Date;
}

export type ResumeStatus = 'uploaded' | 'processing' | 'processed' | 'failed';

export interface ParsedResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: WorkExperience[];
  skills: Skill[];
  certifications: Certification[];
  languages: Language[];
  summary?: string;
  rawText: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  description?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface Skill {
  name: string;
  level: SkillLevel;
  category: SkillCategory;
  yearsOfExperience?: number;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type SkillCategory = 'technical' | 'soft' | 'language' | 'tool' | 'framework';

export interface Certification {
  name: string;
  issuer: string;
  date: Date;
  expiryDate?: Date;
  credentialId?: string;
}

export interface Language {
  name: string;
  proficiency: LanguageProficiency;
}

export type LanguageProficiency = 'basic' | 'conversational' | 'fluent' | 'native';

// Job Types
export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: JobRequirement[];
  responsibilities: string[];
  location: string;
  type: JobType;
  level: JobLevel;
  salary?: SalaryRange;
  status: JobStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
}

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
export type JobLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
export type JobStatus = 'draft' | 'active' | 'paused' | 'closed' | 'archived';

export interface JobRequirement {
  skill: string;
  level: SkillLevel;
  required: boolean;
  weight: number;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

// Screening Types
export interface Screening {
  id: string;
  jobId: string;
  resumeId: string;
  candidateId: string;
  score: number;
  breakdown: ScreeningBreakdown;
  status: ScreeningStatus;
  aiAnalysis: AIAnalysis;
  reviewerNotes: ReviewerNote[];
  createdAt: Date;
  updatedAt: Date;
}

export type ScreeningStatus = 'pending' | 'in_progress' | 'completed' | 'reviewed' | 'rejected';

export interface ScreeningBreakdown {
  skills: SkillScore[];
  experience: number;
  education: number;
  culturalFit: number;
  overall: number;
}

export interface SkillScore {
  skill: string;
  required: boolean;
  candidateLevel: SkillLevel;
  requiredLevel: SkillLevel;
  score: number;
  gap: number;
}

export interface AIAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  skillGaps: SkillGap[];
  biasAnalysis: BiasAnalysis;
  sentimentScore: number;
  communicationScore?: number;
}

export interface SkillGap {
  skill: string;
  currentLevel: SkillLevel;
  requiredLevel: SkillLevel;
  upskillingSuggestions: string[];
  estimatedTimeToUpskill: string;
}

export interface BiasAnalysis {
  detected: boolean;
  types: BiasType[];
  confidence: number;
  mitigationSuggestions: string[];
}

export type BiasType = 'gender' | 'age' | 'ethnicity' | 'education' | 'location' | 'experience';

export interface ReviewerNote {
  id: string;
  reviewerId: string;
  reviewerName: string;
  note: string;
  rating?: number;
  createdAt: Date;
}

// Analytics Types
export interface Analytics {
  id: string;
  companyId: string;
  type: AnalyticsType;
  data: AnalyticsData;
  filters: AnalyticsFilters;
  createdAt: Date;
}

export type AnalyticsType = 'diversity' | 'skills' | 'performance' | 'hiring_funnel' | 'time_to_hire';

export interface AnalyticsData {
  metrics: Metric[];
  charts: Chart[];
  insights: Insight[];
}

export interface Metric {
  name: string;
  value: number;
  unit: string;
  change?: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Chart {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  title: string;
  data: any;
  options: any;
}

export interface Insight {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
}

export interface AnalyticsFilters {
  dateRange: DateRange;
  departments?: string[];
  jobLevels?: JobLevel[];
  locations?: string[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

// Integration Types
export interface Integration {
  id: string;
  companyId: string;
  type: IntegrationType;
  config: IntegrationConfig;
  status: IntegrationStatus;
  lastSync?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type IntegrationType = 'linkedin' | 'github' | 'ats' | 'email' | 'calendar';
export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'syncing';

export interface IntegrationConfig {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookUrl?: string;
  settings: Record<string, any>;
}

// Video Screening Types
export interface VideoScreening {
  id: string;
  screeningId: string;
  candidateId: string;
  jobId: string;
  status: VideoScreeningStatus;
  scheduledAt?: Date;
  completedAt?: Date;
  duration?: number;
  recordingUrl?: string;
  analysis: VideoAnalysis;
  questions: VideoQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export type VideoScreeningStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface VideoAnalysis {
  communicationScore: number;
  confidenceScore: number;
  technicalKnowledge: number;
  culturalFit: number;
  bodyLanguage: BodyLanguageAnalysis;
  speechAnalysis: SpeechAnalysis;
  overallScore: number;
  feedback: string[];
}

export interface BodyLanguageAnalysis {
  eyeContact: number;
  posture: number;
  gestures: number;
  facialExpressions: number;
}

export interface SpeechAnalysis {
  clarity: number;
  pace: number;
  volume: number;
  fillerWords: number;
  technicalAccuracy: number;
}

export interface VideoQuestion {
  id: string;
  question: string;
  type: QuestionType;
  timeLimit: number;
  candidateAnswer?: string;
  aiScore?: number;
  reviewerScore?: number;
}

export type QuestionType = 'technical' | 'behavioral' | 'situational' | 'cultural';

// Scoring Model Types
export interface ScoringModel {
  id: string;
  companyId: string;
  name: string;
  description: string;
  weights: ScoringWeights;
  thresholds: ScoringThresholds;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoringWeights {
  skills: number;
  experience: number;
  education: number;
  culturalFit: number;
  softSkills: number;
  technicalSkills: number;
}

export interface ScoringThresholds {
  excellent: number;
  good: number;
  average: number;
  belowAverage: number;
  reject: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Request Types
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  companyId?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  requirements: JobRequirement[];
  responsibilities: string[];
  location: string;
  type: JobType;
  level: JobLevel;
  salary?: SalaryRange;
  deadline?: Date;
}

export interface ScreeningRequest {
  jobId: string;
  resumeId: string;
  candidateId: string;
  customScoringModel?: ScoringModel;
}

// Socket Types
export interface SocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

export interface ScreeningProgress {
  screeningId: string;
  progress: number;
  status: string;
  message: string;
} 