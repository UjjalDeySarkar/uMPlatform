from django.core.mail import send_mail
from django.conf import settings

def send_welcome_email(toEmail, pSubject, pMessage):
    subject = pSubject
    message = pMessage
    recipient_email = toEmail
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [recipient_email],
        fail_silently=False,
    )
