from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import TreeHierarchy
from .serializers import TreeHierarchySerializer


class TreeListCreateView(APIView):
    """
    GET  /api/trees/  -> returns all saved tree hierarchies
    POST /api/trees/  -> saves a new tree hierarchy
    """

    def get(self, request):
        trees = TreeHierarchy.objects.all()
        serializer = TreeHierarchySerializer(trees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TreeHierarchySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TreeDetailView(APIView):
    """
    GET /api/trees/<id>/   -> fetch a single tree
    PUT /api/trees/<id>/   -> update an existing tree hierarchy
    DELETE /api/trees/<id>/-> delete a tree
    """

    def get_object(self, pk):
        try:
            return TreeHierarchy.objects.get(pk=pk)
        except TreeHierarchy.DoesNotExist:
            return None

    def get(self, request, pk):
        tree = self.get_object(pk)
        if not tree:
            return Response({'error': 'Tree not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TreeHierarchySerializer(tree)
        return Response(serializer.data)

    def put(self, request, pk):
        tree = self.get_object(pk)
        if not tree:
            return Response({'error': 'Tree not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TreeHierarchySerializer(tree, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        tree = self.get_object(pk)
        if not tree:
            return Response({'error': 'Tree not found.'}, status=status.HTTP_404_NOT_FOUND)
        tree.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
