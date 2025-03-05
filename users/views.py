from rest_framework import viewsets, permissions, status, views
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import UserProfile, Workspace, Team
from .serializers import (
    UserProfileSerializer, 
    WorkspaceSerializer, 
    TeamSerializer,
    TeamDetailSerializer
)
from .utils import send_welcome_email  # Import the email function
from django.db import transaction

User = get_user_model()

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import RegisterSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            try:
                # Call the email function
                host = request.get_host().split(".")[0]  # Extract subdomain
                # Construct the activation URL
                activation_url = f"http://localhost:5173/activate?domain={host}&id={user.id}/"
                # Email message
                message = (
                    f"Hello {user.first_name},\n\n"
                    "Thank you for registering with us!\n\n"
                    f"Click on the link below to activate your account:\n{activation_url}\n\n"
                    "Best Regards,\nYour Team"
                )
                send_welcome_email(user.email, "Welcome to Our Platform", message)
            except Exception as e:
                transaction.set_rollback(True)
                return Response(
                    {"status": "FAILED", "error": "User registration failed due to email error."}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            # Create response data
            data = {
                "user": {
                    "id": user.id
                    # "username": user.username,
                    # "email": user.email,
                    # "first_name": user.first_name,
                    # "last_name": user.last_name
                },
                "status": "SUCCESS",
                "message": "User registered successfully"
            }
        
        return Response(data, status=status.HTTP_201_CREATED)

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = UserProfile.objects.all()
        # Allow filtering by username if provided
        username = self.request.query_params.get('username', None)
        if username is not None:
            queryset = queryset.filter(user__username=username)
        return queryset
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            user_profile = request.user.profile
            serializer = self.get_serializer(user_profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "Profile not found for current user."},
                status=status.HTTP_404_NOT_FOUND
            )


class WorkspaceViewSet(viewsets.ModelViewSet):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def teams(self, request, pk=None):
        workspace = self.get_object()
        teams = Team.objects.filter(workspaces=workspace)
        serializer = TeamSerializer(teams, many=True)
        return Response(serializer.data)


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TeamDetailSerializer
        return TeamSerializer
    
    @action(detail=True, methods=['post'])
    def add_user(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')
        
        try:
            user_profile = UserProfile.objects.get(id=user_id)
            team.users.add(user_profile)
            return Response({"detail": f"User {user_profile} added to team {team}"})
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def remove_user(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')
        
        try:
            user_profile = UserProfile.objects.get(id=user_id)
            team.users.remove(user_profile)
            return Response({"detail": f"User {user_profile} removed from team {team}"})
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def add_workspace(self, request, pk=None):
        team = self.get_object()
        workspace_id = request.data.get('workspace_id')
        
        try:
            workspace = Workspace.objects.get(id=workspace_id)
            team.workspaces.add(workspace)
            return Response({"detail": f"Workspace {workspace} added to team {team}"})
        except Workspace.DoesNotExist:
            return Response(
                {"detail": "Workspace not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def remove_workspace(self, request, pk=None):
        team = self.get_object()
        workspace_id = request.data.get('workspace_id')
        
        try:
            workspace = Workspace.objects.get(id=workspace_id)
            team.workspaces.remove(workspace)
            return Response({"detail": f"Workspace {workspace} removed from team {team}"})
        except Workspace.DoesNotExist:
            return Response(
                {"detail": "Workspace not found."},
                status=status.HTTP_404_NOT_FOUND
            )

class ActivateUserView(views.APIView):
    permission_classes = [permissions.AllowAny]  # Allow activation without authentication
    
    def get(self, request, user_id, *args, **kwargs):
        # Fetch user or return 404 if not found
        user = get_object_or_404(User, id=user_id)
        
        if user.is_active:
            return Response({"message": "User is already active."}, status=status.HTTP_200_OK)
        
        # Activate the user
        user.is_active = True
        user.save()

        return Response({"message": "User activated successfully."}, status=status.HTTP_200_OK)
        
    