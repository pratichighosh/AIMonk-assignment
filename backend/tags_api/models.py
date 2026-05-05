from django.db import models


class TreeHierarchy(models.Model):
    """
    Stores a complete tree hierarchy as a JSON blob.
    Schema:
      - id: auto-increment primary key
      - tree_data: JSON field storing the full nested tree
      - created_at: timestamp when first saved
      - updated_at: timestamp of last update
    """
    tree_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tree_hierarchy'
        ordering = ['-updated_at']

    def __str__(self):
        root_name = self.tree_data.get('name', 'Unknown') if isinstance(self.tree_data, dict) else 'Unknown'
        return f"Tree #{self.id}: {root_name}"
