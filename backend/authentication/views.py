from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    UpdateProfileSerializer, ChangePasswordSerializer, DeleteAccountSerializer
)
from django.conf import settings
from django.db import connection

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


class RegisterViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response(
                {
                    "message": "Registration successful",
                    "user": UserSerializer(user).data,
                    "tokens": tokens,
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            tokens = get_tokens_for_user(user)
            return Response(
                {
                    "message": "Login successful",
                    "user": UserSerializer(user).data,
                    "tokens": tokens,
                },
                status=status.HTTP_200_OK
            )
        errors = serializer.errors
        if "non_field_errors" in errors:
            return Response(
                {"error": errors["non_field_errors"][0]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UpdateProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={"request": request}
        )
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data["new_password"])
            request.user.save()
            tokens = get_tokens_for_user(request.user)
            return Response({"message": "Password updated successfully", "tokens": tokens})
        errors = serializer.errors
        if "non_field_errors" in errors:
            return Response({"error": errors["non_field_errors"][0]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        serializer = DeleteAccountSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            user = request.user
            try:
                refresh_token = request.data.get("refresh")
                if refresh_token:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
            except Exception:
                pass
            user.delete()
            return Response({"message": "Account deleted successfully"}, status=status.HTTP_200_OK)
        errors = serializer.errors
        if "non_field_errors" in errors:
            return Response({"error": errors["non_field_errors"][0]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)
    

class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin
    
class ManageUserRoleView(APIView):
    permission_classes = [IsAdminRole]

    def patch(Self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        role = request.data.get("role")
        if role not in ["ADMIN", "STAFF"]:
            return Response({"error": "Role must be ADMIN or STAFF"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.role = role
        user.save()
        return Response({
            "message": f"{user.full_name} is now {role}",
            "user": UserSerializer(user).data,
        })
    
class ListUsersView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        users = User.objects.all()
        return Response(UserSerializer(users, many=True).data)
    

class InitialAdminSetupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if User.objects.filter(role='ADMIN').exists():
            return Response(
                {"error": "Setup already completed"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.role = 'ADMIN'
            user.is_staff = True
            user.is_superuser = True
            user.is_owner = True   
            user.can_reset = True 
            user.save()
            tokens = get_tokens_for_user(user)
            return Response(
                {
                    "message": "Admin account created successfully",
                    "user": UserSerializer(user).data,
                    "tokens": tokens,
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class SetupStatusView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        admin_exists = User.objects.filter(role='ADMIN').exists()
        return Response({"setup_complete": admin_exists})
    
class ResetApplicationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not request.user.can_reset:
            return Response(
                {"error": "You are not authorized to reset the application"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        secret = request.data.get("reset_key")
        if not secret or secret != settings.RESET_SECRET_KEY:
            return Response(
                {"error": "Invalid reset key"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            from shipments.models import Shipment
            from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

            owner = User.objects.get(is_owner=True)

            BlacklistedToken.objects.all().delete()
            OutstandingToken.objects.all().delete()
            Shipment.objects.all().delete()

            User.objects.exclude(id=owner.id).delete()

            return Response({
                "message": "Applcation reset successful. You can now create a new admin via /api/auth/setup/"
            })

        except Exception as e:
            return Response(
                {"error": f"Reset failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class ManageResetAccessView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, user_id):
        if not request.user.is_owner:
            return Response(
                {"error": "Only the owner can grant reset access"},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        can_reset = request.data.get("can_reset")
        if not isinstance(can_reset, bool):
            return Response({"error": "can_reset must be true or false"}, status=status.HTTP_400_BAD_REQUEST)

        user.can_reset = can_reset
        user.save()
        return Response({
            "message": f"{user.full_name} reset access set to {can_reset}",
            "user": UserSerializer(user).data,
        })
