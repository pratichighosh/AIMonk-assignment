from django.urls import path
from .views import TreeListCreateView, TreeDetailView

urlpatterns = [
    path('trees/', TreeListCreateView.as_view(), name='tree-list-create'),
    path('trees/<int:pk>/', TreeDetailView.as_view(), name='tree-detail'),
]
