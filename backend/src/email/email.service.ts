import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const port = this.config.get<number>('SMTP_PORT', 587);
    const user = this.config.get<string>('SMTP_USER', '');
    const pass = this.config.get<string>('SMTP_PASS', '');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass } : undefined,
    });
  }

  private get from(): string {
    return this.config.get<string>('SMTP_FROM', 'Football Recruit <noreply@footballrecruit.com>');
  }

  private get frontendUrl(): string {
    return this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  }

  async sendRecommendationRequest(
    coachEmail: string,
    coachName: string,
    playerName: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    const submitUrl = `${this.frontendUrl}/recommend/${token}`;
    const subject = `${playerName} has requested a recommendation from you`;
    const html = `
      <p>Hi ${coachName},</p>
      <p>${playerName} has requested that you provide a recommendation for their football recruitment profile.</p>
      <p>Please click the link below to submit your recommendation. This link expires on ${expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
      <p><a href="${submitUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Submit Recommendation</a></p>
      <p>If you don't know this player or didn't expect this request, you can ignore this email.</p>
    `;
    await this.send(coachEmail, subject, html);
  }

  async sendRecommendationReceived(
    playerEmail: string,
    playerName: string,
    coachName: string,
  ): Promise<void> {
    const subject = `New recommendation from ${coachName}`;
    const html = `
      <p>Hi ${playerName},</p>
      <p>${coachName} has submitted a recommendation for your profile. View it on your dashboard.</p>
    `;
    await this.send(playerEmail, subject, html);
  }

  async sendRecommendationReminder(
    coachEmail: string,
    coachName: string,
    playerName: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    const submitUrl = `${this.frontendUrl}/recommend/${token}`;
    const subject = `Reminder: ${playerName} is waiting for your recommendation`;
    const html = `
      <p>Hi ${coachName},</p>
      <p>This is a friendly reminder that ${playerName} is still waiting for your recommendation.</p>
      <p>Please click the link below to submit your recommendation. This link expires on ${expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
      <p><a href="${submitUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Submit Recommendation</a></p>
      <p>If you don't know this player or didn't expect this request, you can ignore this email.</p>
    `;
    await this.send(coachEmail, subject, html);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (err) {
      this.logger.warn(`Failed to send email to ${to}: ${(err as Error).message}`);
    }
  }
}
