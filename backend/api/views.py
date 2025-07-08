from django.shortcuts import render
from django.contrib.auth import get_user_model

from rest_framework.views import APIView
from rest_framework import generics, viewsets, status
from .serializers import UserSerializer, CategorySerializer, LessonSerializer, UserProgressSerializer, SavedLessonSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Category, Lesson, UserProgress, SavedLesson
from rest_framework.response import Response


User = get_user_model()

#Get: ListAPIView, RetrieveAPIView, PUT: UpdateAPIView DELETE: DestroyAPIView
# pre-built Python classes that provide the backend logic for  API.

# View for creating a new User
class CreateUserView(generics.CreateAPIView):
    # generics.CreateAPIView already has CRUD defined, below are configurations settings
    # it can determine which parent method to call (CRUD) based on request type (POST, GET, etc)
    queryset = User.objects.all()  # provide the data to be worked on
    serializer_class = UserSerializer # used when needing to validate incoming data or prepare outgoing data
    permission_classes = [AllowAny]

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    # def get_queryset(self):
    #     return self.queryset
    
class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    # def get_queryset(self):
    #     return self.queryset

class UserProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        user =request.user
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        # get_or_create handles the logic automatically.
        # If a progress record exists, it gets it. If not, it creates it.
        progress, created = UserProgress.objects.get_or_create(user=user, lesson=lesson)

        # Update the record (e.g., increase mastery, award points)
        # For now, just saving it is enough to update the `last_practiced_at` timestamp
        progress.save()
        
        # Award points
        user.total_points += lesson.completion_points
        user.save(update_fields=['total_points'])

        return Response({"status": "progress saved"}, status=status.HTTP_200_OK)


# A single view to handle listing and creating saved lessons
class SavedLessonListCreateView(generics.ListCreateAPIView):
    serializer_class = SavedLessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        #  filters for the logged-in user's saved lessons
        return SavedLesson.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        #  saves the current user as the owner
        serializer.save(user=self.request.user)


class SavedLessonDestroyView(generics.DestroyAPIView):
    serializer_class = SavedLessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Correctly ensures users can only delete their own saved lessons
        return SavedLesson.objects.filter(user=self.request.user)