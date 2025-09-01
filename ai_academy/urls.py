from django.contrib import admin
from django.urls import path, include
from core.views import home

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('courses/', include('courses.urls')),
    path('analytics/', include('analytics.urls')),
    path('reviews/', include('reviews.urls')),
    path('', home, name='home'),
]
