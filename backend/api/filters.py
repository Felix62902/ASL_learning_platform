from django_filters import rest_framework as filters
from .models import Lesson

class LessonFilter(filters.FilterSet):
    """
    Custom filter for the Lesson model.
    """
    # This creates a case-insensitive filter for the category's name.
    # 'field_name' tells it to look at the 'name' field on the related 'category' model.
    # 'lookup_expr'='iexact' makes the match case-insensitive.
    category_name = filters.CharFilter(
        field_name='category__name', 
        lookup_expr='iexact'
    )

    class Meta:
        model = Lesson
        # Define the fields available for filtering.
        # 'category' allows filtering by ID (e.g., ?category=1)
        # 'category_name' is the new case-insensitive name filter.
        fields = ['category', 'category_name']