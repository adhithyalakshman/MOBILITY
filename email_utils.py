import aiosmtplib
from email.message import EmailMessage
import random
from fastapi import HTTPException
import os
from dotenv import load_dotenv
load_dotenv()

# Microsoft 365 Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = os.getenv("SMTP_PORT")
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


async def send_otp_email(to_email: str, otp: str, subject="Your Verification Code"):
    message = EmailMessage()
    message["From"] = SMTP_USERNAME
    message["To"] = to_email
    message["Subject"] = subject

    body = f"""
    <html>
        <body>
            <h2>Verification Required</h2>
            <p>Your OTP code is: <b>{otp}</b></p>
            <p>This code is valid for 2 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        </body>
    </html>
    """
    message.set_content(body, subtype="html")

    try:
        await aiosmtplib.send(
            message,
            hostname=SMTP_SERVER,
            port=SMTP_PORT,
            username=SMTP_USERNAME,
            password=SMTP_PASSWORD,
            start_tls=True
        )
    except Exception as e:
        print(f"Failed to send email: {e}")
        # In production, log this error propertly
        raise HTTPException(status_code=500, detail="Failed to send email")