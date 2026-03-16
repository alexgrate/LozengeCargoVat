from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email").lower()
        password = data.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email and password are required")

        user = authenticate(email=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("Your account has been disabled")

        data["user"] = user
        return data


class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone_number', 'password', 'confirm_password')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered")
        return value

    def validate_phone_number(self, value):
        if not value:
            return value
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("This phone number is already registered")
        return value

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        if len(data["password"]) < 8:
            raise serializers.ValidationError({"password": "Password must be at least 8 characters"})
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id", "email", "full_name", "first_name", "last_name",
            "phone_number", "role", "is_owner", "can_reset", "date_joined",
        )
        read_only_fields = ("id", "date_joined", "role", "is_owner", "can_reset")

    def get_full_name(self, obj):
        return obj.full_name


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("first_name", "last_name", "phone_number")

    def validate_phone_number(self, value):
        if not value:
            return value
        qs = User.objects.filter(phone_number=value).exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This phone number is already in use")
        return value

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        if data["new_password"] == data["current_password"]:
            raise serializers.ValidationError({"new_password": "New password must be different from current password"})
        return data


class DeleteAccountSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Incorrect password")
        return value