import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

/**
 * Configure email transporter
 * Supports: Gmail, SendGrid, Brevo, custom SMTP
 */
const createTransporter = () => {
  const provider = process.env.EMAIL_PROVIDER || 'gmail';

  if (provider === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use app password, not regular password
      },
    });
  }

  if (provider === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  if (provider === 'brevo') {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SENDER_EMAIL,
        pass: process.env.BREVO_SMTP_KEY,
      },
    });
  }

  // Custom SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const transporter = createTransporter();

interface SendOTPEmailParams {
  email: string;
  otp: string;
  userName?: string;
}

/**
 * Send OTP via email with branded template
 */
export const sendOTPEmail = async ({
  email,
  otp,
  userName = 'Reader',
}: SendOTPEmailParams): Promise<void> => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; color: white; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 20px; text-align: center; }
          .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
          .otp-container { background: #f9f9f9; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 30px 0; }
          .otp-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
          .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .expiry { font-size: 14px; color: #999; margin-top: 20px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee; }
          .footer p { margin: 8px 0; font-size: 12px; color: #666; }
          .footer a { color: #667eea; text-decoration: none; }
          .security-note { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #856404; text-align: left; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 Chaptered</h1>
          </div>
          <div class="content">
            <p class="greeting">Hey ${userName}! 👋</p>
            <p>Your one-time password to verify your email is below.</p>
            <p>This code expires in 10 minutes.</p>
            
            <div class="otp-container">
              <div class="otp-label">Your Verification Code</div>
              <div class="otp-code">${otp.split('').join(' ')}</div>
            </div>
            
            <div class="security-note">
              🔒 Never share this code with anyone. Chaptered team will never ask for it.
            </div>
            
            <p class="expiry">⏱️ Valid for 10 minutes</p>
          </div>
          <div class="footer">
            <p>Didn't request this? You can safely ignore this email.</p>
            <p>Have questions? <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@chaptered.app'}">Contact support</a></p>
            <p>&copy; 2024 Chaptered. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
      to: email,
      subject: `Your Chaptered Verification Code: ${otp}`,
      html: htmlTemplate,
      text: `Your Chaptered verification code is: ${otp}. Valid for 10 minutes.`,
    });

    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

/**
 * Test email configuration
 */
export const testEmailConfiguration = async (): Promise<void> => {
  try {
    await transporter.verify();
    console.log('✅ Email service configured correctly');
  } catch (error) {
    console.error('❌ Email service configuration error:', error);
    throw new Error('Email service not configured properly');
  }
};