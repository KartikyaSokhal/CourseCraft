from rest_framework import permissions
from .models import Module, UserProgress

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit objects,
    but allow any authenticated user to view them.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return hasattr(request.user, 'profile') and request.user.profile.role == 'ADMIN'

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users (used for course generation).
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.role == 'ADMIN'
        )

def is_module_locked(user, module):
    """
    Server-side helper to determine if a module is locked for a given user.
    - Unauthenticated user: locked (True)
    - ADMIN role: unlocked (False)
    - Module order == 1: unlocked (False)
    - Subsequent modules: locked (True) unless the immediately preceding module
      in the same course is completed (UserProgress.is_completed == True).
    """
    if not user or not user.is_authenticated:
        return True

    if hasattr(user, 'profile') and user.profile.role == 'ADMIN':
        return False

    if module.order == 1:
        return False

    previous_module = Module.objects.filter(
        course=module.course,
        order__lt=module.order
    ).order_by('-order').first()

    if not previous_module:
        return False

    return not UserProgress.objects.filter(
        user=user,
        module=previous_module,
        is_completed=True
    ).exists()