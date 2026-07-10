import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any, Optional
import logging
from app.utils.scheduler import scheduler

logger = logging.getLogger("Atlas-One-Email")

# SMTP Server Configurations (Placeholder Defaults, Override in .env)
SMTP_HOST = os.getenv("ATLAS_ONE_SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("ATLAS_ONE_SMTP_PORT", "587"))
SMTP_USER = os.getenv("ATLAS_ONE_SMTP_USER", "your_smtp_email_here@gmail.com")
SMTP_PASSWORD = os.getenv("ATLAS_ONE_SMTP_PASSWORD", "your_smtp_app_password_here")
SENDER_EMAIL = os.getenv("ATLAS_ONE_SENDER_EMAIL", "atlas-one-noreply@atlasone.app")

class EmailEngine:
    @staticmethod
    def send_html_email(recipient: str, subject: str, html_content: str) -> bool:
        """Sends an HTML formatted email. Retries dynamically via background queue on connection failure."""
        if not SMTP_USER or "your_smtp" in SMTP_USER:
            logger.warning(f"Email check skipped for '{recipient}': SMTP credentials are not configured in environment.")
            return False

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = SENDER_EMAIL
            msg["To"] = recipient

            part = MIMEText(html_content, "html")
            msg.attach(part)

            # Establish secure SMTP connection
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SENDER_EMAIL, [recipient], msg.as_string())
            server.quit()
            
            logger.info(f"Email successfully sent to {recipient}: {subject}")
            return True
        except Exception as e:
            logger.error(f"Failed to dispatch email to {recipient}: {e}. Retrying via background scheduler.")
            return False

    @staticmethod
    def queue_reminder(recipient: str, reminder_type: str, details: Dict[str, Any]):
        """Place an email reminder in the background scheduler queue."""
        subject = f"🔔 Atlas One Reminder: {reminder_type.replace('_', ' ').title()}"
        
        # Render HTML template dynamically
        html = f"""
        <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #e4e4e7; padding: 24px; margin: 0;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #121214; border: 1px solid rgba(255,255,255,0.04); border-radius: 12px; padding: 32px; box-shadow: 0 12px 30px rgba(0,0,0,0.5);">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #ffffff; margin-top: 10px; margin-bottom: 0; font-weight: 700; letter-spacing: -0.02em;">Atlas One</h2>
                        <span style="font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Personal Analytics & Predictive Insights</span>
                    </div>
                    <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.04); margin-bottom: 24px;" />
                    <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                        Hi Bhanu, here is your scheduled notification alert:
                    </p>
                    <div style="background-color: rgba(255,255,255,0.01); border-left: 3px solid #6366f1; border-radius: 6px; padding: 18px; margin: 20px 0; border: 1px solid rgba(255,255,255,0.03);">
                        <h4 style="margin: 0 0 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">{reminder_type.replace('_', ' ').upper()} SYSTEM UPDATE</h4>
                        <p style="margin: 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">{details.get("message", "")}</p>
                    </div>
                    <p style="font-size: 11px; color: #71717a; margin-top: 28px; text-align: center;">
                        This is an automated system notification from your Atlas One dashboard.
                    </p>
                </div>
            </body>
        </html>
        """
        
        # Schedule the dispatch function
        def task():
            success = EmailEngine.send_html_email(recipient, subject, html)
            if not success:
                # Add to scheduler queue with 60 seconds backoff
                scheduler.add_task(
                    f"Retry-Email-{reminder_type}",
                    lambda: EmailEngine.send_html_email(recipient, subject, html),
                    delay_sec=60.0
                )

        scheduler.add_task(f"Send-Email-{reminder_type}", task)
