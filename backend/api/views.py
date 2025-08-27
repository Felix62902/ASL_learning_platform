from django.shortcuts import render
from django.contrib.auth import get_user_model

from rest_framework.views import APIView
from rest_framework import generics, viewsets, status
from .serializers import UserSerializer, CategorySerializer, LessonSerializer,ChangePasswordSerializer, UserProgressSerializer, UnlockedLessonSerializer, MyTokenObtainPairSerializer, UserProfileSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Category, Lesson, UserProgress, UnlockedLesson
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .filters import LessonFilter
from datetime import date, timedelta


User = get_user_model()

#Get: ListAPIView, RetrieveAPIView, PUT: UpdateAPIView DELETE: DestroyAPIView
# pre-built Python classes that provide the backend logic for  API.

#API view gives full control over HTTP method (GET/POST)
# GENERICAPIView + Mixin gives partial automation plus ability to override specific methods
# genericAPI VIEW is for fast automatic CRUD operations

# this is used for validating user when  logging
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# POST - View for creating a new User
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()  # provide the data to be worked on
    serializer_class = UserSerializer # used when needing to validate incoming data or prepare outgoing data
    permission_classes = [AllowAny]

# GET - User information , automatically reset streaks if exceeding one day for not practicing
class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        # reset user streak if havnet practiced form >1 day
        if user.last_streak_date and (date.today() - user.last_streak_date).days > 1:
            user.current_streak = 0
            user.save(update_fields=['current_streak'])
        return self.request.user
    

# PUT - This view  handle the logic for updating the user's profile. (from the settings page)
class UserProfileUpdateView(generics.UpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # This method returns the user object to be updated.
        return self.request.user

# GET obtain list of categories
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny] # allow any or isautenticated, depending whether to provide snippet to non-authenticated users


# GET obtain list of lesson
class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [AllowAny] # allow any or isautenticated, depending whether to provide snippet to non-authenticated users

    filterset_class = LessonFilter


# GET total number of lessons:
class TotalLessonsCountView(APIView):
    permission_classes= [AllowAny]

    def get(self, request, *args, **kwargs):
        # This is a very efficient database query to get the count.
        count = Lesson.objects.count()
        return Response({'total_lessons': count})

# POST  update user progress (points), which also updates the streak
class UserProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        user = request.user
        today = date.today()
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

        last_practice = user.last_streak_date

        # already practiced today, do nothing
        if last_practice == today:
            pass
        # conescutive day, continue streak
        elif last_practice and last_practice == today - timedelta(days=1):
            user.current_streak += 1
            user.last_streak_date = today
        else:
            user.current_streak = 1
            user.last_streak_date = today

        # Create or update the progress record
        progress, created = UserProgress.objects.get_or_create(user=user, lesson=lesson)
        progress.save()
        
        # Award points
        user.total_points += lesson.completion_points
        
        # This will save changes to total_points, current_streak, and last_streak_date
        user.save()

        return Response({"status": "progress saved"}, status=status.HTTP_200_OK)

# -------------------------Unlocked Lesson --------------------------------
# GET list of unlocked lesson
class UnlockedLessonListView(generics.ListAPIView):
    serializer_class = UnlockedLessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filters for the logged-in user's unlocked lessons
        return UnlockedLesson.objects.filter(user=self.request.user)

# POST This view handles the logic of unlocking a new lesson. 
class UnlockLessonView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id, format=None):
        user = request.user
        try:
            lesson_to_unlock = Lesson.objects.get(pk=lesson_id)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found."}, status=status.HTTP_404_NOT_FOUND)

        # 1. Check if the lesson is already unlocked
        if UnlockedLesson.objects.filter(user=user, lesson=lesson_to_unlock).exists():
            return Response({"message": "Lesson already unlocked."}, status=status.HTTP_200_OK)

        # 2. Check if the user has enough points
        if user.total_points < lesson_to_unlock.unlock_cost:
            return Response({"error": "Not enough points to unlock this lesson."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. If checks pass, perform the transaction
        # user.total_points -= lesson_to_unlock.unlock_cost
        user.save()

        UnlockedLesson.objects.create(user=user, lesson=lesson_to_unlock)

        return Response({"message": f"Lesson '{lesson_to_unlock.sign_name}' unlocked successfully!"}, status=status.HTTP_201_CREATED)


#  -------------- uSER Progress ---------------
# GET  retrieve a list of progress
class UserProgressListView(generics.ListAPIView):
    serializer_class = UserProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # for the currently logged-in user.
        return UserProgress.objects.filter(user=self.request.user)
    
# PUT update user password
class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    model = User
    permission_classes = [IsAuthenticated]

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
