import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { ParsedResumeData, AIAnalysis, SkillGap, BiasAnalysis, BiasType } from '../types';

class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Parse resume text and extract structured data
  async parseResumeText(text: string): Promise<ParsedResumeData> {
    try {
      const prompt = `
        Parse the following resume text and extract structured information. Return the result as a JSON object with the following structure:
        {
          "personalInfo": {
            "firstName": "string",
            "lastName": "string", 
            "email": "string",
            "phone": "string (optional)",
            "location": "string (optional)",
            "linkedin": "string (optional)",
            "github": "string (optional)",
            "portfolio": "string (optional)"
          },
          "education": [
            {
              "institution": "string",
              "degree": "string",
              "field": "string",
              "startDate": "YYYY-MM-DD",
              "endDate": "YYYY-MM-DD (optional)",
              "gpa": "number (optional)",
              "description": "string (optional)"
            }
          ],
          "experience": [
            {
              "company": "string",
              "position": "string",
              "startDate": "YYYY-MM-DD",
              "endDate": "YYYY-MM-DD (optional)",
              "description": "string",
              "achievements": ["string array"],
              "technologies": ["string array"]
            }
          ],
          "skills": [
            {
              "name": "string",
              "level": "beginner|intermediate|advanced|expert",
              "category": "technical|soft|language|tool|framework",
              "yearsOfExperience": "number (optional)"
            }
          ],
          "certifications": [
            {
              "name": "string",
              "issuer": "string",
              "date": "YYYY-MM-DD",
              "expiryDate": "YYYY-MM-DD (optional)",
              "credentialId": "string (optional)"
            }
          ],
          "languages": [
            {
              "name": "string",
              "proficiency": "basic|conversational|fluent|native"
            }
          ],
          "summary": "string (optional)",
          "rawText": "original text"
        }

        Resume text:
        ${text}
      `;

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume parser. Extract structured information from resume text and return it as valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      const parsedData = JSON.parse(response);
      return parsedData;
    } catch (error) {
      logger.error('Error parsing resume text:', error);
      throw new Error('Failed to parse resume text');
    }
  }

  // Analyze resume and provide insights
  async analyzeResume(parsedData: ParsedResumeData): Promise<AIAnalysis> {
    try {
      const prompt = `
        Analyze the following resume data and provide comprehensive insights. Return the result as a JSON object with the following structure:
        {
          "summary": "Brief summary of the candidate's profile",
          "strengths": ["Array of key strengths"],
          "weaknesses": ["Array of areas for improvement"],
          "recommendations": ["Array of recommendations"],
          "skillGaps": [
            {
              "skill": "string",
              "currentLevel": "beginner|intermediate|advanced|expert",
              "requiredLevel": "beginner|intermediate|advanced|expert",
              "upskillingSuggestions": ["string array"],
              "estimatedTimeToUpskill": "string"
            }
          ],
          "biasAnalysis": {
            "detected": "boolean",
            "types": ["gender|age|ethnicity|education|location|experience"],
            "confidence": "number (0-1)",
            "mitigationSuggestions": ["string array"]
          },
          "sentimentScore": "number (0-1)",
          "communicationScore": "number (0-1) (optional)"
        }

        Resume data:
        ${JSON.stringify(parsedData, null, 2)}
      `;

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR analyst. Analyze resume data and provide insights about candidate strengths, weaknesses, and potential biases.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const analysis = JSON.parse(response);
      return analysis;
    } catch (error) {
      logger.error('Error analyzing resume:', error);
      throw new Error('Failed to analyze resume');
    }
  }

  // Extract skills from resume
  async extractSkills(parsedData: ParsedResumeData): Promise<any> {
    try {
      const prompt = `
        Extract and categorize all skills from the following resume data. Return the result as a JSON object with the following structure:
        {
          "technicalSkills": ["array of technical skills"],
          "softSkills": ["array of soft skills"],
          "languages": ["array of languages"],
          "tools": ["array of tools and software"],
          "frameworks": ["array of frameworks and libraries"],
          "certifications": ["array of relevant certifications"],
          "skillLevels": {
            "skillName": "beginner|intermediate|advanced|expert"
          }
        }

        Resume data:
        ${JSON.stringify(parsedData, null, 2)}
      `;

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert skill extraction specialist. Extract and categorize skills from resume data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const skills = JSON.parse(response);
      return skills;
    } catch (error) {
      logger.error('Error extracting skills:', error);
      throw new Error('Failed to extract skills');
    }
  }

  // Validate resume data
  async validateResume(parsedData: ParsedResumeData): Promise<any> {
    try {
      const prompt = `
        Validate the following resume data for completeness, consistency, and quality. Return the result as a JSON object with the following structure:
        {
          "isValid": "boolean",
          "completeness": "number (0-1)",
          "consistency": "number (0-1)",
          "quality": "number (0-1)",
          "issues": [
            {
              "type": "missing|inconsistent|low_quality|suspicious",
              "field": "string",
              "description": "string",
              "severity": "low|medium|high"
            }
          ],
          "suggestions": ["array of improvement suggestions"],
          "overallScore": "number (0-1)"
        }

        Resume data:
        ${JSON.stringify(parsedData, null, 2)}
      `;

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume validator. Check resume data for completeness, consistency, and quality issues.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const validation = JSON.parse(response);
      return validation;
    } catch (error) {
      logger.error('Error validating resume:', error);
      throw new Error('Failed to validate resume');
    }
  }

  // Match resume against job description
  async matchResumeToJob(resumeData: ParsedResumeData, jobDescription: string, jobRequirements: any[]): Promise<any> {
    try {
      const prompt = `
        Match the following resume against the job description and requirements. Return the result as a JSON object with the following structure:
        {
          "overallScore": "number (0-100)",
          "skillMatch": "number (0-100)",
          "experienceMatch": "number (0-100)",
          "educationMatch": "number (0-100)",
          "culturalFit": "number (0-100)",
          "skillBreakdown": [
            {
              "skill": "string",
              "required": "boolean",
              "candidateLevel": "beginner|intermediate|advanced|expert",
              "requiredLevel": "beginner|intermediate|advanced|expert",
              "score": "number (0-100)",
              "gap": "number"
            }
          ],
          "strengths": ["array of strengths"],
          "weaknesses": ["array of weaknesses"],
          "recommendations": ["array of recommendations"],
          "fitLevel": "excellent|good|average|poor"
        }

        Resume data:
        ${JSON.stringify(resumeData, null, 2)}

        Job description:
        ${jobDescription}

        Job requirements:
        ${JSON.stringify(jobRequirements, null, 2)}
      `;

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert job matching specialist. Match resume data against job requirements and provide detailed scoring.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const matching = JSON.parse(response);
      return matching;
    } catch (error) {
      logger.error('Error matching resume to job:', error);
      throw new Error('Failed to match resume to job');
    }
  }

  // Detect bias in resume or job description
  async detectBias(text: string): Promise<BiasAnalysis> {
    try {
      const prompt = `
        Analyze the following text for potential biases in recruitment. Return the result as a JSON object with the following structure:
        {
          "detected": "boolean",
          "types": ["gender|age|ethnicity|education|location|experience"],
          "confidence": "number (0-1)",
          "mitigationSuggestions": ["array of suggestions"],
          "biasedPhrases": ["array of potentially biased phrases"],
          "recommendations": ["array of recommendations"]
        }

        Text to analyze:
        ${text}
      `;

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert bias detection specialist. Identify potential biases in recruitment-related text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const biasAnalysis = JSON.parse(response);
      return biasAnalysis;
    } catch (error) {
      logger.error('Error detecting bias:', error);
      throw new Error('Failed to detect bias');
    }
  }

  // Generate interview questions based on resume
  async generateInterviewQuestions(resumeData: ParsedResumeData, jobRequirements: any[]): Promise<any> {
    try {
      const prompt = `
        Generate relevant interview questions based on the resume and job requirements. Return the result as a JSON object with the following structure:
        {
          "technicalQuestions": [
            {
              "question": "string",
              "difficulty": "easy|medium|hard",
              "category": "string",
              "expectedAnswer": "string"
            }
          ],
          "behavioralQuestions": [
            {
              "question": "string",
              "category": "string",
              "whatToLookFor": "string"
            }
          ],
          "situationalQuestions": [
            {
              "question": "string",
              "scenario": "string",
              "expectedOutcome": "string"
            }
          ],
          "culturalFitQuestions": [
            {
              "question": "string",
              "purpose": "string"
            }
          ]
        }

        Resume data:
        ${JSON.stringify(resumeData, null, 2)}

        Job requirements:
        ${JSON.stringify(jobRequirements, null, 2)}
      `;

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interviewer. Generate relevant interview questions based on resume and job requirements.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const questions = JSON.parse(response);
      return questions;
    } catch (error) {
      logger.error('Error generating interview questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  // Analyze video interview responses
  async analyzeVideoInterview(transcript: string, questions: any[]): Promise<any> {
    try {
      const prompt = `
        Analyze the following video interview transcript and responses. Return the result as a JSON object with the following structure:
        {
          "communicationScore": "number (0-100)",
          "confidenceScore": "number (0-100)",
          "technicalKnowledge": "number (0-100)",
          "culturalFit": "number (0-100)",
          "bodyLanguage": {
            "eyeContact": "number (0-100)",
            "posture": "number (0-100)",
            "gestures": "number (0-100)",
            "facialExpressions": "number (0-100)"
          },
          "speechAnalysis": {
            "clarity": "number (0-100)",
            "pace": "number (0-100)",
            "volume": "number (0-100)",
            "fillerWords": "number (0-100)",
            "technicalAccuracy": "number (0-100)"
          },
          "overallScore": "number (0-100)",
          "feedback": ["array of feedback points"],
          "strengths": ["array of strengths"],
          "areasForImprovement": ["array of areas for improvement"]
        }

        Transcript:
        ${transcript}

        Questions:
        ${JSON.stringify(questions, null, 2)}
      `;

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert video interview analyst. Analyze interview responses for communication, technical knowledge, and cultural fit.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const analysis = JSON.parse(response);
      return analysis;
    } catch (error) {
      logger.error('Error analyzing video interview:', error);
      throw new Error('Failed to analyze video interview');
    }
  }

  // Test OpenAI connection
  async testConnection(): Promise<boolean> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      });
      
      logger.info('OpenAI connection test successful');
      return true;
    } catch (error) {
      logger.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}

export const aiService = new AIService(); 