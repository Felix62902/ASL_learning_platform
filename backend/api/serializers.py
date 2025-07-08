from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

# Serializer for Creating a User
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

# Serializer for Viewing user 
class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"] # Do not display password,  Add total_points, etc. here later
