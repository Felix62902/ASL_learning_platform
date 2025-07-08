from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Usage: from django.contrib.auth import get_user_model, then set User = get_user_model()
    # can already get username, email, password, first_name, last_name, etc. from AbstractUser, only need to add custom Fields
    total_points = models.IntegerField(default=0)
    # profile_pic_url = models.URLField(max_length=512, blank=True, null=True)

    def __str__(self):
        return self.username

# class Categories():
#     name = models.CharField(max_length=128)
#     description = models.TextField(max_length=256)
#     order_index = models.IntegerField(unique=True)

# class Lessons():
#     category_id = models.ForeignKey(Categories.id, on_delete=models.SET_NULL, null=True, blank=True)
#     sign_name = models.TextField()
#     description = models.TextField()
#     unlock_cost = models.IntegerField(null=True,blank=True)
#     completion_points = models.IntegerField()
    
# class User_Progress():
#     user_id = models.ForeignKey(User.id)
#     lesson_id = models.ForeignKey(Lessons.id)
#     last_practiced_at = models.DateTimeField()

# class Saved_Lessons():
#     user_id = models.ForeignKey(User.id)
#     lesson_id = models.ForeignKey(Lessons.id)
#     saved_at = models.DateTimeField()