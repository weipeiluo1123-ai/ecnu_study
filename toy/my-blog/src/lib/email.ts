import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationCode(email: string, code: string) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Nexus Blog 注册验证码",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0d1117; border-radius: 12px; border: 1px solid #30363d;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #00f0ff, #b829ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Nexus Blog</span>
        </div>
        <h2 style="color: #e6edf3; text-align: center; margin-bottom: 8px;">邮箱验证</h2>
        <p style="color: #8b949e; text-align: center; margin-bottom: 24px;">你的注册验证码如下，5分钟内有效：</p>
        <div style="text-align: center; padding: 16px; background: #161b22; border-radius: 8px; border: 1px solid #30363d; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #00f0ff;">${code}</span>
        </div>
        <p style="color: #8b949e; text-align: center; font-size: 13px;">如果这不是你本人操作，请忽略此邮件。</p>
      </div>
    `,
  });
}
