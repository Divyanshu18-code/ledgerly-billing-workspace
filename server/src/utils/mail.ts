import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Load environment variables for SMTP
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'no-reply@ledgerly.com';

let transporter: nodemailer.Transporter | null = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function logMail(to: string, subject: string, text: string, html?: string) {
  // If SMTP is configured, send the real email
  if (transporter) {
    try {
      await transporter.sendMail({
        from: SMTP_FROM,
        to,
        subject,
        text,
        html: html || text,
      });
      console.log(`[mail] Email successfully sent to ${to} via SMTP.`);
      return;
    } catch (err) {
      console.error('[mail] Failed to send email via SMTP, falling back to simulated file log:', err);
    }
  }

  // Fallback to file logging if SMTP is not configured or fails
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const logFile = path.join(logDir, 'mail.log');
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] TO: ${to}\nSUBJECT: ${subject}\nTEXT:\n${text}\n----------------------------------------\n`;
  fs.appendFileSync(logFile, logEntry);
  console.log(`\n=== SIMULATED EMAIL SENT ===\nTo: ${to}\nSubject: ${subject}\nText: ${text}\n============================\n`);
}
