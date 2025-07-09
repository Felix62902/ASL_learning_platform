from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# using a router automatically generates full set of URLs including GET, POST, Put, DELETE for each endpoint
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'lessons', views.LessonViewSet, basename='lesson')


urlpatterns = [
    # Include the router-generated URLs
    path('', include(router.urls)),
    #JWT tokens
    path("token/", TokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    # URL for user registration
    path('user/register/', views.CreateUserView.as_view(), name='register'),
    # URL for listing your saved lessons or saving a new one
    path('saved-lessons/', views.SavedLessonListCreateView.as_view(), name='saved-lessons'),
    # URL for unsaving a specific lesson (e.g., /api/saved-lessons/5/)
    path('saved-lessons/<int:pk>/', views.SavedLessonDestroyView.as_view(), name='unsave-lesson'),
    # URL for updating progress on a specific lesson (e.g., /api/progress/lesson/3/)
    path('progress/lesson/<int:lesson_id>/', views.UserProgressView.as_view(), name='update-progress'), 
]