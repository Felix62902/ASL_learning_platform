from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Lesson, UnlockedLesson

User = get_user_model()

@receiver(post_save, sender=User)
def unlock_free_lessons_for_new_user(sender, instance, created, **kwargs):
    """
    This signal is triggered every time a User object is saved.
    If the user was just created, it unlocks all lessons without unlock cost.
    """
    if created: # Only run this logic if a new user was just created
        free_lessons = Lesson.objects.filter(unlock_cost=0)
        for lesson in free_lessons:
            # Create the unlocked lesson record for the new user
            UnlockedLesson.objects.get_or_create(user=instance, lesson=lesson)