from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Shipment, ShipmentVAT
from .serializers import (
    StaffShipmentSerializer, AdminShipmentSerializer,
    CreateShipmentSerializer, AdminUpdateShipmentSerializer,
    TrackShipmentSerializer, ShipmentVATSerializer
)
from decimal import Decimal


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


def get_shipment_serializer(user, shipment, many=False):
    if user.is_admin:
        return AdminShipmentSerializer(shipment, many=many).data
    return StaffShipmentSerializer(shipment, many=many).data


class ShipmentViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        serializer = CreateShipmentSerializer(data=request.data)
        if serializer.is_valid():
            shipment = serializer.save()
            return Response(
                {
                    "message": "Shipment created successfully",
                    "shipment": get_shipment_serializer(request.user, shipment),
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request):
        shipments = Shipment.objects.all()
        return Response(get_shipment_serializer(request.user, shipments, many=True))

    def retrieve(self, request, pk=None):
        try:
            shipment = Shipment.objects.get(reference=pk)
            return Response(get_shipment_serializer(request.user, shipment))
        except Shipment.DoesNotExist:
            return Response({"error": "Shipment not found"}, status=status.HTTP_404_NOT_FOUND)

    def partial_update(self, request, pk=None):
        try:
            shipment = Shipment.objects.get(reference=pk)
        except Shipment.DoesNotExist:
            return Response({"error": "Shipment not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CreateShipmentSerializer(shipment, data=request.data, partial=True)
        if serializer.is_valid():
            shipment = serializer.save()
            return Response({
                "message": "Shipment updated successfully",
                "shipment": get_shipment_serializer(request.user, shipment),
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        if not request.user.is_admin:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        try:
            shipment = Shipment.objects.get(reference=pk)
            shipment.delete()
            return Response({"message": "Shipment deleted successfully"})
        except Shipment.DoesNotExist:
            return Response({"error": "Shipment not found"}, status=status.HTTP_404_NOT_FOUND)


class AdminFinancialsView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, reference):
        try:
            shipment = Shipment.objects.get(reference=reference)
        except Shipment.DoesNotExist:
            return Response({"error": "Shipment not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminUpdateShipmentSerializer(shipment, data=request.data, partial=True)
        if serializer.is_valid():
            shipment = serializer.save()
            return Response({
                "message": "Financials updated successfully",
                "shipment": AdminShipmentSerializer(shipment).data,
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TrackShipmentView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, reference):
        try:
            shipment = Shipment.objects.get(reference=reference)
            return Response(TrackShipmentSerializer(shipment).data)
        except Shipment.DoesNotExist:
            return Response(
                {"error": "No shipment found with that tracking number"},
                status=status.HTTP_404_NOT_FOUND
            )
        
class AdminFinancialsView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, reference):
        try:
            shipment = Shipment.objects.get(reference=reference)
        except Shipment.DoesNotExist:
            return Response({"error": "Shipment not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = AdminUpdateShipmentSerializer(shipment, data=request.data, partial=True)
        if serializer.is_valid():
            shipment = serializer.save()

            cost_price = shipment.cost_of_shipping + shipment.other_cost
            net_cost = (cost_price * Decimal('100') / Decimal('107.5')).quantize(Decimal('0.01'))
            vat_input = (cost_price - net_cost).quantize(Decimal('0.01'))
            selling_price = shipment.revenue
            vat_output = (Decimal('0.075') * selling_price).quantize(Decimal('0.01'))
            vat_payable = (vat_output - vat_input).quantize(Decimal('0.01'))

            vat, _ = ShipmentVAT.objects.update_or_create(
                shipment=shipment,
                defaults={
                    'reference': shipment.reference,
                    'date': shipment.date,
                    'cost_price': cost_price,
                    'net_cost': net_cost,
                    'vat_input': vat_input,
                    'profit': shipment.profit,
                    'selling_price': selling_price,
                    'vat_output': vat_output,
                    'vat_payable': vat_payable,
                }
            )

            return Response({
                "message": "Financials updated successfully",
                "shipment": AdminShipmentSerializer(shipment).data,
                "vat": ShipmentVATSerializer(vat).data,
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ShipmentVATView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request, reference):
        try:
            shipment = Shipment.objects.get(reference=reference)
            vat = shipment.vat
            return Response(ShipmentVATSerializer(vat).data)
        except Shipment.DoesNotExist:
            return Response({"error": "Shipment not found"}, status=status.HTTP_404_NOT_FOUND)
        except ShipmentVAT.DoesNotExist:
            return Response({"error": "No VAT record found. Update financials first."}, status=status.HTTP_404_NOT_FOUND)

class AllVATView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        vats = ShipmentVAT.objects.all().select_related('shipment')
        return Response(ShipmentVATSerializer(vats, many=True).data)