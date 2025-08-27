from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Usage: from django.contrib.auth import get_user_model, then set User = get_user_model()
    # can already get username, email, password, first_name, last_name, etc. from AbstractUser, only need to add custom Fields
    total_points = models.IntegerField(default=0)
    current_streak = models.IntegerField(default = 0)
    last_streak_date = models.DateField(null=True, blank = True)
    # profile_pic_url = models.URLField(max_length=512, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    left_handed = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class Category(models.Model):
    name = models.CharField(max_length=128, unique=True)
    description = models.TextField() 
    order_index = models.IntegerField(unique=True)

    class Meta:
        verbose_name_plural ="Categories "

    def __str__(self):
        return self.name

class Lesson(models.Model):
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="lessons")
    sign_name = models.CharField(max_length=100) 
    description = models.TextField()
    unlock_cost = models.IntegerField(default=100, null=True, blank=True)
    completion_points = models.IntegerField(default=50)
    
    def __str__(self):
        return self.sign_name

class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="progress_records")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="user_progress")
    last_practiced_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Ensures a user can only have one progress entry per lesson
        unique_together = ('user', 'lesson')

class UnlockedLesson(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="unlocked_lessons")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'lesson')
