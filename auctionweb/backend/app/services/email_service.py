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

    #Gửi 1 lần cho all user tham gia
    # def send_auction_invitation_email(self, emails: list[str], auction_title: str, auction_id: str, auction_start_time: str, auction_end_time: str) -> bool:
    #     """
    #     Gửi email mời tham gia đấu giá cho nhiều user trong 1 lần gửi.
    #     """
    #     try:
    #         if not emails:
    #             print("List email  NULL.")
    #             return False
    #         # Tạo email
    #         msg = MIMEMultipart()
    #         msg['From'] = self.sender_email
    #         msg['To'] = self.sender_email  
    #         msg['Bcc'] = ", ".join(emails)
    #         msg['Subject'] = f"Auction System | Partron Vina - Invitation to Join Auction"

    #         # Link đấu giá
    #         auction_link = f"{self.app_domain}/auctions/{auction_id}"

    #         # Nội dung email
    #         body = f"""
    #         Dear Participant,

    #         You have been invited to participate in the auction:

    #         Auction Name: {auction_title}
    #         Start Time: {auction_start_time}
    #         End Time: {auction_end_time}

    #         Click the link below to view the auction and place your bids:
    #         {auction_link}

    #         If you have any questions, please contact our support team.
    #         IT Team
            
    #         -----------------------------------------------
    #         This is an automated email, please do not reply.
    #         """

    #         msg.attach(MIMEText(body, 'plain'))

    #         # Gửi email
    #         if self.sender_email and self.sender_password:
    #             server = smtplib.SMTP(self.smtp_server, self.smtp_port)
    #             server.starttls()
    #             server.login(self.sender_email, self.sender_password)
    #             server.sendmail(self.sender_email, emails, msg.as_string())
    #             server.quit()

    #             print(f"Đã gửi email mời đấu giá tới {len(emails)} người.")
    #             return True
    #         else:
    #             print("Thiếu cấu hình SMTP.")
    #             return False

    #     except Exception as e:
    #         print(f"Lỗi gửi email mời đấu giá: {e}")
    #         return False
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
                    msg = MIMEMultipart()
                    msg['From'] = self.sender_email
                    msg['To'] = email
                    msg['Subject'] = "Auction System | Partron Vina - Invitation to Join Auction"

                    # Nội dung email
                    body = f"""
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

                    msg.attach(MIMEText(body, 'plain'))
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