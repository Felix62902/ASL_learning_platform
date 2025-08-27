from django.contrib import admin
from .models import User, Category, Lesson, UserProgress, UnlockedLesson

# Register your models here.
admin.site.register(User)
admin.site.register(Category)
admin.site.register(Lesson)
admin.site.register(UserProgress)
admin.site.register(UnlockedLesson)