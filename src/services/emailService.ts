import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Verify Your Email - AI Resume Screening Tool',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">AI Resume Screening Tool</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">Hello ${firstName}!</h2>
              <p style="color: #666; line-height: 1.6;">
                Thank you for registering with our AI Resume Screening Tool. To complete your registration, 
                please verify your email address by clicking the button below:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; 
                          border-radius: 5px; display: inline-block; font-weight: bold;">
                  Verify Email Address
                </a>
              </div>
              <p style="color: #666; line-height: 1.6;">
                If the button doesn't work, you can copy and paste this link into your browser:
              </p>
              <p style="color: #667eea; word-break: break-all;">
                ${verificationUrl}
              </p>
              <p style="color: #666; line-height: 1.6;">
                This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                © 2024 AI Resume Screening Tool. All rights reserved.
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Reset Your Password - AI Resume Screening Tool',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">AI Resume Screening Tool</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">Hello ${firstName}!</h2>
              <p style="color: #666; line-height: 1.6;">
                We received a request to reset your password for your AI Resume Screening Tool account. 
                Click the button below to create a new password:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; 
                          border-radius: 5px; display: inline-block; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              <p style="color: #666; line-height: 1.6;">
                If the button doesn't work, you can copy and paste this link into your browser:
              </p>
              <p style="color: #667eea; word-break: break-all;">
                ${resetUrl}
              </p>
              <p style="color: #666; line-height: 1.6;">
                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                © 2024 AI Resume Screening Tool. All rights reserved.
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Welcome to AI Resume Screening Tool!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">AI Resume Screening Tool</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">Welcome ${firstName}!</h2>
              <p style="color: #666; line-height: 1.6;">
                Thank you for joining our AI Resume Screening Tool! We're excited to help you streamline 
                your recruitment process with advanced AI-powered screening capabilities.
              </p>
              <div style="background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">What you can do with our platform:</h3>
                <ul style="color: #666; line-height: 1.6;">
                  <li>Upload and parse resumes automatically</li>
                  <li>AI-powered candidate matching and scoring</li>
                  <li>Skill gap analysis with upskilling suggestions</li>
                  <li>Bias detection and mitigation</li>
                  <li>Collaborative candidate review system</li>
                  <li>Advanced analytics and reporting</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; 
                          border-radius: 5px; display: inline-block; font-weight: bold;">
                  Get Started
                </a>
              </div>
              <p style="color: #666; line-height: 1.6;">
                If you have any questions or need assistance, please don't hesitate to contact our support team.
              </p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                © 2024 AI Resume Screening Tool. All rights reserved.
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  async sendScreeningNotification(email: string, firstName: string, jobTitle: string, score: number): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Screening Results for ${jobTitle} - AI Resume Screening Tool`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">AI Resume Screening Tool</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">Hello ${firstName}!</h2>
              <p style="color: #666; line-height: 1.6;">
                The AI screening process for the position <strong>${jobTitle}</strong> has been completed.
              </p>
              <div style="background: #f0f8ff; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                <h3 style="color: #333; margin-top: 0;">Screening Score</h3>
                <div style="font-size: 48px; font-weight: bold; color: ${score >= 80 ? '#28a745' : score >= 60 ? '#ffc107' : '#dc3545'};">
                  ${score}%
                </div>
                <p style="color: #666; margin-top: 10px;">
                  ${score >= 80 ? 'Excellent Match' : score >= 60 ? 'Good Match' : 'Needs Review'}
                </p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/screening/results" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; 
                          border-radius: 5px; display: inline-block; font-weight: bold;">
                  View Detailed Results
                </a>
              </div>
              <p style="color: #666; line-height: 1.6;">
                Log in to your dashboard to review the detailed analysis, skill gaps, and recommendations.
              </p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                © 2024 AI Resume Screening Tool. All rights reserved.
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Screening notification email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending screening notification email:', error);
      throw new Error('Failed to send screening notification email');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService(); 