from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterViewset, LoginViewset, LogoutViewset,
    ProfileView, ChangePasswordView, DeleteAccountView,
    ManageUserRoleView, ListUsersView, InitialAdminSetupView, SetupStatusView, ResetApplicationView,
    ManageResetAccessView
)

router = DefaultRouter()
router.register('register', RegisterViewset, basename='register')
router.register('login', LoginViewset, basename='login')
router.register('logout', LogoutViewset, basename='logout')

urlpatterns = router.urls + [
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("delete-account/", DeleteAccountView.as_view(), name="delete_account"),
    path("users/", ListUsersView.as_view(), name="list_users"),
    path("users/<int:user_id>/role/", ManageUserRoleView.as_view(), name="manage_role"),
    path("setup/status/", SetupStatusView.as_view(), name="setup_status"),
    path("setup/", InitialAdminSetupView.as_view(), name="initial_setup"),
    path("reset/", ResetApplicationView.as_view(), name="reset_application"),
    path("users/<int:user_id>/reset-access/", ManageResetAccessView.as_view(), name="manage_reset_access"),
]