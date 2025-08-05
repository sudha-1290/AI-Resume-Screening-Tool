import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';
import { logger } from '../utils/logger';
import { aiService } from './aiService';
import { ParsedResumeData } from '../types';
import path from 'path';

class ResumeService {
  // Parse resume file (PDF or DOCX)
  async parseResume(filePath: string, fileType: string): Promise<ParsedResumeData> {
    try {
      logger.info(`Parsing resume file: ${filePath}`);

      let text: string;

      // Extract text based on file type
      if (fileType === '.pdf') {
        text = await this.parsePDF(filePath);
      } else if (fileType === '.docx' || fileType === '.doc') {
        text = await this.parseDOCX(filePath);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Clean and normalize text
      text = this.cleanText(text);

      // Use AI service to extract structured data
      const parsedData = await aiService.parseResumeText(text);

      logger.info(`Successfully parsed resume: ${filePath}`);
      return parsedData;
    } catch (error) {
      logger.error(`Error parsing resume ${filePath}:`, error);
      throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Parse PDF file
  private async parsePDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      logger.error(`Error parsing PDF ${filePath}:`, error);
      throw new Error('Failed to parse PDF file');
    }
  }

  // Parse DOCX file
  private async parseDOCX(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      return result.value;
    } catch (error) {
      logger.error(`Error parsing DOCX ${filePath}:`, error);
      throw new Error('Failed to parse DOCX file');
    }
  }

  // Clean and normalize extracted text
  private cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters that might interfere with parsing
      .replace(/[^\w\s\-.,!?@#$%&*()+=<>[\]{}|\\/:;'"`~]/g, '')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove multiple consecutive line breaks
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Trim whitespace
      .trim();
  }

  // Extract basic information without AI
  async extractBasicInfo(filePath: string, fileType: string): Promise<any> {
    try {
      let text: string;

      if (fileType === '.pdf') {
        text = await this.parsePDF(filePath);
      } else if (fileType === '.docx' || fileType === '.doc') {
        text = await this.parseDOCX(filePath);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      text = this.cleanText(text);

      // Extract basic information using regex patterns
      const basicInfo = {
        email: this.extractEmail(text),
        phone: this.extractPhone(text),
        name: this.extractName(text),
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
        hasEducation: this.hasEducationSection(text),
        hasExperience: this.hasExperienceSection(text),
        hasSkills: this.hasSkillsSection(text),
        rawText: text
      };

      return basicInfo;
    } catch (error) {
      logger.error(`Error extracting basic info from ${filePath}:`, error);
      throw new Error('Failed to extract basic information');
    }
  }

  // Extract email addresses
  private extractEmail(text: string): string[] {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    return text.match(emailRegex) || [];
  }

  // Extract phone numbers
  private extractPhone(text: string): string[] {
    const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    return text.match(phoneRegex) || [];
  }

  // Extract name (basic implementation)
  private extractName(text: string): string | null {
    // Look for common name patterns at the beginning of the document
    const lines = text.split('\n').slice(0, 5);
    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine && cleanLine.length > 2 && cleanLine.length < 50) {
        // Check if line looks like a name (contains letters and spaces, no special characters)
        if (/^[A-Za-z\s]+$/.test(cleanLine) && cleanLine.split(' ').length <= 4) {
          return cleanLine;
        }
      }
    }
    return null;
  }

  // Check if document has education section
  private hasEducationSection(text: string): boolean {
    const educationKeywords = [
      'education', 'academic', 'degree', 'university', 'college', 'school',
      'bachelor', 'master', 'phd', 'diploma', 'certificate', 'graduation'
    ];
    
    const lowerText = text.toLowerCase();
    return educationKeywords.some(keyword => lowerText.includes(keyword));
  }

  // Check if document has experience section
  private hasExperienceSection(text: string): boolean {
    const experienceKeywords = [
      'experience', 'work history', 'employment', 'career', 'job',
      'position', 'role', 'responsibilities', 'achievements', 'projects'
    ];
    
    const lowerText = text.toLowerCase();
    return experienceKeywords.some(keyword => lowerText.includes(keyword));
  }

  // Check if document has skills section
  private hasSkillsSection(text: string): boolean {
    const skillsKeywords = [
      'skills', 'technologies', 'tools', 'languages', 'frameworks',
      'programming', 'software', 'competencies', 'expertise'
    ];
    
    const lowerText = text.toLowerCase();
    return skillsKeywords.some(keyword => lowerText.includes(keyword));
  }

  // Validate resume file
  async validateResumeFile(filePath: string, fileType: string): Promise<any> {
    try {
      const validation = {
        isValid: true,
        errors: [] as string[],
        warnings: [] as string[],
        fileSize: 0,
        textLength: 0,
        hasContent: false
      };

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        validation.isValid = false;
        validation.errors.push('File does not exist');
        return validation;
      }

      // Check file size
      const stats = fs.statSync(filePath);
      validation.fileSize = stats.size;

      if (stats.size === 0) {
        validation.isValid = false;
        validation.errors.push('File is empty');
        return validation;
      }

      if (stats.size > parseInt(process.env.MAX_FILE_SIZE || '10485760')) {
        validation.isValid = false;
        validation.errors.push('File size exceeds maximum limit');
        return validation;
      }

      // Try to extract text
      let text: string;
      try {
        if (fileType === '.pdf') {
          text = await this.parsePDF(filePath);
        } else if (fileType === '.docx' || fileType === '.doc') {
          text = await this.parseDOCX(filePath);
        } else {
          validation.isValid = false;
          validation.errors.push(`Unsupported file type: ${fileType}`);
          return validation;
        }
      } catch (error) {
        validation.isValid = false;
        validation.errors.push('Failed to extract text from file');
        return validation;
      }

      // Clean text
      text = this.cleanText(text);
      validation.textLength = text.length;

      if (text.length < 50) {
        validation.isValid = false;
        validation.errors.push('Document contains insufficient text');
        return validation;
      }

      validation.hasContent = true;

      // Check for common resume sections
      if (!this.hasEducationSection(text)) {
        validation.warnings.push('No education section detected');
      }

      if (!this.hasExperienceSection(text)) {
        validation.warnings.push('No experience section detected');
      }

      if (!this.hasSkillsSection(text)) {
        validation.warnings.push('No skills section detected');
      }

      // Check for contact information
      const emails = this.extractEmail(text);
      const phones = this.extractPhone(text);

      if (emails.length === 0) {
        validation.warnings.push('No email address found');
      }

      if (phones.length === 0) {
        validation.warnings.push('No phone number found');
      }

      return validation;
    } catch (error) {
      logger.error(`Error validating resume file ${filePath}:`, error);
      throw new Error('Failed to validate resume file');
    }
  }

  // Get file statistics
  async getFileStats(filePath: string): Promise<any> {
    try {
      const stats = fs.statSync(filePath);
      const text = await this.extractBasicInfo(filePath, path.extname(filePath).toLowerCase());
      
      return {
        fileSize: stats.size,
        fileSizeMB: (stats.size / 1024 / 1024).toFixed(2),
        wordCount: text.wordCount,
        characterCount: text.characterCount,
        hasEmail: text.email.length > 0,
        hasPhone: text.phone.length > 0,
        hasName: !!text.name,
        sections: {
          education: text.hasEducation,
          experience: text.hasExperience,
          skills: text.hasSkills
        }
      };
    } catch (error) {
      logger.error(`Error getting file stats for ${filePath}:`, error);
      throw new Error('Failed to get file statistics');
    }
  }
}

export const resumeService = new ResumeService(); 