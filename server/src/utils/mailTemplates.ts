export function generatePasswordResetHtml(resetLink: string, userFirstName: string = 'Valued User'): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Ledgerly</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f6f9;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f6f9;
      padding: 40px 0;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      padding: 32px;
      text-align: center;
      color: #ffffff;
    }
    .logo-badge {
      display: inline-block;
      width: 48px;
      height: 48px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      line-height: 48px;
      font-size: 24px;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 12px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .header-title {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header-subtitle {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #93c5fd;
    }
    .content {
      padding: 36px 32px;
      color: #334155;
    }
    .greeting {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #0f172a;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 28px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      transition: all 0.2s ease;
    }
    .url-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      font-family: monospace;
      font-size: 11px;
      color: #64748b;
      word-break: break-all;
      margin-top: 24px;
    }
    .security-note {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 24px;
      line-height: 1.5;
      border-top: 1px solid #f1f5f9;
      padding-top: 16px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px 32px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-badge">L</div>
        <h1 class="header-title">Ledgerly Billing</h1>
        <p class="header-subtitle">Production-Grade Billing & Finance SaaS</p>
      </div>

      <div class="content">
        <div class="greeting">Hello ${userFirstName},</div>
        <p class="message">
          We received a request to reset the password for your <strong>Ledgerly</strong> account. Click the button below to set a new password:
        </p>

        <div class="btn-container">
          <a href="${resetLink}" target="_blank" class="btn">Reset Password</a>
        </div>

        <p class="message">
          This password reset link will expire in <strong>60 minutes</strong>.
        </p>

        <div class="url-box">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${resetLink}" style="color: #2563eb;">${resetLink}</a>
        </div>

        <div class="security-note">
          <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email or contact support. Your password will remain unchanged.
        </div>
      </div>

      <div class="footer">
        © 2026 Ledgerly Inc. All rights reserved.<br/>
        Secure Billing & Financial Operations Platform
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateVerificationEmailHtml(verificationLink: string, userFirstName: string = 'Valued User'): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Ledgerly</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f6f9;
      margin: 0;
      padding: 0;
    }
    .wrapper { width: 100%; background-color: #f4f6f9; padding: 40px 0; }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      padding: 32px;
      text-align: center;
      color: #ffffff;
    }
    .logo-badge {
      display: inline-block;
      width: 48px;
      height: 48px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      line-height: 48px;
      font-size: 24px;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 12px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .header-title { margin: 0; font-size: 22px; font-weight: 800; }
    .header-subtitle { margin: 4px 0 0 0; font-size: 13px; color: #93c5fd; }
    .content { padding: 36px 32px; color: #334155; }
    .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0f172a; }
    .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 28px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px 32px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-badge">L</div>
        <h1 class="header-title">Ledgerly Billing</h1>
        <p class="header-subtitle">Welcome to Production Billing & Finance</p>
      </div>

      <div class="content">
        <div class="greeting">Welcome ${userFirstName}!</div>
        <p class="message">
          Thank you for signing up for <strong>Ledgerly</strong>. Please verify your email address by clicking the button below:
        </p>

        <div class="btn-container">
          <a href="${verificationLink}" target="_blank" class="btn">Verify Email Address</a>
        </div>
      </div>

      <div class="footer">
        © 2026 Ledgerly Inc. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function generate2FAOtpHtml(otpCode: string, userFirstName: string = 'Valued User'): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your 2-Step Verification Code - Ledgerly</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f6f9;
      margin: 0;
      padding: 0;
    }
    .wrapper { width: 100%; background-color: #f4f6f9; padding: 40px 0; }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 32px;
      text-align: center;
      color: #ffffff;
    }
    .logo-badge {
      display: inline-block;
      width: 48px;
      height: 48px;
      background-color: rgba(37, 99, 235, 0.3);
      border-radius: 12px;
      line-height: 48px;
      font-size: 24px;
      font-weight: 900;
      color: #3b82f6;
      margin-bottom: 12px;
      border: 1px solid rgba(59, 130, 246, 0.4);
    }
    .header-title { margin: 0; font-size: 22px; font-weight: 800; }
    .header-subtitle { margin: 4px 0 0 0; font-size: 13px; color: #94a3b8; }
    .content { padding: 36px 32px; color: #334155; }
    .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0f172a; }
    .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .otp-box {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 2px dashed #2563eb;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 38px;
      font-weight: 900;
      letter-spacing: 10px;
      color: #1e40af;
      margin: 0;
    }
    .otp-sub {
      font-size: 12px;
      color: #3b82f6;
      font-weight: 600;
      margin-top: 6px;
    }
    .security-note {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 24px;
      line-height: 1.5;
      border-top: 1px solid #f1f5f9;
      padding-top: 16px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px 32px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-badge">🛡️</div>
        <h1 class="header-title">2-Step Verification Code</h1>
        <p class="header-subtitle">Ledgerly Secure Identity Authorization</p>
      </div>

      <div class="content">
        <div class="greeting">Hello ${userFirstName},</div>
        <p class="message">
          Your account is protected by <strong>2-Step Verification</strong>. Use the following 6-digit Security Code to complete your login:
        </p>

        <div class="otp-box">
          <h2 class="otp-code">${otpCode}</h2>
          <div class="otp-sub">Valid for 10 Minutes</div>
        </div>

        <div class="security-note">
          <strong>Security Warning:</strong> Never share this OTP code with anyone. Ledgerly staff will never ask for your verification code.
        </div>
      </div>

      <div class="footer">
        © 2026 Ledgerly Inc. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
