from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework_simplejwt.views import  TokenRefreshView
from .views import MyTokenObtainPairView

# using a router automatically generates full set of URLs including GET, POST, Put, DELETE for each endpoint
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category') # URL for fetching categories
router.register(r'lessons', views.LessonViewSet, basename='lesson') # URL for fetching lessons


urlpatterns = [
    # Include the router-generated URLs
    path('', include(router.urls)),
    #JWT tokens
    path("token/", MyTokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    # URL for user registration
    path('user/register/', views.CreateUserView.as_view(), name='register'),
    # URL for fetching user information
    path('user/profile/', views.UserProfileView.as_view(), name='user-profile'),
    # URL for updating user profile
     path('user/profile/update/', views.UserProfileUpdateView.as_view(), name='user-profile-update'),
    # URL for listing your saved lessons or saving a new one
    path('unlocked-lessons/', views.UnlockedLessonListView.as_view(), name='saved-lessons'),
    path('lessons/<int:lesson_id>/unlock/', views.UnlockLessonView.as_view(), name='unlock-lesson'),
    # URL for retrieving user progress
    path('user/progress/', views.UserProgressListView.as_view(), name="user-progress-list"),
    # URL for updating progress on a specific lesson (e.g., /api/progress/lesson/3/)
    path('progress/lesson/<int:lesson_id>/', views.UserProgressView.as_view(), name='update-progress'), 
    # total lesson count
    path('lessons-total-count/', views.TotalLessonsCountView.as_view(), name='total-lessons-count'),
    # change password
    path('user/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    # get word of the day
    path('word-of-the-day/', views.LatestWordOfTheDayView.as_view(), name="word-of-the-day")
    
]