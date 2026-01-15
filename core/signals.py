from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from .models import SystemEvent

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    if user:
        SystemEvent.log(
            event_type='USER_LOGIN',
            category=SystemEvent.EventCategory.SECURITY,
            actor=user,
            description=f"User {user.username} logged in",
            request=request
        )

@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    if user:
        SystemEvent.log(
            event_type='USER_LOGOUT',
            category=SystemEvent.EventCategory.SECURITY,
            actor=user,
            description=f"User {user.username} logged out",
            request=request
        )
