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
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify your email</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #f6f1ea;
            font-family: Arial, Helvetica, sans-serif;
            color: #1f2937;
          }

          table {
            border-spacing: 0;
            border-collapse: collapse;
          }

          img {
            border: 0;
            outline: none;
            text-decoration: none;
          }

          .wrapper {
            width: 100%;
            background: #f6f1ea;
            padding: 32px 0;
          }

          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background: #fffdfb;
            border: 1px solid #eadfce;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 12px 32px rgba(52, 39, 26, 0.08);
          }

          .header {
            background: linear-gradient(135deg, #2f241d 0%, #5a3d2f 40%, #a86a3d 100%);
            padding: 28px 32px;
            text-align: center;
          }

          .brand {
            font-size: 28px;
            line-height: 1.2;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: #f8f4ef;
            margin: 0;
            font-family: Georgia, 'Times New Roman', serif;
          }

          .brand span {
            color: #e8b57d;
          }

          .content {
            padding: 36px 32px 24px;
            text-align: center;
          }

          .eyebrow {
            font-size: 12px;
            line-height: 18px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #8c6b4f;
            font-weight: 700;
            margin: 0 0 10px;
          }

          .greeting {
            font-size: 24px;
            line-height: 32px;
            color: #261c16;
            margin: 0 0 14px;
            font-weight: 700;
          }

          .message {
            margin: 0 auto 22px;
            max-width: 470px;
            font-size: 16px;
            line-height: 26px;
            color: #54473f;
          }

          .otp-box {
            background: linear-gradient(180deg, #fffaf5 0%, #f7efe6 100%);
            border: 1px solid #e7d3b7;
            border-radius: 12px;
            padding: 22px 18px;
            margin: 26px auto 18px;
            max-width: 420px;
          }

          .otp-label {
            font-size: 12px;
            line-height: 18px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #8a6a52;
            margin: 0 0 12px;
            font-weight: 700;
          }

          .otp-code {
            font-size: 36px;
            line-height: 42px;
            font-weight: 700;
            letter-spacing: 0.28em;
            color: #2f241d;
            font-family: 'Courier New', Courier, monospace;
          }

          .expiry {
            margin: 0;
            font-size: 14px;
            line-height: 22px;
            color: #7a6458;
          }

          .security-note {
            margin: 26px auto 0;
            padding: 16px 18px;
            background: #f7f0e8;
            border-left: 4px solid #d08545;
            max-width: 470px;
            border-radius: 8px;
            text-align: left;
            font-size: 14px;
            line-height: 22px;
            color: #5d4638;
          }

          .footer {
            background: #f7f1ea;
            border-top: 1px solid #ebdfd4;
            padding: 22px 32px 28px;
            text-align: center;
          }

          .footer-text {
            margin: 0 0 10px;
            font-size: 13px;
            line-height: 20px;
            color: #6e564a;
          }

          .footer a {
            color: #7a4b2d;
            text-decoration: none;
            font-weight: 600;
          }

          @media screen and (max-width: 620px) {
            .wrapper {
              padding: 16px 0;
            }

            .content,
            .header,
            .footer {
              padding-left: 20px !important;
              padding-right: 20px !important;
            }

            .greeting {
              font-size: 22px;
            }

            .otp-code {
              font-size: 28px;
              letter-spacing: 0.18em;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1 class="brand">Ch<span>.</span>aptered</h1>
            </div>

            <div class="content">
              <p class="eyebrow">Email verification</p>
              <h2 class="greeting">Hi ${userName}!</h2>
              <p class="message">
                Use the verification code below to confirm your email and continue into your reading journey with Ch.aptered.
              </p>

              <div class="otp-box">
                <p class="otp-label">Your verification code</p>
                <div class="otp-code">${otp.split('').join(' ')}</div>
              </div>

              <p class="expiry">This code expires in 10 minutes.</p>

              <div class="security-note">
                For your security, never share this code with anyone. If you did not request this verification, you can safely ignore this email.
              </div>
            </div>

            <div class="footer">
              <p class="footer-text">Need help? <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@chaptered.app'}">Contact Ch.aptered support</a></p>
              <p class="footer-text">© ${new Date().getFullYear()} Ch.aptered. All rights reserved.</p>
            </div>
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
      text: `Hi ${userName},\n\nYour Ch.aptered verification code is: ${otp}\n\nThis code expires in 10 minutes. If you did not request this email, you can ignore it.\n\nFor your security, never share this code with anyone.\n\nThanks,\nCh.aptered`,
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