import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from dotenv import load_dotenv
load_dotenv()
class EmailService:
    def __init__(self):
        # Cấu hình SMTP từ environment variables
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.sender_email = os.getenv("SENDER_EMAIL", "")
        self.sender_password = os.getenv("SENDER_PASSWORD", "")
        self.app_domain = os.getenv("APP_DOMAIN", "http://localhost:3000")
        
    def send_reset_password_email(self, email: str, reset_token: str, username: str = None) -> bool:
        """
        Gửi email reset password
        
        Args:
            email: Email người nhận
            reset_token: Token để reset password
            username: Tên người dùng (optional)
            
        Returns:
            bool: True nếu gửi thành công, False nếu thất bại
        """
        try:
            # Tạo email
            msg = MIMEMultipart()
            msg['From'] = self.sender_email
            msg['To'] = email
            msg['Subject'] = "Reset Password - Auction System | Partron Vina"
            
            # Tạo link reset
            reset_link = f"{self.app_domain}/reset-password?token={reset_token}"
            
            # Nội dung email
            greeting = f"Hello {username}," if username else "Hello,"
            
            body = f"""
            {greeting}
            
            You have requested to reset your password for your Auction System account.
            
            Click the link below to reset your password:
            
            {reset_link}
            
            This link will expire in 1 hour for security reasons.

            If you didn't request this password reset, please ignore this email.

            Your password will remain unchanged.
            
            If you have any questions, please contact our support team.
            IT Team
            
            -----------------------------------------------
            This is an automated email, please do not reply.
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            # Gửi email
            if self.sender_email and self.sender_password:
                server = smtplib.SMTP(self.smtp_server, self.smtp_port)
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                text = msg.as_string()
                server.sendmail(self.sender_email, email, text)
                server.quit()
                print(f"Email reset password đã được gửi đến: {email}")
                return True
                
        except Exception as e:
            print(f"Error sending reset password email: {e}")
            return False
    
    
# Tạo instance global
email_service = EmailService() 