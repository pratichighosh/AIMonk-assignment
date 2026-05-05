from rest_framework import serializers
from .models import TreeHierarchy


class TreeHierarchySerializer(serializers.ModelSerializer):
    class Meta:
        model = TreeHierarchy
        fields = ['id', 'tree_data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_tree_data(self, value):
        """Ensure tree_data has at least a 'name' field."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("tree_data must be a JSON object.")
        if 'name' not in value:
            raise serializers.ValidationError("tree_data must have a 'name' field.")
        return value
