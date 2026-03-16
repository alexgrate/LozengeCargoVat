from rest_framework import serializers
from .models import Shipment, ShipmentVAT


class CreateShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = [
            'customer_name', 'weight', 'transaction_details',
            'carrier', 'date_of_payment', 'date_of_payment_to_carrier',
            'other_cost', 'status', 'comments',
        ]

    def create(self, validated_data):
        return Shipment.objects.create(**validated_data)


class AdminUpdateShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = ['payment_made', 'cost_of_shipping']

    def update(self, instance, validated_data):
        instance.payment_made = validated_data.get('payment_made', instance.payment_made)
        instance.cost_of_shipping = validated_data.get('cost_of_shipping', instance.cost_of_shipping)
        
        instance.revenue = instance.payment_made - instance.other_cost
        instance.profit = instance.revenue - instance.cost_of_shipping
        
        instance.save()
        return instance


class StaffShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = [
            'id', 'date', 'reference', 'customer_name',
            'weight', 'transaction_details', 'carrier',
            'date_of_payment', 'date_of_payment_to_carrier',
            'other_cost', 'status', 'comments',
            'created_at', 'updated_at',
        ]


class AdminShipmentSerializer(serializers.ModelSerializer):
    revenue = serializers.SerializerMethodField()
    profit = serializers.SerializerMethodField()

    class Meta:
        model = Shipment
        fields = [
            'id', 'date', 'reference', 'customer_name',
            'weight', 'transaction_details', 'carrier',
            'date_of_payment', 'payment_made',
            'date_of_payment_to_carrier', 'cost_of_shipping',
            'other_cost', 'revenue', 'profit',
            'status', 'comments', 'created_at', 'updated_at',
        ]

    def get_revenue(self, obj):
        return float(obj.payment_made) - float(obj.other_cost)
    
    def get_profit(self, obj):
        revenue = float(obj.payment_made) - float(obj.other_cost)
        return revenue - float(obj.cost_of_shipping)


class TrackShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = [
            'reference', 'status', 'carrier',
            'weight', 'transaction_details',
            'date', 'comments', 'updated_at',
        ]


class ShipmentVATSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShipmentVAT
        fields = [
            'id', 'reference', 'date',
            'cost_price', 'net_cost', 'vat_input',
            'profit', 'selling_price', 'vat_output', 'vat_payable',
            'created_at', 'updated_at',
        ]