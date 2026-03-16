from django.db import models
from decimal import Decimal


class Shipment(models.Model):

    STATUS_CHOICES = [
        ('PAID', 'Paid'),
        ('UNPAID', 'UnPaid'),
    ]

    CARRIER_CHOICES = [
        ('DHL', 'DHL'),
        ('DHL_CASH', 'DHL Cash'),
        ('FEDEX', 'FedEx'),
        ('UPS', 'UPS'),
        ('OTHER', 'Other'),
    ]

    date = models.DateField(auto_now_add=True)
    reference = models.CharField(max_length=100, unique=True, blank=True)

    customer_name = models.CharField(max_length=255)
    weight = models.CharField(max_length=50)
    transaction_details = models.CharField(max_length=255, blank=True)
    carrier = models.CharField(max_length=50, choices=CARRIER_CHOICES, default='DHL')
    date_of_payment = models.DateField(null=True, blank=True)
    date_of_payment_to_carrier = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='UNPAID')
    comments = models.TextField(blank=True)

    payment_made = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cost_of_shipping = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    profit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reference} - {self.customer_name}"

    def save(self, *args, **kwargs):
        if not self.reference:
            from datetime import date
            today = date.today()
            month = today.strftime('%b').upper()
            year = today.year
            prefix = f"{month}{year}"
            last = Shipment.objects.filter(reference__startswith=prefix).count() + 1
            self.reference = f"{prefix}-{str(last).zfill(3)}"
        super().save(*args, **kwargs)

class ShipmentVAT(models.Model):
    shipment = models.OneToOneField(
        Shipment,
        on_delete=models.CASCADE,
        related_name='vat'
    )
    reference = models.CharField(max_length=100, blank=True)
    date = models.DateField(auto_now_add=True)

    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    vat_input = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    profit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    vat_output = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    vat_payable = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"VAT - {self.reference}"