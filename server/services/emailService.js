import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        this.transporter = null;
        this.config = null;
    }

    configure(smtpConfig) {
        this.config = smtpConfig;
        this.transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure, // true for 465, false for other ports
            auth: {
                user: smtpConfig.user,
                pass: smtpConfig.password
            }
        });
    }

    async sendTestEmail(toEmail) {
        if (!this.transporter) {
            throw new Error('SMTP not configured');
        }

        const mailOptions = {
            from: `"HeroOS System" <${this.config.user}>`,
            to: toEmail,
            subject: '✅ HeroOS SMTP Test - Configuration Successful',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
                        .header h1 { margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px; }
                        .content { padding: 40px 30px; }
                        .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; margin-bottom: 20px; }
                        .info-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚀 HeroOS</h1>
                        </div>
                        <div class="content">
                            <div class="success-badge">✓ Test Successful</div>
                            <h2 style="color: #1f2937; margin-top: 0;">SMTP Configuration Test</h2>
                            <p style="color: #4b5563; line-height: 1.6;">
                                Congratulations! Your SMTP settings have been configured successfully. 
                                HeroOS can now send email notifications for user account operations.
                            </p>
                            <div class="info-box">
                                <strong style="color: #1e40af;">Configuration Details:</strong><br>
                                <span style="color: #4b5563;">SMTP Host: ${this.config.host}</span><br>
                                <span style="color: #4b5563;">Port: ${this.config.port}</span><br>
                                <span style="color: #4b5563;">Security: ${this.config.secure ? 'SSL/TLS' : 'STARTTLS'}</span>
                            </div>
                            <p style="color: #4b5563; line-height: 1.6;">
                                Email notifications will be sent for:
                            </p>
                            <ul style="color: #4b5563; line-height: 1.8;">
                                <li>New user account creation</li>
                                <li>Account modifications</li>
                                <li>Account deletion</li>
                                <li>Password resets</li>
                            </ul>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from HeroOS System</p>
                            <p>© ${new Date().getFullYear()} HeroOS - Vibe Edition</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        return await this.transporter.sendMail(mailOptions);
    }

    async sendAccountCreatedEmail(userEmail, username, tempPassword) {
        if (!this.transporter) return;

        const mailOptions = {
            from: `"HeroOS System" <${this.config.user}>`,
            to: userEmail,
            subject: '🎉 Welcome to HeroOS - Your Account Has Been Created',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
                        .header h1 { margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 2px; }
                        .content { padding: 40px 30px; }
                        .credentials-box { background: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .credential-item { margin: 10px 0; }
                        .credential-label { color: #059669; font-weight: bold; font-size: 12px; text-transform: uppercase; }
                        .credential-value { color: #1f2937; font-size: 18px; font-family: monospace; background: white; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 4px; }
                        .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                        .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Welcome!</h1>
                        </div>
                        <div class="content">
                            <h2 style="color: #1f2937; margin-top: 0;">Your HeroOS Account is Ready</h2>
                            <p style="color: #4b5563; line-height: 1.6;">
                                Hello! An administrator has created a HeroOS account for you. 
                                You can now access the system using the credentials below.
                            </p>
                            
                            <div class="credentials-box">
                                <div class="credential-item">
                                    <div class="credential-label">Username</div>
                                    <div class="credential-value">${username}</div>
                                </div>
                                <div class="credential-item">
                                    <div class="credential-label">Temporary Password</div>
                                    <div class="credential-value">${tempPassword}</div>
                                </div>
                            </div>

                            <div class="warning-box">
                                <strong style="color: #92400e;">⚠️ Security Notice:</strong><br>
                                <span style="color: #78350f;">Please change your password after your first login for security purposes.</span>
                            </div>

                            <p style="color: #4b5563; line-height: 1.6;">
                                <strong>What you can do with HeroOS:</strong>
                            </p>
                            <ul style="color: #4b5563; line-height: 1.8;">
                                <li>Manage your files securely in the cloud</li>
                                <li>Customize your desktop experience</li>
                                <li>Access productivity applications</li>
                                <li>Collaborate with your team</li>
                            </ul>

                            <center>
                                <a href="http://localhost:5173" class="cta-button">Access HeroOS Now →</a>
                            </center>
                        </div>
                        <div class="footer">
                            <p>If you didn't expect this email, please contact your system administrator.</p>
                            <p>© ${new Date().getFullYear()} HeroOS - Vibe Edition</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (err) {
            console.error('Email send error:', err);
        }
    }

    async sendAccountUpdatedEmail(userEmail, username, changes) {
        if (!this.transporter) return;

        const changesList = Object.keys(changes).map(key => `<li>${key}: Updated</li>`).join('');

        const mailOptions = {
            from: `"HeroOS System" <${this.config.user}>`,
            to: userEmail,
            subject: '🔔 HeroOS Account Updated',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 40px 30px; text-align: center; color: white; }
                        .content { padding: 40px 30px; }
                        .changes-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔔 Account Updated</h1>
                        </div>
                        <div class="content">
                            <h2 style="color: #1f2937; margin-top: 0;">Your Account Has Been Modified</h2>
                            <p style="color: #4b5563; line-height: 1.6;">
                                Hello <strong>${username}</strong>, your HeroOS account has been updated by an administrator.
                            </p>
                            
                            <div class="changes-box">
                                <strong style="color: #1e40af;">Changes Made:</strong>
                                <ul style="color: #4b5563; margin-top: 10px;">
                                    ${changesList}
                                </ul>
                            </div>

                            <p style="color: #4b5563; line-height: 1.6;">
                                If you didn't request these changes or have concerns, please contact your system administrator immediately.
                            </p>
                        </div>
                        <div class="footer">
                            <p>This is an automated notification from HeroOS System</p>
                            <p>© ${new Date().getFullYear()} HeroOS - Vibe Edition</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (err) {
            console.error('Email send error:', err);
        }
    }

    async sendAccountDeletedEmail(userEmail, username) {
        if (!this.transporter) return;

        const mailOptions = {
            from: `"HeroOS System" <${this.config.user}>`,
            to: userEmail,
            subject: '⚠️ HeroOS Account Deleted',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center; color: white; }
                        .content { padding: 40px 30px; }
                        .warning-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⚠️ Account Deleted</h1>
                        </div>
                        <div class="content">
                            <h2 style="color: #1f2937; margin-top: 0;">Your HeroOS Account Has Been Removed</h2>
                            <p style="color: #4b5563; line-height: 1.6;">
                                Hello <strong>${username}</strong>, your HeroOS account has been deleted by a system administrator.
                            </p>
                            
                            <div class="warning-box">
                                <strong style="color: #991b1b;">Important Information:</strong>
                                <ul style="color: #4b5563; margin-top: 10px;">
                                    <li>Your account access has been revoked</li>
                                    <li>All associated files have been removed</li>
                                    <li>This action cannot be undone</li>
                                </ul>
                            </div>

                            <p style="color: #4b5563; line-height: 1.6;">
                                If you believe this was done in error, please contact your system administrator for assistance.
                            </p>
                        </div>
                        <div class="footer">
                            <p>This is an automated notification from HeroOS System</p>
                            <p>© ${new Date().getFullYear()} HeroOS - Vibe Edition</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (err) {
            console.error('Email send error:', err);
        }
    }

    async sendPasswordResetEmail(userEmail, username, newPassword) {
        if (!this.transporter) return;

        const mailOptions = {
            from: `"HeroOS System" <${this.config.user}>`,
            to: userEmail,
            subject: '🔑 HeroOS Password Reset',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; color: white; }
                        .content { padding: 40px 30px; }
                        .password-box { background: #fffbeb; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                        .password-value { color: #1f2937; font-size: 24px; font-family: monospace; background: white; padding: 12px 20px; border-radius: 4px; display: inline-block; margin-top: 10px; letter-spacing: 2px; }
                        .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔑 Password Reset</h1>
                        </div>
                        <div class="content">
                            <h2 style="color: #1f2937; margin-top: 0;">Your Password Has Been Reset</h2>
                            <p style="color: #4b5563; line-height: 1.6;">
                                Hello <strong>${username}</strong>, an administrator has reset your HeroOS account password.
                            </p>
                            
                            <div class="password-box">
                                <div style="color: #92400e; font-weight: bold; font-size: 12px; text-transform: uppercase;">New Temporary Password</div>
                                <div class="password-value">${newPassword}</div>
                            </div>

                            <p style="color: #dc2626; background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
                                <strong>⚠️ Important:</strong> Please change this password immediately after logging in for security purposes.
                            </p>

                            <p style="color: #4b5563; line-height: 1.6;">
                                To change your password:
                            </p>
                            <ol style="color: #4b5563; line-height: 1.8;">
                                <li>Log in to HeroOS with your new password</li>
                                <li>Go to Settings → Accounts</li>
                                <li>Navigate to Security Settings</li>
                                <li>Enter your new password</li>
                            </ol>
                        </div>
                        <div class="footer">
                            <p>If you didn't request this password reset, contact your administrator immediately.</p>
                            <p>© ${new Date().getFullYear()} HeroOS - Vibe Edition</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (err) {
            console.error('Email send error:', err);
        }
    }

    async sendStorageAlertEmail(userEmail, username, usedPercentage, usedGB, totalGB) {
        if (!this.transporter) return;

        const alertLevel = usedPercentage >= 100 ? 'critical' : usedPercentage >= 90 ? 'danger' : usedPercentage >= 75 ? 'warning' : 'info';
        const colors = {
            critical: { bg: '#dc2626', light: '#fef2f2', border: '#ef4444' },
            danger: { bg: '#ea580c', light: '#fff7ed', border: '#f97316' },
            warning: { bg: '#f59e0b', light: '#fffbeb', border: '#fbbf24' },
            info: { bg: '#3b82f6', light: '#eff6ff', border: '#60a5fa' }
        };
        const color = colors[alertLevel];

        const mailOptions = {
            from: `"HeroOS System" <${this.config.user}>`,
            to: userEmail,
            subject: `${usedPercentage >= 100 ? '🚨' : usedPercentage >= 90 ? '⚠️' : '📊'} Storage Alert: ${usedPercentage}% Used`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, ${color.bg} 0%, ${color.bg}dd 100%); padding: 40px 30px; text-align: center; color: white; }
                        .content { padding: 40px 30px; }
                        .alert-box { background: ${color.light}; border: 2px solid ${color.border}; padding: 20px; border-radius: 12px; margin: 20px 0; }
                        .progress-bar { width: 100%; height: 30px; background: #e5e7eb; border-radius: 15px; overflow: hidden; margin: 20px 0; }
                        .progress-fill { height: 100%; background: linear-gradient(90deg, ${color.bg} 0%, ${color.border} 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; }
                        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .stat-card { background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb; }
                        .stat-value { font-size: 24px; font-weight: bold; color: ${color.bg}; }
                        .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-top: 5px; }
                        .cta-button { display: inline-block; background: ${color.bg}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                        .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>${usedPercentage >= 100 ? '🚨 Storage Full!' : usedPercentage >= 90 ? '⚠️ Storage Critical' : '📊 Storage Alert'}</h1>
                        </div>
                        <div class="content">
                            <h2 style="color: #1f2937; margin-top: 0;">Hello ${username},</h2>
                            <p style="color: #4b5563; line-height: 1.6;">
                                Your HeroOS storage is at <strong>${usedPercentage}%</strong> capacity. 
                                ${usedPercentage >= 100 ? 'You have reached your storage limit and cannot upload new files.' :
                    usedPercentage >= 90 ? 'You are running critically low on storage space.' :
                        'You are approaching your storage limit.'}
                            </p>
                            
                            <div class="alert-box">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.min(usedPercentage, 100)}%;">
                                        ${usedPercentage}%
                                    </div>
                                </div>
                                
                                <div class="stat-grid">
                                    <div class="stat-card">
                                        <div class="stat-value">${usedGB.toFixed(2)} GB</div>
                                        <div class="stat-label">Used</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-value">${(totalGB - usedGB).toFixed(2)} GB</div>
                                        <div class="stat-label">Available</div>
                                    </div>
                                </div>
                            </div>

                            <h3 style="color: #1f2937; margin-top: 30px;">📋 Recommended Actions:</h3>
                            <ul style="color: #4b5563; line-height: 1.8;">
                                <li>Delete unnecessary files from your storage</li>
                                <li>Empty your recycle bin to free up space</li>
                                <li>Download and archive old files locally</li>
                                ${usedPercentage >= 90 ? '<li><strong>Contact your administrator for storage upgrade</strong></li>' : ''}
                            </ul>

                            <center>
                                <a href="http://localhost:5173" class="cta-button">Manage Storage →</a>
                            </center>
                        </div>
                        <div class="footer">
                            <p>This is an automated storage alert from HeroOS System</p>
                            <p>© ${new Date().getFullYear()} HeroOS - Vibe Edition</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (err) {
            console.error('Email send error:', err);
        }
    }

    async sendBroadcastEmail(recipients, subject, message, senderName = 'HeroOS Admin') {
        if (!this.transporter) return;

        const mailOptions = {
            from: `"${senderName}" <${this.config.user}>`,
            bcc: recipients, // Use BCC for privacy
            subject: `📢 ${subject}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 50px 30px; text-align: center; color: white; position: relative; overflow: hidden; }
                        .header::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); animation: pulse 3s ease-in-out infinite; }
                        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.8; } }
                        .header h1 { position: relative; z-index: 1; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 2px; }
                        .content { padding: 40px 30px; }
                        .message-box { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #3b82f6; padding: 25px; border-radius: 8px; margin: 20px 0; line-height: 1.8; color: #1e40af; }
                        .badge { display: inline-block; background: #8b5cf6; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }
                        .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📢 Announcement</h1>
                        </div>
                        <div class="content">
                            <div class="badge">Broadcast Message</div>
                            <h2 style="color: #1f2937; margin-top: 0;">${subject}</h2>
                            <div class="message-box">
                                ${message.replace(/\n/g, '<br>')}
                            </div>
                            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                                This message was sent by <strong>${senderName}</strong> to all HeroOS users.
                            </p>
                        </div>
                        <div class="footer">
                            <p>You received this message because you are a HeroOS user</p>
                            <p>© ${new Date().getFullYear()} HeroOS - Vibe Edition</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (err) {
            console.error('Email send error:', err);
        }
    }

    async sendNewsletterEmail(recipients, title, content, imageUrl = null) {
        if (!this.transporter) return;

        const mailOptions = {
            from: `"HeroOS Newsletter" <${this.config.user}>`,
            bcc: recipients,
            subject: `📰 ${title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 30px; text-align: center; color: white; }
                        .logo { font-size: 36px; font-weight: 200; letter-spacing: 3px; margin-bottom: 10px; }
                        .tagline { font-size: 14px; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; }
                        .hero-image { width: 100%; height: 250px; object-fit: cover; }
                        .content { padding: 40px 30px; }
                        .article-title { font-size: 28px; color: #1f2937; margin: 0 0 20px 0; font-weight: 600; line-height: 1.3; }
                        .article-content { color: #4b5563; line-height: 1.8; font-size: 16px; }
                        .divider { height: 1px; background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%); margin: 30px 0; }
                        .cta-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
                        .cta-button { display: inline-block; background: white; color: #667eea; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px; }
                        .footer { background: #0f172a; padding: 30px; text-align: center; color: #94a3b8; }
                        .social-links { margin: 20px 0; }
                        .social-links a { display: inline-block; width: 40px; height: 40px; background: #1e293b; border-radius: 50%; margin: 0 5px; line-height: 40px; color: #94a3b8; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">HeroOS</div>
                            <div class="tagline">Newsletter</div>
                        </div>
                        ${imageUrl ? `<img src="${imageUrl}" alt="Newsletter" class="hero-image">` : ''}
                        <div class="content">
                            <h1 class="article-title">${title}</h1>
                            <div class="article-content">
                                ${content.replace(/\n\n/g, '</p><p style="color: #4b5563; line-height: 1.8; font-size: 16px;">').replace(/\n/g, '<br>')}
                            </div>
                            
                            <div class="divider"></div>
                            
                            <div class="cta-box">
                                <h3 style="color: white; margin: 0 0 10px 0;">Ready to explore more?</h3>
                                <p style="color: rgba(255,255,255,0.9); margin: 0;">Access your HeroOS dashboard and discover new features</p>
                                <a href="http://localhost:5173" class="cta-button">Open HeroOS →</a>
                            </div>
                        </div>
                        <div class="footer">
                            <div class="social-links">
                                <a href="#">f</a>
                                <a href="#">t</a>
                                <a href="#">in</a>
                                <a href="#">ig</a>
                            </div>
                            <p style="font-size: 12px; margin: 10px 0;">You're receiving this because you're a valued HeroOS user</p>
                            <p style="font-size: 12px; margin: 10px 0;">© ${new Date().getFullYear()} HeroOS - Vibe Edition. All rights reserved.</p>
                            <p style="font-size: 11px; color: #64748b; margin-top: 20px;">
                                <a href="#" style="color: #64748b; text-decoration: none;">Unsubscribe</a> | 
                                <a href="#" style="color: #64748b; text-decoration: none;">Preferences</a>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (err) {
            console.error('Email send error:', err);
        }
    }

    async sendSupportEmail(data) {
        if (!this.transporter) return;

        const { name, email, subject, message, type } = data;

        const mailOptions = {
            from: `"HeroOS Support" <${this.config.user}>`,
            to: this.config.user, // Send to admin
            replyTo: email,
            subject: `🆘 New Support Request: ${subject}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; color: white; }
                        .content { padding: 40px 30px; }
                        .field-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .label { font-size: 11px; text-transform: uppercase; color: #059669; font-weight: bold; margin-bottom: 5px; }
                        .value { font-size: 15px; color: #1f2937; }
                        .message-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-top: 20px; }
                        .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🆘 Support Request</h1>
                        </div>
                        <div class="content">
                            <h2 style="color: #1f2937; margin-top: 0;">New Issue Reported</h2>
                            <p style="color: #4b5563; line-height: 1.6;">
                                A user has submitted a new support request via HeroOS Support.
                            </p>
                            
                            <div class="field-box">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                    <div>
                                        <div class="label">Reporter Name</div>
                                        <div class="value">${name}</div>
                                    </div>
                                    <div>
                                        <div class="label">Email Address</div>
                                        <div class="value">${email}</div>
                                    </div>
                                    <div style="grid-column: span 2; margin-top: 10px;">
                                        <div class="label">Issue Type</div>
                                        <div class="value" style="display: inline-block; background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${type || 'General Inquiry'}</div>
                                    </div>
                                </div>
                            </div>

                            <div class="message-box">
                                <div class="label" style="color: #6b7280; margin-bottom: 10px;">Message Content</div>
                                <div style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</div>
                            </div>

                            <p style="color: #6b7280; font-size: 13px; margin-top: 20px; text-align: center;">
                                Reply to this email to contact the user directly.
                            </p>
                        </div>
                        <div class="footer">
                            <p>Submitted via HeroOS Support System</p>
                            <p>© ${new Date().getFullYear()} HeroOS - Version 0.1.0 (Beta)</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (err) {
            console.error('Email send error:', err);
            return false;
        }
    }
}

export const emailService = new EmailService();
