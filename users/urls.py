from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProfileViewSet, WorkspaceViewSet, TeamViewSet, RegisterView, ActivateUserView

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet)
router.register(r'workspaces', WorkspaceViewSet)
router.register(r'teams', TeamViewSet)

urlpatterns = [
    path('', include(router.urls)),
        path('activate/<int:user_id>/', ActivateUserView.as_view(), name='activate-user'),
]