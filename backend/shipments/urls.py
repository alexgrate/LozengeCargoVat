from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ShipmentViewset, AdminFinancialsView, TrackShipmentView, ShipmentVATView, AllVATView

router = DefaultRouter()
router.register('', ShipmentViewset, basename='shipments')

urlpatterns = [
    path('track/<str:reference>/', TrackShipmentView.as_view(), name='track_shipment'),
    path('admin/financials/<str:reference>/', AdminFinancialsView.as_view(), name='admin_financials'),
    path('admin/vat/<str:reference>/', ShipmentVATView.as_view(), name='shipment_vat'),
    path('admin/vat/', AllVATView.as_view(), name='all_vat'),
] + router.urls  