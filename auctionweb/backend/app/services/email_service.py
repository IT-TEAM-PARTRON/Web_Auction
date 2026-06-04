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
    def send_auction_invitation_email(self, emails: list[str], auction_title: str, auction_id: str, auction_start_time: str, auction_end_time: str, lang: str = "en") -> bool:
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
                    subject_en = "Auction System | Partron Vina - Invitation to Join Auction"
                    subject_vi = "Auction System | Partron Vina - Thư Mời Tham Gia Đấu Giá"
                    msg['Subject'] = subject_vi if lang == "vi" else subject_en

                    if lang == "vi":
                        text_body = f"""
                      Kính gửi Quý Nhà Cung Cấp/Khách Hàng,

                      Chúng tôi là CÔNG TY TNHH PARTRON VINA.
                      
                      Địa chỉ: Lô 11, KCN Khai Quang, Phường Khai Quang, TP. Vĩnh Yên, Tỉnh Vĩnh Phúc, Việt Nam

                      Chúng tôi hiện đang tổ chức một phiên đấu giá và trân trọng kính mời Quý vị tham gia dự thầu.

                      Thông tin gói thầu: {auction_title}
                      Thời gian bắt đầu: {auction_start_time}
                      Thời gian kết thúc: {auction_end_time}

                      Thông tin chi tiết về gói thầu có thể xem tại website sau:
                      {auction_link}

                      Chúng tôi rất mong nhận được sự tham gia của Quý vị.
                      Xin trân trọng cảm ơn!
                      -----------------------------------------------
                      Đây là email tự động, vui lòng không phản hồi.
                      """
                        html_body = f"""
                    <html>
                      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                          <h2 style="color: #ef4444; margin: 0;">Thư Mời Dự Thầu</h2>
                        </div>
                        
                        <p>Kính gửi Quý Nhà Cung Cấp/Khách Hàng,</p>
                        <p>Chúng tôi là <strong>CÔNG TY TNHH PARTRON VINA.</strong><br/>
                        Địa chỉ: Lô 11, KCN Khai Quang, Phường Khai Quang, TP. Vĩnh Yên, Tỉnh Vĩnh Phúc, Việt Nam</p>
                        
                        <p>Chúng tôi hiện đang tổ chức một phiên đấu giá và trân trọng kính mời Quý vị tham gia dự thầu.</p>
                        
                        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f3f4f6;">
                          <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Thông tin gói thầu:</strong></td>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111;">{auction_title}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Thời gian bắt đầu:</strong></td>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111;">{auction_start_time}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;"><strong>Thời gian kết thúc:</strong></td>
                              <td style="padding: 8px 0; color: #111;">{auction_end_time}</td>
                            </tr>
                          </table>
                        </div>
                        
                        <p style="text-align: center; margin-top: 10px;">Thông tin chi tiết về gói thầu có thể xem bằng cách nhấn vào nút bên dưới:</p>
                        
                        <div style="text-align: center; margin: 10px 0;">
                          <a href="{auction_link}" style="background-color: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);">XEM CHI TIẾT GÓI THẦU</a>
                        </div>
                        
                        <p style="font-size: 14px; margin-top: 20px;">Chúng tôi rất mong nhận được sự tham gia của Quý vị.</p>
                        <p style="font-size: 14px;">Xin trân trọng cảm ơn!</p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">Đây là email tự động, vui lòng không phản hồi.</p>
                      </body>
                    </html>
                    """
                    else:
                        # Nội dung email dạng Plain Text
                        text_body = f"""
                      Dear Suppliers/Customers,

                      We are PARTRON VINA CO., LTD.
                      
                      Address: Lot 11, Khai Quang Industrial Zone, Vinh Phuc Ward, Phu Tho Province, Vietnam

                      We are currently holding a tender and respectfully invite you to participate in the bidding.

                      Tender Package Information: {auction_title}
                      Start Time: {auction_start_time}
                      End Time: {auction_end_time}

                      Detailed information about the tender package can be found at the following website:
                      {auction_link}

                      We look forward to your participation.
                      Thank you!
                      -----------------------------------------------
                      This is an automated email, please do not reply.
                      """
                        html_body = f"""
                    <html>
                      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                          <h2 style="color: #ef4444; margin: 0;">Tender Invitation</h2>
                        </div>
                        
                        <p>Dear Suppliers/Customers,</p>
                        <p>We are <strong>PARTRON VINA CO., LTD.</strong><br/>
                        Address: Lot 11, Khai Quang Industrial Zone, Vinh Phuc Ward, Phu Tho Province, Vietnam</p>
                        
                        <p>We are currently holding a tender and respectfully invite you to participate in the bidding.</p>
                        
                        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f3f4f6;">
                          <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Tender Package Information:</strong></td>
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
                        
                        <p style="text-align: center; margin-top: 10px;">Detailed information about the tender package can be found by clicking the button below:</p>
                        
                        <div style="text-align: center; margin: 10px 0;">
                          <a href="{auction_link}" style="background-color: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);">VIEW TENDER DETAILS</a>
                        </div>
                        
                        <p style="font-size: 14px; margin-top: 20px;">We look forward to your participation.</p>
                        <p style="font-size: 14px;">Thank you!</p>
                        
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