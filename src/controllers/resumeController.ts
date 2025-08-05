import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';
import { db } from '../config/database';
import { resumeService } from '../services/resumeService';
import { aiService } from '../services/aiService';
import { uploadMiddleware } from '../middleware/upload';
import { logger } from '../utils/logger';
import { Resume, ApiResponse, Pagination } from '../types';

class ResumeController {
  // Upload resume
  async uploadResume(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { candidateId, jobId } = req.body;
      const uploadedBy = req.user?.id;

      if (!req.file) {
        throw new CustomError('No file uploaded', 400);
      }

      // Validate file
      uploadMiddleware.validateFile(req.file);

      // Create resume record
      const resumeId = uuidv4();
      const fileInfo = uploadMiddleware.getFileInfo(req.file);

      const resume: Partial<Resume> = {
        id: resumeId,
        candidateId,
        fileName: fileInfo.originalName,
        filePath: fileInfo.path,
        fileSize: fileInfo.size,
        fileType: fileInfo.extension,
        parsedData: {} as any, // Will be populated after parsing
        status: 'uploaded',
        uploadedBy: uploadedBy!,
        uploadedAt: new Date()
      };

      await db('resumes').insert(resume);

      // Start parsing process in background
      this.parseResumeInBackground(resumeId, fileInfo.path, fileInfo.extension);

      const response: ApiResponse<Resume> = {
        success: true,
        data: resume as Resume,
        message: 'Resume uploaded successfully. Parsing in progress.'
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get resumes with pagination and filters
  async getResumes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        candidateId,
        jobId
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const companyId = req.user?.companyId;

      // Build query
      let query = db('resumes')
        .select('*')
        .where('company_id', companyId);

      // Apply filters
      if (status) {
        query = query.where('status', status);
      }

      if (candidateId) {
        query = query.where('candidate_id', candidateId);
      }

      if (jobId) {
        query = query.where('job_id', jobId);
      }

      // Get total count
      const totalQuery = query.clone();
      const total = await totalQuery.count('* as count').first();

      // Get paginated results
      const resumes = await query
        .orderBy('uploaded_at', 'desc')
        .limit(parseInt(limit as string))
        .offset(offset);

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const totalCount = total?.count || 0;
      
      const pagination: Pagination = {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        hasNext: offset + limitNum < totalCount,
        hasPrev: pageNum > 1
      };

      const response: ApiResponse<Resume[]> = {
        success: true,
        data: resumes,
        pagination
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get resume by ID
  async getResumeById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      const resume = await db('resumes')
        .select('*')
        .where('id', id)
        .where('company_id', companyId)
        .first();

      if (!resume) {
        throw new CustomError('Resume not found', 404);
      }

      const response: ApiResponse<Resume> = {
        success: true,
        data: resume
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Update resume
  async updateResume(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, parsedData } = req.body;
      const companyId = req.user?.companyId;

      // Check if resume exists and belongs to company
      const existingResume = await db('resumes')
        .where('id', id)
        .where('company_id', companyId)
        .first();

      if (!existingResume) {
        throw new CustomError('Resume not found', 404);
      }

      // Update resume
      const updateData: any = { updated_at: new Date() };
      if (status) updateData.status = status;
      if (parsedData) updateData.parsed_data = parsedData;

      await db('resumes')
        .where('id', id)
        .update(updateData);

      const response: ApiResponse = {
        success: true,
        message: 'Resume updated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Delete resume
  async deleteResume(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      // Check if resume exists and belongs to company
      const resume = await db('resumes')
        .where('id', id)
        .where('company_id', companyId)
        .first();

      if (!resume) {
        throw new CustomError('Resume not found', 404);
      }

      // Delete file from storage
      await uploadMiddleware.cleanupFile(resume.file_path);

      // Delete from database
      await db('resumes').where('id', id).del();

      const response: ApiResponse = {
        success: true,
        message: 'Resume deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Parse resume manually
  async parseResume(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      // Check if resume exists and belongs to company
      const resume = await db('resumes')
        .where('id', id)
        .where('company_id', companyId)
        .first();

      if (!resume) {
        throw new CustomError('Resume not found', 404);
      }

      // Update status to processing
      await db('resumes')
        .where('id', id)
        .update({ 
          status: 'processing',
          updated_at: new Date()
        });

      // Start parsing in background
      this.parseResumeInBackground(id, resume.file_path, resume.file_type);

      const response: ApiResponse = {
        success: true,
        message: 'Resume parsing started'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Download resume
  async downloadResume(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      const resume = await db('resumes')
        .where('id', id)
        .where('company_id', companyId)
        .first();

      if (!resume) {
        throw new CustomError('Resume not found', 404);
      }

      // Check if file exists
      const fs = require('fs');
      if (!fs.existsSync(resume.file_path)) {
        throw new CustomError('Resume file not found', 404);
      }

      // Set headers for download
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${resume.file_name}"`);
      res.setHeader('Content-Length', resume.file_size);

      // Stream file
      const fileStream = fs.createReadStream(resume.file_path);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  // Reprocess resume
  async reprocessResume(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      const resume = await db('resumes')
        .where('id', id)
        .where('company_id', companyId)
        .first();

      if (!resume) {
        throw new CustomError('Resume not found', 404);
      }

      // Update status to processing
      await db('resumes')
        .where('id', id)
        .update({ 
          status: 'processing',
          updated_at: new Date()
        });

      // Start reprocessing in background
      this.parseResumeInBackground(id, resume.file_path, resume.file_type);

      const response: ApiResponse = {
        success: true,
        message: 'Resume reprocessing started'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get resume analysis
  async getResumeAnalysis(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      const resume = await db('resumes')
        .where('id', id)
        .where('company_id', companyId)
        .first();

      if (!resume) {
        throw new CustomError('Resume not found', 404);
      }

      if (resume.status !== 'processed') {
        throw new CustomError('Resume not yet processed', 400);
      }

      // Get analysis from AI service
      const analysis = await aiService.analyzeResume(resume.parsed_data);

      const response: ApiResponse = {
        success: true,
        data: analysis
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Bulk upload resumes
  async bulkUploadResumes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { candidateId, jobId } = req.body;
      const uploadedBy = req.user?.id;

      if (!req.files || req.files.length === 0) {
        throw new CustomError('No files uploaded', 400);
      }

      const uploadedResumes = [];
      const errors = [];

      for (const file of req.files as Express.Multer.File[]) {
        try {
          // Validate file
          uploadMiddleware.validateFile(file);

          // Create resume record
          const resumeId = uuidv4();
          const fileInfo = uploadMiddleware.getFileInfo(file);

          const resume: Partial<Resume> = {
            id: resumeId,
            candidateId,
            fileName: fileInfo.originalName,
            filePath: fileInfo.path,
            fileSize: fileInfo.size,
            fileType: fileInfo.extension,
            parsedData: {} as any,
            status: 'uploaded',
            uploadedBy: uploadedBy!,
            uploadedAt: new Date()
          };

          await db('resumes').insert(resume);
          uploadedResumes.push(resume);

          // Start parsing in background
          this.parseResumeInBackground(resumeId, fileInfo.path, fileInfo.extension);
        } catch (error) {
          errors.push({
            file: file.originalname,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      const response: ApiResponse = {
        success: true,
        data: {
          uploaded: uploadedResumes.length,
          errors: errors.length,
          errorDetails: errors
        },
        message: `Successfully uploaded ${uploadedResumes.length} resumes${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Extract skills from resume
  async extractSkills(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      const resume = await db('resumes')
        .where('id', id)
        .where('company_id', companyId)
        .first();

      if (!resume) {
        throw new CustomError('Resume not found', 404);
      }

      // Extract skills using AI service
      const skills = await aiService.extractSkills(resume.parsed_data);

      const response: ApiResponse = {
        success: true,
        data: skills
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Validate resume
  async validateResume(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      const resume = await db('resumes')
        .where('id', id)
        .where('company_id', companyId)
        .first();

      if (!resume) {
        throw new CustomError('Resume not found', 404);
      }

      // Validate resume using AI service
      const validation = await aiService.validateResume(resume.parsed_data);

      const response: ApiResponse = {
        success: true,
        data: validation
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Background parsing method
  private async parseResumeInBackground(resumeId: string, filePath: string, fileType: string): Promise<void> {
    try {
      logger.info(`Starting background parsing for resume ${resumeId}`);

      // Parse resume using service
      const parsedData = await resumeService.parseResume(filePath, fileType);

      // Update resume with parsed data
      await db('resumes')
        .where('id', resumeId)
        .update({
          parsed_data: parsedData,
          status: 'processed',
          processed_at: new Date(),
          updated_at: new Date()
        });

      logger.info(`Completed parsing for resume ${resumeId}`);
    } catch (error) {
      logger.error(`Error parsing resume ${resumeId}:`, error);

      // Update resume status to failed
      await db('resumes')
        .where('id', resumeId)
        .update({
          status: 'failed',
          updated_at: new Date()
        });
    }
  }
}

export const resumeController = new ResumeController(); 