import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { WinstonLoggerService } from '../logger/winston.config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private logger: WinstonLoggerService,
  ) {
    this.createTransporter();
  }

  private createTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn('SMTP configuration incomplete. Email functionality disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false, // For development - set to true in production
      },
    });

    this.logger.info('Email transporter configured successfully');
  }

  async sendPasswordResetOTP(email: string, otpCode: string): Promise<void> {
    const subject = 'Password Reset OTP';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${otpCode}</h1>
        </div>
        <p><strong>This OTP will expire in 15 minutes.</strong></p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `;

    await this.sendEmail(email, subject, html);
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      if (!this.transporter) {
        // Log OTP instead of sending email when SMTP is not configured
        const otpCode = this.extractOTPFromHTML(html);
        this.logger.info('Email service not configured. OTP for password reset:', {
          email: to,
          subject,
          otpCode: otpCode,
        });
        // Also log the OTP separately for easy visibility in development
        if (this.configService.get<string>('NODE_ENV') === 'development') {
          console.log(`🔑 PASSWORD RESET OTP for ${to}: ${otpCode}`);
        }
        return;
      }

      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM', 'noreply@example.com'),
        to,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.info('Email sent successfully', {
        messageId: result.messageId,
        to,
        subject,
      });
    } catch (error) {
      this.logger.error('Failed to send email', {
        error: error.message,
        to,
        subject,
      });
      
      // Fallback: Log OTP when email fails
      const otpCode = this.extractOTPFromHTML(html);
      this.logger.info('Email failed, logging OTP for password reset:', {
        email: to,
        subject,
        otpCode: otpCode,
      });
      // Also log the OTP separately for easy visibility in development
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        console.log(`🔑 PASSWORD RESET OTP for ${to}: ${otpCode}`);
      }
    }
  }

  private extractOTPFromHTML(html: string): string {
    const otpMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    return otpMatch ? otpMatch[1].trim() : 'N/A';
  }
}