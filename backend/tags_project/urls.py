from django.urls import path, include

urlpatterns = [
    path('api/', include('tags_api.urls')),
]
