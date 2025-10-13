from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Category, Lesson, UserProgress, UnlockedLesson, WordOfTheDay
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# model serializer auto genearate field based on model, handles validations and can be used to create or update

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Customizes the JWT token creation process to allow login with email. Overriding default fields to accept email instead of username
    email = serializers.EmailField(required=True)
    password = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop('username', None)


    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            # Find the user by their email address (case-insensitive)
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("No active account found with the given credentials")
        if not user.check_password(password):
             raise serializers.ValidationError("No active account found with the given credentials")
        # If credentials are valid, proceed to get the token
        refresh = self.get_token(user)

        # add extra user data to the response 
        data = {}
        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)

        data["username"] = user.username
        return data

# Registration use
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password","email","left_handed"] # fields exposed in the API
        extra_kwargs = {"password": {"write_only": True}} #accept password from user but not return password when giving info to user

    def create(self, validated_data): # override create() to safely hash passsword using create_user
        user= User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            left_handed = validated_data['left_handed']
        ) # create user, splitting kwargs
        return user

# GET user information
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", 
            "username", 
            "email", 
            "total_points", 
            "current_streak",     
            "last_streak_date",  
            "date_joined",
            'left_handed'
        ]

        read_only_fields = [
            "id", 
            "total_points", 
            "current_streak", 
            "last_streak_date", 
            "date_joined"
        ]

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

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Your old password was entered incorrectly. Please enter it again.")
        return value

    def validate(self, data):
        if data['old_password'] == data['new_password']:
            raise serializers.ValidationError("New password must be different from the old password.")
        return data

    def save(self, **kwargs):
        password = self.validated_data['new_password']
        user = self.context['request'].user
        user.set_password(password)
        user.save()
        return user

    
class UnlockedLessonSerializer(serializers.ModelSerializer):
    #  see the full lesson details, not just the ID.
    lesson = LessonSerializer(read_only=True)
    # When writing (creating),  only need the client to send us the lesson's ID.
    lesson_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = UnlockedLesson
        fields = ["id", "user", "lesson", "lesson_id", "unlocked_at"]
        read_only_fields = ['user', 'unlocked_at', 'lesson']

    
class WordOfTheDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = WordOfTheDay
        fields = ["word","date"]