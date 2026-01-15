import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from inventory.models import Category, Product, Vendor, StockLog
from django.contrib.auth import get_user_model

User = get_user_model()
admin = User.objects.filter(is_superuser=True).first()

if not admin:
    print("Warning: No admin user found. Creating one...")
    admin = User.objects.create_superuser('admin', 'admin@example.com', 'admin')

# 1. Create Categories
categories = ['Drinks', 'Snacks', 'Alcohol', 'Essentials']
cat_objs = {}
for cat_name in categories:
    cat, created = Category.objects.get_or_create(name=cat_name)
    cat_objs[cat_name] = cat
    print(f"{'Created' if created else 'Found'} Category: {cat_name}")

# 2. Create Vendors
vendors_data = [
    {'name': 'Nigerian Breweries', 'contact': 'Mr. Ade', 'phone': '08012345678', 'email': 'sales@nb.com'},
    {'name': 'Coca-Cola Hellenic', 'contact': 'Mrs. Ngozi', 'phone': '08098765432', 'email': 'orders@coca-cola.ng'},
    {'name': 'Guinness Nigeria', 'contact': 'Chinedu', 'phone': '08055555555', 'email': 'chinedu@guinness.com'},
    {'name': 'Local Market Supplier', 'contact': 'Mama Nkechi', 'phone': '07011112222', 'notes': 'For fresh items and snacks'}
]

vendor_objs = []
for v_data in vendors_data:
    vendor, created = Vendor.objects.get_or_create(
        name=v_data['name'],
        defaults={
            'contact_person': v_data.get('contact', ''),
            'phone': v_data.get('phone', ''),
            'email': v_data.get('email', ''),
            'notes': v_data.get('notes', '')
        }
    )
    vendor_objs.append(vendor)
    print(f"{'Created' if created else 'Found'} Vendor: {vendor.name}")

# 3. Create Products
products_data = [
    {'name': 'Coca-Cola 50cl', 'cat': 'Drinks', 'price': 300, 'cost': 200, 'qty': 50, 'vendor': 'Coca-Cola Hellenic'},
    {'name': 'Fanta 50cl', 'cat': 'Drinks', 'price': 300, 'cost': 200, 'qty': 45, 'vendor': 'Coca-Cola Hellenic'},
    {'name': 'Sprite 50cl', 'cat': 'Drinks', 'price': 300, 'cost': 200, 'qty': 20, 'vendor': 'Coca-Cola Hellenic'},
    {'name': 'Maltina', 'cat': 'Drinks', 'price': 400, 'cost': 300, 'qty': 100, 'vendor': 'Nigerian Breweries'},
    {'name': 'Amstel Malta', 'cat': 'Drinks', 'price': 450, 'cost': 350, 'qty': 80, 'vendor': 'Nigerian Breweries'},
    {'name': 'Heineken', 'cat': 'Alcohol', 'price': 600, 'cost': 450, 'qty': 60, 'vendor': 'Nigerian Breweries'},
    {'name': 'Guinness Stout', 'cat': 'Alcohol', 'price': 600, 'cost': 450, 'qty': 55, 'vendor': 'Guinness Nigeria'},
    {'name': 'Orijin Bitters', 'cat': 'Alcohol', 'price': 500, 'cost': 350, 'qty': 10, 'vendor': 'Guinness Nigeria'}, # Low stock
    {'name': 'Beef Roll', 'cat': 'Snacks', 'price': 200, 'cost': 150, 'qty': 30, 'vendor': 'Local Market Supplier'},
    {'name': 'Water 75cl', 'cat': 'Drinks', 'price': 150, 'cost': 80, 'qty': 200, 'vendor': 'Local Market Supplier'},
]

for p_data in products_data:
    vendor = next((v for v in vendor_objs if v.name == p_data['vendor']), None)
    product, created = Product.objects.get_or_create(
        name=p_data['name'],
        defaults={
            'category': cat_objs[p_data['cat']],
            'price': p_data['price'],
            'cost_price': p_data['cost'],
            'quantity': p_data['qty'],
            'preferred_vendor': vendor,
            'low_stock_threshold': 15
        }
    )
    
    if created:
        # Log initial stock
        StockLog.objects.create(
            product=product,
            action='RESTOCK',
            quantity_change=p_data['qty'],
            old_quantity=0,
            new_quantity=p_data['qty'],
            user=admin,
            notes='Initial Stock Load'
        )
    
    print(f"{'Created' if created else 'Found'} Product: {p_data['name']}")

print("Inventory population complete!")
