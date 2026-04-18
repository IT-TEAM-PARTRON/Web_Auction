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

    #Gửi lần lượt cho all user tham gia
    def send_auction_invitation_email(self, emails: list[str], auction_title: str, auction_id: str, auction_start_time: str, auction_end_time: str) -> bool:
        """
        Gửi email mời tham gia đấu giá cho từng user riêng biệt (không gửi chung 1 mail).
        """
        try:
            if not emails:
                print("Danh sách email rỗng.")
                return False

            if not self.sender_email or not self.sender_password:
                print("Thiếu cấu hình SMTP.")
                return False

            # Tạo link đấu giá
            auction_link = f"{self.app_domain}/auctions/{auction_id}"

            # Kết nối SMTP 1 lần để tối ưu hiệu suất
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.sender_email, self.sender_password)

            # Gửi lần lượt cho từng người
            for email in emails:
                try:
                    msg = MIMEMultipart('alternative')
                    msg['From'] = self.sender_email
                    msg['To'] = email
                    msg['Subject'] = "Auction System | Partron Vina - Invitation to Join Auction"

                    # Nội dung email dạng Plain Text
                    text_body = f"""
                    Dear Participant,

                    You have been invited to participate in the auction:

                    Auction Name: {auction_title}
                    Start Time: {auction_start_time}
                    End Time: {auction_end_time}

                    Click the link below to view the auction and place your bids:
                    {auction_link}

                    If you have any questions, please contact our support team.
                    IT Team

                    -----------------------------------------------
                    This is an automated email, please do not reply.
                    """
                    html_body = f"""
                    <html>
                      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                          <h2 style="color: #ef4444; margin: 0;">Auction Invitation</h2>
                        </div>
                        <p>Dear Participant,</p>
                        <p>You have been invited to participate in the following auction:</p>
                        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f3f4f6;">
                          <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Auction Name:</strong></td>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111;">{auction_title}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Start Time:</strong></td>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111;">{auction_start_time}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;"><strong>End Time:</strong></td>
                              <td style="padding: 8px 0; color: #111;">{auction_end_time}</td>
                            </tr>
                          </table>
                        </div>
                        <p style="text-align: center; margin-top: 10px;">Click the button below to view the auction details and place your bids:</p>
                        <div style="text-align: center; margin: 10px 0;">
                          <a href="{auction_link}" style="background-color: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);">JOIN AUCTION</a>
                        </div>
                        <p style="font-size: 14px; color: #666; margin-top: 10px;">If you have any questions, please contact our support team.</p>
                        <p style="font-size: 14px; color: #666;">Best regards,<br/><strong>IT Team</strong></p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">This is an automated email, please do not reply.</p>
                      </body>
                    </html>
                    """

                    msg.attach(MIMEText(text_body, 'plain'))
                    msg.attach(MIMEText(html_body, 'html'))
                    server.sendmail(self.sender_email, email, msg.as_string())

                    print(f"Đã gửi email mời đấu giá tới: {email}")

                except Exception as single_e:
                    print(f"Lỗi gửi email tới {email}: {single_e}")
                    continue  # Bỏ qua email lỗi, tiếp tục gửi cho những người khác

            server.quit()
            return True

        except Exception as e:
            print(f"Lỗi gửi email mời đấu giá: {e}")
            return False

# Tạo instance global
email_service = EmailService()