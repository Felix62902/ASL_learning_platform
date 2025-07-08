from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Category, Lesson, UserProgress, SavedLesson

User = get_user_model()

# Serializer, can be used for both POST and GET request
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password","email"]
        extra_kwargs = {"password": {"write_only": True}} #accept password from user but not return password when giving info to user

    def create(self, validated_data):
        user= User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        ) # create user, splitting kwargs
        return user

class LessonSerializer(serializers.ModelSerializer):
    # show the category's name to make the API more readable
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Lesson
        fields = [
            "id", 
            "sign_name", 
            "description", 
            "unlock_cost", 
            "completion_points",
            "category", # This will be the category ID
            "category_name" # This provides the readable name
        ]

class CategorySerializer(serializers.ModelSerializer):
    #  use StringRelatedField to show a list of lesson names.
    lessons = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "description", "order_index", "lessons"]

# view only for user progress
class UserProgressSerializer(serializers.ModelSerializer):
    # Nesting the full lesson details provides a rich response.
    lesson = LessonSerializer(read_only=True)
    
    class Meta:
        model = UserProgress
        fields = ["id","user", "lesson", "last_practiced_at"]
        extra_kwargs = {"user":{"read_only":True},"lesson":{"read_only":True},"last_practiced_at":{"read_only":True}} # not allow user to select which user saved the progress

#  for viewing a user's list of saved/favorite lessons.
class SavedLessonSerializer(serializers.ModelSerializer):
    lesson = LessonSerializer(read_only=True)
    
    class Meta:
        model = SavedLesson
        fields = ["id","user", "lesson", "saved_at","lesson_id"]
        read_only_fields = ['user', 'saved_at']
    lesson_id = serializers.IntegerField(write_only=True)

    def create(self, validated_data):
        lesson_id = validated_data.pop('lesson_id')
        lesson = Lesson.objects.get(id=lesson_id)
        # Create the saved lesson instance
        instance = SavedLesson.objects.create(lesson=lesson, **validated_data)
        return instance