#!/usr/bin/env python3
"""
God Level Coder Challenge - Data Generator V2
Generates realistic restaurant data INCLUDING financial data for Phase 1
"""

import random
import argparse
from datetime import datetime, timedelta
from decimal import Decimal
import psycopg2
from psycopg2.extras import execute_batch
from faker import Faker

fake = Faker('pt_BR')

# Configurations
BRAND_ID = 1
SALES_STATUS = ['COMPLETED', 'CANCELLED']
STATUS_WEIGHTS = [0.95, 0.05]  # 95% completed
CATEGORIES_PRODUCTS = ['Burgers', 'Pizzas', 'Pratos', 'Combos', 'Sobremesas', 'Bebidas']
CATEGORIES_ITEMS = ['Complementos', 'Molhos', 'Adicionais']

# Realistic product prefixes
PRODUCT_PREFIXES = {
    'Burgers': ['X-Burger', 'Cheeseburger', 'Bacon Burger', 'Double Burger', 'Veggie Burger'],
    'Pizzas': ['Pizza Margherita', 'Pizza Calabresa', 'Pizza 4 Queijos', 'Pizza Portuguesa', 'Pizza Frango'],
    'Pratos': ['Prato Executivo', 'Filé', 'Frango Grelhado', 'Lasanha', 'Risoto'],
    'Combos': ['Combo Família', 'Combo Individual', 'Combo Duplo', 'Combo Kids', 'Combo Executivo'],
    'Sobremesas': ['Brownie', 'Pudim', 'Sorvete', 'Petit Gateau', 'Torta'],
    'Bebidas': ['Refrigerante', 'Suco', 'Água', 'Cerveja', 'Vinho']
}

ITEM_NAMES = {
    'Complementos': ['Bacon', 'Queijo Cheddar', 'Queijo Mussarela', 'Ovo', 'Alface', 'Tomate',
                     'Cebola', 'Picles', 'Jalapeño', 'Cogumelos', 'Abacaxi', 'Catupiry'],
    'Molhos': ['Molho Barbecue', 'Molho Mostarda', 'Molho Especial', 'Maionese', 'Ketchup',
               'Molho Picante', 'Molho Ranch', 'Molho Tártaro'],
    'Adicionais': ['Batata Frita', 'Onion Rings', 'Nuggets', 'Salada', 'Arroz', 'Feijão',
                   'Farofa', 'Vinagrete']
}

# Realistic patterns
HOURLY_WEIGHTS = {
    range(0, 6): 0.02, range(6, 11): 0.08, range(11, 15): 0.35,
    range(15, 19): 0.10, range(19, 23): 0.40, range(23, 24): 0.05
}

WEEKDAY_MULT = [0.8, 0.9, 0.95, 1.0, 1.3, 1.5, 1.4]  # Mon-Sun

CHANNELS = [
    ('Presencial', 'P', 0.40, 0),
    ('iFood', 'D', 0.30, 27),
    ('Rappi', 'D', 0.15, 25),
    ('Uber Eats', 'D', 0.08, 30),
    ('WhatsApp', 'D', 0.05, 0),
    ('App Próprio', 'D', 0.02, 0)
]

PAYMENT_TYPES_LIST = [
    'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito',
    'PIX', 'Vale Refeição', 'Vale Alimentação'
]

DISCOUNT_REASONS = [
    'Cupom de desconto', 'Promoção do dia', 'Cliente fidelidade',
    'Desconto gerente', 'Primeira compra', 'Aniversário'
]

DELIVERY_TYPES = ['DELIVERY', 'TAKEOUT', 'INDOOR']
COURIER_TYPES = ['PLATFORM', 'OWN', 'THIRD_PARTY']

# ================ FINANCIAL DATA CONFIGS (NEW) ================

SUPPLIER_NAMES = [
    'Atacadão São Paulo LTDA',
    'Distribuidora Central de Alimentos',
    'FreshMart Distribuidora',
    'Alimentos Premium do Brasil',
    'Comercial Fornecedor Geral'
]

EXPENSE_CATEGORIES = ['labor', 'rent', 'utilities', 'marketing', 'maintenance', 'other']

FIXED_COST_TYPES = [
    ('Aluguel', 'monthly'),
    ('Salários Fixos', 'monthly'),
    ('Seguro', 'annual'),
    ('Contabilidade', 'monthly'),
    ('Sistema POS', 'monthly')
]

# Product cost variation patterns (seasonal, supply chain issues, etc)
COST_VARIATION_PATTERNS = {
    'stable': lambda base: base * random.uniform(0.95, 1.05),
    'increasing': lambda base: base * random.uniform(1.0, 1.15),
    'decreasing': lambda base: base * random.uniform(0.85, 1.0),
    'volatile': lambda base: base * random.uniform(0.80, 1.20),
}


def get_db_connection(db_url):
    return psycopg2.connect(db_url)


def get_hour_weight(hour):
    for hour_range, weight in HOURLY_WEIGHTS.items():
        if hour in hour_range:
            return weight
    return 0.01


def setup_base_data(conn):
    """Create brands, channels, payment types"""
    print("Setting up base data...")
    cursor = conn.cursor()

    # Sub-brands
    sub_brands = ['Challenge Burger', 'Challenge Pizza', 'Challenge Sushi']
    sub_brand_ids = []

    cursor.execute("INSERT INTO brands (name) VALUES ('Nola God Level Brand') ON CONFLICT DO NOTHING")
    for sb in sub_brands:
        cursor.execute(
            "INSERT INTO sub_brands (brand_id, name) VALUES (%s, %s) ON CONFLICT DO NOTHING RETURNING id",
            (BRAND_ID, sb)
        )
        result = cursor.fetchone()
        if result:
            sub_brand_ids.append(result[0])

    # If no new sub_brands, get existing ones
    if not sub_brand_ids:
        cursor.execute("SELECT id FROM sub_brands WHERE brand_id = %s", (BRAND_ID,))
        sub_brand_ids = [row[0] for row in cursor.fetchall()]

    # Channels
    channel_ids = []
    for name, ch_type, weight, commission in CHANNELS:
        cursor.execute("""
            INSERT INTO channels (brand_id, name, description, type)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT DO NOTHING
            RETURNING id
        """, (BRAND_ID, name, f'Canal {name}', ch_type))
        result = cursor.fetchone()
        if result:
            channel_ids.append({
                'id': result[0],
                'name': name,
                'type': ch_type,
                'weight': weight,
                'commission': commission
            })

    # If no new channels, get existing ones
    if not channel_ids:
        cursor.execute("SELECT id, name, type FROM channels WHERE brand_id = %s", (BRAND_ID,))
        for row in cursor.fetchall():
            ch = next((c for c in CHANNELS if c[0] == row[1]), None)
            channel_ids.append({
                'id': row[0],
                'name': row[1],
                'type': row[2],
                'weight': ch[2] if ch else 0.1,
                'commission': ch[3] if ch else 0
            })

    # Payment types
    for pt in PAYMENT_TYPES_LIST:
        cursor.execute(
            "INSERT INTO payment_types (brand_id, description) VALUES (%s, %s) ON CONFLICT DO NOTHING",
            (BRAND_ID, pt)
        )

    conn.commit()
    print(f"✓ Base data: {len(sub_brand_ids)} sub-brands, {len(channel_ids)} channels")
    return sub_brand_ids, channel_ids


def generate_suppliers(conn, num_suppliers=5):
    """Generate suppliers (NEW)"""
    print(f"Generating {num_suppliers} suppliers...")
    cursor = conn.cursor()
    suppliers = []

    for i in range(num_suppliers):
        name = SUPPLIER_NAMES[i] if i < len(SUPPLIER_NAMES) else f"Fornecedor #{i+1}"

        cursor.execute("""
            INSERT INTO suppliers (name, contact, email, phone, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            name,
            fake.name(),
            fake.company_email(),
            fake.phone_number(),
            datetime.now() - timedelta(days=random.randint(365, 730)),
            datetime.now()
        ))
        suppliers.append(cursor.fetchone()[0])

    conn.commit()
    print(f"✓ {len(suppliers)} suppliers created")
    return suppliers


def generate_stores(conn, sub_brand_ids, num_stores=50):
    """Generate realistic stores"""
    print(f"Generating {num_stores} stores...")
    cursor = conn.cursor()
    stores = []

    cities = [fake.city() for _ in range(20)]

    for i in range(num_stores):
        city = random.choice(cities)
        sub_brand_id = random.choice(sub_brand_ids)
        is_active = random.random() > 0.1
        is_own = random.random() > 0.7

        # Brazilian coordinates (São Paulo region as reference)
        base_lat = -23.5 + random.uniform(-2, 2)
        base_long = -46.6 + random.uniform(-3, 3)

        cursor.execute("""
            INSERT INTO stores (
                brand_id, sub_brand_id, name, city, state,
                district, address_street, address_number,
                latitude, longitude, is_active, is_own,
                creation_date, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            BRAND_ID, sub_brand_id,
            f"{fake.company()} - {city}",
            city, fake.estado_sigla(), fake.bairro(),
            fake.street_name(), random.randint(10, 9999),
            Decimal(str(round(base_lat, 6))),
            Decimal(str(round(base_long, 6))),
            is_active, is_own,
            fake.date_between(start_date='-2y', end_date='-6m'),
            datetime.now() - timedelta(days=random.randint(180, 720))
        ))
        stores.append(cursor.fetchone()[0])

    conn.commit()
    print(f"✓ {len(stores)} stores created")
    return stores


def generate_products_and_items(conn, sub_brand_ids, num_products=500, num_items=200):
    """Generate products, items, and option groups"""
    print(f"Generating {num_products} products and {num_items} items...")
    cursor = conn.cursor()

    products = []
    items = []
    option_groups = []

    # Product categories
    for cat_name in CATEGORIES_PRODUCTS:
        cursor.execute("""
            INSERT INTO categories (brand_id, name, type)
            VALUES (%s, %s, 'P')
            ON CONFLICT DO NOTHING
            RETURNING id
        """, (BRAND_ID, cat_name))
        result = cursor.fetchone()
        if not result:
            cursor.execute(
                "SELECT id FROM categories WHERE brand_id = %s AND name = %s AND type = 'P'",
                (BRAND_ID, cat_name)
            )
            result = cursor.fetchone()
        cat_id = result[0]

        # Products in category
        prefixes = PRODUCT_PREFIXES.get(cat_name, [cat_name])
        products_to_create = num_products // len(CATEGORIES_PRODUCTS)

        for i in range(products_to_create):
            sub_brand_id = random.choice(sub_brand_ids)
            prefix = random.choice(prefixes)

            # Use variation numbers or sizes
            if i % 3 == 0:
                name = f"{prefix} P #{i+1:03d}"
            elif i % 3 == 1:
                name = f"{prefix} M #{i+1:03d}"
            else:
                name = f"{prefix} G #{i+1:03d}"

            cursor.execute("""
                INSERT INTO products (brand_id, sub_brand_id, category_id, name, pos_uuid)
                VALUES (%s, %s, %s, %s, %s) RETURNING id
            """, (BRAND_ID, sub_brand_id, cat_id, name, f"prod_{cat_id}_{i}"))

            products.append({
                'id': cursor.fetchone()[0],
                'name': name,
                'category': cat_name,
                'base_price': round(random.uniform(15, 120), 2),
                'popularity': random.betavariate(2, 5),
                'has_customization': random.random() > 0.4,
                'cost_pattern': random.choice(list(COST_VARIATION_PATTERNS.keys()))
            })

    # Item categories
    for cat_name in CATEGORIES_ITEMS:
        cursor.execute("""
            INSERT INTO categories (brand_id, name, type)
            VALUES (%s, %s, 'I')
            ON CONFLICT DO NOTHING
            RETURNING id
        """, (BRAND_ID, cat_name))
        result = cursor.fetchone()
        if not result:
            cursor.execute(
                "SELECT id FROM categories WHERE brand_id = %s AND name = %s AND type = 'I'",
                (BRAND_ID, cat_name)
            )
            result = cursor.fetchone()
        cat_id = result[0]

        item_names_list = ITEM_NAMES.get(cat_name, [])

        if item_names_list:
            for item_name in item_names_list:
                sub_brand_id = random.choice(sub_brand_ids)

                cursor.execute("""
                    INSERT INTO items (brand_id, sub_brand_id, category_id, name, pos_uuid)
                    VALUES (%s, %s, %s, %s, %s) RETURNING id
                """, (BRAND_ID, sub_brand_id, cat_id, item_name, f"item_{cat_id}_{item_name[:10]}"))

                items.append({
                    'id': cursor.fetchone()[0],
                    'name': item_name,
                    'price': round(random.uniform(2, 15), 2)
                })

    # Option groups
    option_group_names = ['Adicionais', 'Remover', 'Ponto da Carne', 'Tamanho']
    for og_name in option_group_names:
        cursor.execute("""
            INSERT INTO option_groups (brand_id, name)
            VALUES (%s, %s)
            ON CONFLICT DO NOTHING
            RETURNING id
        """, (BRAND_ID, og_name))
        result = cursor.fetchone()
        if result:
            option_groups.append(result[0])

    if not option_groups:
        cursor.execute("SELECT id FROM option_groups WHERE brand_id = %s", (BRAND_ID,))
        option_groups = [row[0] for row in cursor.fetchall()]

    conn.commit()
    print(f"✓ {len(products)} products, {len(items)} items, {len(option_groups)} option groups")
    return products, items, option_groups


def generate_product_costs(conn, products, suppliers, months=6):
    """Generate product costs with historical data (NEW)"""
    print(f"Generating product costs for {months} months...")
    cursor = conn.cursor()

    start_date = datetime.now() - timedelta(days=30 * months)
    total_costs = 0

    for product in products:
        # Base cost (30-40% of sale price for healthy margin)
        base_cost = product['base_price'] * random.uniform(0.30, 0.40)
        pattern_func = COST_VARIATION_PATTERNS[product['cost_pattern']]

        # Assign a supplier to this product
        supplier_id = random.choice(suppliers)

        # Generate monthly cost history
        for month in range(months):
            month_start = start_date + timedelta(days=30 * month)
            month_end = month_start + timedelta(days=30) if month < months - 1 else None

            # Apply cost variation pattern
            cost = round(pattern_func(base_cost), 2)
            base_cost = cost  # Update base for next month

            notes = None
            if random.random() < 0.1:  # 10% have notes
                notes = random.choice([
                    'Reajuste fornecedor',
                    'Promoção atacadista',
                    'Alta demanda',
                    'Custo de transporte',
                    'Variação cambial'
                ])

            cursor.execute("""
                INSERT INTO product_costs (
                    product_id, cost, valid_from, valid_until,
                    supplier_id, notes, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                product['id'],
                Decimal(str(cost)),
                month_start,
                month_end,
                supplier_id,
                notes,
                datetime.now(),
                datetime.now()
            ))
            total_costs += 1

    conn.commit()
    print(f"✓ {total_costs} product costs generated")
    return total_costs


def generate_operating_expenses(conn, stores, months=6):
    """Generate operating expenses (NEW)"""
    print(f"Generating operating expenses for {months} months...")
    cursor = conn.cursor()

    start_date = datetime.now() - timedelta(days=30 * months)
    total_expenses = 0

    # Base monthly expenses per store
    BASE_EXPENSES = {
        'labor': (15000, 35000),
        'rent': (5000, 15000),
        'utilities': (2000, 6000),
        'marketing': (1000, 5000),
        'maintenance': (500, 3000),
        'other': (1000, 4000)
    }

    for store_id in stores:
        # Generate base values for this store
        store_expenses = {
            cat: random.uniform(low, high)
            for cat, (low, high) in BASE_EXPENSES.items()
        }

        # Generate monthly expenses
        for month in range(months):
            month_date = start_date + timedelta(days=30 * month)

            for category, base_amount in store_expenses.items():
                # Add some monthly variation (±15%)
                amount = base_amount * random.uniform(0.85, 1.15)

                description = f"{category.capitalize()} - {month_date.strftime('%B %Y')}"

                cursor.execute("""
                    INSERT INTO operating_expenses (
                        store_id, category, amount, period,
                        description, created_at, updated_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    store_id,
                    category,
                    Decimal(str(round(amount, 2))),
                    month_date,
                    description,
                    datetime.now(),
                    datetime.now()
                ))
                total_expenses += 1

    conn.commit()
    print(f"✓ {total_expenses} operating expenses generated")
    return total_expenses


def generate_fixed_costs(conn, stores):
    """Generate fixed costs (NEW)"""
    print(f"Generating fixed costs...")
    cursor = conn.cursor()

    total_fixed = 0

    for store_id in stores:
        for cost_name, frequency in FIXED_COST_TYPES:
            # Determine amount based on type
            if 'Aluguel' in cost_name:
                amount = random.uniform(5000, 15000)
            elif 'Salários' in cost_name:
                amount = random.uniform(10000, 25000)
            elif 'Seguro' in cost_name:
                amount = random.uniform(3000, 8000)
            elif 'Contabilidade' in cost_name:
                amount = random.uniform(500, 2000)
            else:  # Sistema POS
                amount = random.uniform(200, 800)

            start_date = datetime.now() - timedelta(days=random.randint(180, 730))
            end_date = None if random.random() > 0.1 else start_date + timedelta(days=365)

            cursor.execute("""
                INSERT INTO fixed_costs (
                    store_id, name, amount, frequency,
                    start_date, end_date, description,
                    created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                store_id,
                cost_name,
                Decimal(str(round(amount, 2))),
                frequency,
                start_date,
                end_date,
                f"{cost_name} - Loja #{store_id}",
                datetime.now(),
                datetime.now()
            ))
            total_fixed += 1

    conn.commit()
    print(f"✓ {total_fixed} fixed costs generated")
    return total_fixed


def generate_channel_commissions(conn, channels):
    """Generate channel commissions (NEW)"""
    print(f"Generating channel commissions...")
    cursor = conn.cursor()

    total_commissions = 0
    start_date = datetime.now() - timedelta(days=365)

    for channel in channels:
        if channel['commission'] > 0:
            # Create 2 commission rates: old and current (simulates rate change)

            # Old rate (started 1 year ago, ended 3 months ago)
            old_rate = channel['commission'] + random.uniform(-2, 2)
            cursor.execute("""
                INSERT INTO channel_commissions (
                    channel_id, commission_rate, valid_from, valid_until,
                    notes, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                channel['id'],
                Decimal(str(round(old_rate, 2))),
                start_date,
                datetime.now() - timedelta(days=90),
                'Taxa anterior',
                datetime.now(),
                datetime.now()
            ))
            total_commissions += 1

            # Current rate (started 3 months ago, no end date)
            cursor.execute("""
                INSERT INTO channel_commissions (
                    channel_id, commission_rate, valid_from, valid_until,
                    notes, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                channel['id'],
                Decimal(str(round(channel['commission'], 2))),
                datetime.now() - timedelta(days=90),
                None,
                'Taxa atual',
                datetime.now(),
                datetime.now()
            ))
            total_commissions += 1

    conn.commit()
    print(f"✓ {total_commissions} channel commissions generated")
    return total_commissions


def generate_customers(conn, num_customers=10000):
    """Generate customers"""
    print(f"Generating {num_customers} customers...")
    cursor = conn.cursor()

    batch = []
    for _ in range(num_customers):
        batch.append((
            fake.name(), fake.email(), fake.phone_number(), fake.cpf(),
            fake.date_of_birth(minimum_age=18, maximum_age=75),
            random.choice(['M', 'F', 'NB', 'O']),
            random.choice([True, False]),
            random.choice([True, False, False]),
            random.choice(['qr_code', 'link', 'balcony', 'pos']),
            datetime.now() - timedelta(days=random.randint(0, 720))
        ))

    execute_batch(cursor, """
        INSERT INTO customers (
            customer_name, email, phone_number, cpf, birth_date, gender,
            agree_terms, receive_promotions_email, registration_origin, created_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, batch, page_size=1000)

    cursor.execute("SELECT id FROM customers")
    customer_ids = [row[0] for row in cursor.fetchall()]

    conn.commit()
    print(f"✓ {len(customer_ids)} customers created")
    return customer_ids


def generate_sales(conn, stores, channels, products, items, option_groups, customers, months=6):
    """Generate sales with realistic patterns"""
    print(f"Generating sales for {months} months...")

    cursor = conn.cursor()
    start_date = datetime.now() - timedelta(days=30 * months)
    end_date = datetime.now()

    # Anomalies
    anomaly_week = start_date + timedelta(days=random.randint(30, 60))
    promo_day = start_date + timedelta(days=random.randint(90, 120))

    current_date = start_date
    total_sales = 0
    batch_size = 500

    while current_date <= end_date:
        weekday = current_date.weekday()
        day_mult = WEEKDAY_MULT[weekday]

        # Anomaly: bad week
        if anomaly_week <= current_date < anomaly_week + timedelta(days=7):
            day_mult *= 0.7

        # Anomaly: promo day
        if current_date.date() == promo_day.date():
            day_mult *= 3.0

        daily_sales = int(random.gauss(2700, 400) * day_mult)

        sales_batch = []

        for _ in range(daily_sales):
            # Hour distribution
            hour_weights = [get_hour_weight(h) * 100 for h in range(24)]
            hour = random.choices(range(24), weights=hour_weights)[0]

            sale_time = current_date.replace(
                hour=hour,
                minute=random.randint(0, 59),
                second=random.randint(0, 59)
            )

            # Select entities
            store_id = random.choice(stores)
            channel = random.choices(channels, weights=[c['weight'] for c in channels])[0]
            customer_id = random.choice(customers) if random.random() > 0.3 else None

            # Generate sale
            sale_data = generate_single_sale(
                sale_time, store_id, channel, customer_id,
                products, items, option_groups
            )

            sales_batch.append(sale_data)

            if len(sales_batch) >= batch_size:
                insert_sales_batch(cursor, sales_batch, items, option_groups)
                total_sales += len(sales_batch)
                sales_batch = []
                conn.commit()

        # Insert remaining
        if sales_batch:
            insert_sales_batch(cursor, sales_batch, items, option_groups)
            total_sales += len(sales_batch)
            conn.commit()

        current_date += timedelta(days=1)

        if current_date.day == 1:
            print(f"  ✓ {current_date.strftime('%B %Y')}: {total_sales:,} sales")

    print(f"✓ {total_sales:,} total sales generated")
    return total_sales


def generate_single_sale(sale_time, store_id, channel, customer_id, products, items, option_groups):
    """Generate a single sale with all related data"""

    # Select 1-5 products
    num_products = min(5, max(1, int(random.expovariate(0.5)) + 1))
    selected_products = random.choices(
        products,
        weights=[p['popularity'] for p in products],
        k=num_products
    )

    # Calculate financial values
    total_items_value = 0
    products_data = []

    for product in selected_products:
        qty = random.randint(1, 3)
        base_price = product['base_price']

        # Items/complements
        items_data = []
        item_additions_price = 0

        if product['has_customization'] and random.random() > 0.4:
            num_items = random.randint(1, 4)
            for _ in range(num_items):
                item = random.choice(items)
                item_qty = 1
                item_price = item['price']
                item_additions_price += item_price

                items_data.append({
                    'item_id': item['id'],
                    'option_group_id': random.choice(option_groups) if random.random() > 0.5 else None,
                    'quantity': item_qty,
                    'additional_price': item_price,
                    'price': item_price
                })

        product_total = (base_price + item_additions_price) * qty
        total_items_value += product_total

        products_data.append({
            'product_id': product['id'],
            'quantity': qty,
            'base_price': base_price,
            'total_price': product_total,
            'items': items_data
        })

    # Discounts
    discount = 0
    discount_reason = None
    if random.random() < 0.2:
        discount = round(total_items_value * random.uniform(0.05, 0.30), 2)
        discount_reason = random.choice(DISCOUNT_REASONS)

    # Increases
    increase = 0
    if random.random() < 0.05:
        increase = round(total_items_value * random.uniform(0.02, 0.10), 2)

    # Delivery fee
    delivery_fee = 0
    if channel['type'] == 'D':
        delivery_fee = random.choice([5.0, 7.0, 9.0, 12.0, 15.0])

    # Service tax
    service_tax = round(total_items_value * 0.10, 2) if random.random() < 0.3 else 0

    # Status
    status = random.choices(SALES_STATUS, STATUS_WEIGHTS)[0]

    # Total
    total_amount = total_items_value - discount + increase + delivery_fee + service_tax
    value_paid = total_amount if status == 'COMPLETED' else 0

    # Operational times
    production_sec = random.randint(300, 2400) if status == 'COMPLETED' else None
    delivery_sec = random.randint(600, 3600) if channel['type'] == 'D' and status == 'COMPLETED' else None

    # Delivery details
    delivery_data = None
    if channel['type'] == 'D' and status == 'COMPLETED':
        lat = -23.5 + random.uniform(-10, 5)
        long = -46.6 + random.uniform(-10, 10)

        delivery_data = {
            'courier_name': fake.name(),
            'courier_phone': fake.phone_number(),
            'courier_type': random.choice(COURIER_TYPES),
            'delivery_type': random.choice(DELIVERY_TYPES),
            'status': 'DELIVERED',
            'delivery_fee': delivery_fee,
            'courier_fee': round(delivery_fee * 0.6, 2),
            'address': {
                'street': fake.street_name(),
                'number': str(random.randint(10, 9999)),
                'complement': random.choice(['Apto 101', 'Casa', 'Bloco A', 'Fundos', None, None]) if random.random() > 0.5 else None,
                'neighborhood': fake.bairro(),
                'city': fake.city(),
                'state': fake.estado_sigla(),
                'postal_code': fake.postcode(),
                'latitude': lat,
                'longitude': long
            }
        }

    # Payments
    payments = []
    if status == 'COMPLETED':
        num_payments = random.choices([1, 2], weights=[0.85, 0.15])[0]

        if num_payments == 1:
            payments = [{'type': random.choice(PAYMENT_TYPES_LIST), 'value': value_paid}]
        else:
            split = round(value_paid * random.uniform(0.3, 0.7), 2)
            payments = [
                {'type': random.choice(PAYMENT_TYPES_LIST[:3]), 'value': split},
                {'type': random.choice(PAYMENT_TYPES_LIST), 'value': value_paid - split}
            ]

    return {
        'store_id': store_id,
        'customer_id': customer_id,
        'customer_name': fake.name() if not customer_id else None,
        'channel_id': channel['id'],
        'created_at': sale_time,
        'status': status,
        'total_items_value': total_items_value,
        'discount': discount,
        'discount_reason': discount_reason,
        'increase': increase,
        'delivery_fee': delivery_fee,
        'service_tax': service_tax,
        'total_amount': total_amount,
        'value_paid': value_paid,
        'production_sec': production_sec,
        'delivery_sec': delivery_sec,
        'people_qty': random.randint(1, 8) if channel['type'] == 'P' else None,
        'products': products_data,
        'delivery': delivery_data,
        'payments': payments
    }


def insert_sales_batch(cursor, sales_batch, items, option_groups):
    """Insert batch of sales with all related data"""

    # Insert sales
    sales_data = [(
        s['store_id'], s['customer_id'], s['channel_id'],
        s['customer_name'], s['created_at'], s['status'],
        Decimal(str(s['total_items_value'])),
        Decimal(str(s['discount'])),
        Decimal(str(s['increase'])),
        Decimal(str(s['delivery_fee'])),
        Decimal(str(s['service_tax'])),
        Decimal(str(s['total_amount'])),
        Decimal(str(s['value_paid'])),
        s['production_sec'], s['delivery_sec'],
        s['discount_reason'], s['people_qty'], 'POS'
    ) for s in sales_batch]

    execute_batch(cursor, """
        INSERT INTO sales (
            store_id, customer_id, channel_id, customer_name,
            created_at, sale_status_desc,
            total_amount_items, total_discount, total_increase,
            delivery_fee, service_tax_fee, total_amount, value_paid,
            production_seconds, delivery_seconds,
            discount_reason, people_quantity, origin
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, sales_data, page_size=500)

    # Get inserted sale IDs
    cursor.execute("""
        SELECT id FROM sales
        ORDER BY id DESC
        LIMIT %s
    """, (len(sales_batch),))
    sale_ids = [row[0] for row in cursor.fetchall()]
    sale_ids.reverse()

    # Insert product_sales and related data
    for sale_id, sale in zip(sale_ids, sales_batch):
        for prod_data in sale['products']:
            cursor.execute("""
                INSERT INTO product_sales (
                    sale_id, product_id, quantity, base_price, total_price
                ) VALUES (%s,%s,%s,%s,%s) RETURNING id
            """, (
                sale_id, prod_data['product_id'],
                prod_data['quantity'], prod_data['base_price'],
                prod_data['total_price']
            ))
            product_sale_id = cursor.fetchone()[0]

            # Insert items
            for item_data in prod_data['items']:
                cursor.execute("""
                    INSERT INTO item_product_sales (
                        product_sale_id, item_id, option_group_id,
                        quantity, additional_price, price, amount
                    ) VALUES (%s,%s,%s,%s,%s,%s,%s)
                """, (
                    product_sale_id, item_data['item_id'],
                    item_data['option_group_id'],
                    item_data['quantity'], item_data['additional_price'],
                    item_data['price'], 1
                ))

        # Insert delivery
        if sale['delivery']:
            d = sale['delivery']
            cursor.execute("""
                INSERT INTO delivery_sales (
                    sale_id, courier_name, courier_phone, courier_type,
                    delivery_type, status, delivery_fee, courier_fee
                ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
            """, (
                sale_id, d['courier_name'], d['courier_phone'],
                d['courier_type'], d['delivery_type'], d['status'],
                d['delivery_fee'], d['courier_fee']
            ))
            delivery_sale_id = cursor.fetchone()[0]

            addr = d['address']
            lat = max(-33.0, min(-5.0, addr['latitude']))
            long = max(-74.0, min(-34.0, addr['longitude']))

            cursor.execute("""
                INSERT INTO delivery_addresses (
                    sale_id, delivery_sale_id, street, number, complement,
                    neighborhood, city, state, postal_code, latitude, longitude
                ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                sale_id, delivery_sale_id, addr['street'], addr['number'],
                addr['complement'], addr['neighborhood'], addr['city'],
                addr['state'], addr['postal_code'], lat, long
            ))

        # Insert payments
        for payment in sale['payments']:
            cursor.execute(
                "SELECT id FROM payment_types WHERE description = %s LIMIT 1",
                (payment['type'],)
            )
            result = cursor.fetchone()
            if result:
                cursor.execute("""
                    INSERT INTO payments (sale_id, payment_type_id, value)
                    VALUES (%s,%s,%s)
                """, (sale_id, result[0], Decimal(str(payment['value']))))


def create_indexes(conn):
    """Create performance indexes"""
    print("Creating indexes...")
    cursor = conn.cursor()

    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_sales_date_status ON sales(DATE(created_at), sale_status_desc)",
        "CREATE INDEX IF NOT EXISTS idx_product_sales_product_sale ON product_sales(product_id, sale_id)",
        "CREATE INDEX IF NOT EXISTS idx_product_costs_product_date ON product_costs(product_id, valid_from)",
        "CREATE INDEX IF NOT EXISTS idx_operating_expenses_store_period ON operating_expenses(store_id, period)",
        "CREATE INDEX IF NOT EXISTS idx_fixed_costs_store ON fixed_costs(store_id)",
        "CREATE INDEX IF NOT EXISTS idx_channel_commissions_channel ON channel_commissions(channel_id, valid_from)",
    ]

    for idx in indexes:
        try:
            cursor.execute(idx)
        except Exception as e:
            print(f"  Warning: {e}")

    conn.commit()
    print("✓ Indexes created")


def main():
    parser = argparse.ArgumentParser(description='Generate God Level Challenge data V2 (with financial data)')
    parser.add_argument('--db-url', default='postgresql://challenge:challenge@localhost:5432/challenge_db',
                       help='PostgreSQL connection URL')
    parser.add_argument('--stores', type=int, default=50, help='Number of stores')
    parser.add_argument('--products', type=int, default=500, help='Number of products')
    parser.add_argument('--items', type=int, default=200, help='Number of items/complements')
    parser.add_argument('--customers', type=int, default=10000, help='Number of customers')
    parser.add_argument('--suppliers', type=int, default=5, help='Number of suppliers')
    parser.add_argument('--months', type=int, default=6, help='Months of data history')

    args = parser.parse_args()

    print("=" * 70)
    print("God Level Coder Challenge - Data Generator V2")
    print("=" * 70)
    print(f"Generating {args.months} months of complete restaurant data...")
    print("Including: Sales, Products, Customers, Costs, Suppliers, Expenses")
    print()

    conn = get_db_connection(args.db_url)

    try:
        # Base data
        sub_brand_ids, channels = setup_base_data(conn)

        # Financial entities (NEW)
        suppliers = generate_suppliers(conn, args.suppliers)

        # Operational data
        stores = generate_stores(conn, sub_brand_ids, args.stores)
        products, items, option_groups = generate_products_and_items(
            conn, sub_brand_ids, args.products, args.items
        )

        # Financial data (NEW)
        product_costs = generate_product_costs(conn, products, suppliers, args.months)
        operating_expenses = generate_operating_expenses(conn, stores, args.months)
        fixed_costs = generate_fixed_costs(conn, stores)
        channel_commissions = generate_channel_commissions(conn, channels)

        # Customers and sales
        customers = generate_customers(conn, args.customers)
        total_sales = generate_sales(
            conn, stores, channels, products, items,
            option_groups, customers, args.months
        )

        create_indexes(conn)

        # Final stats
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM sales")
        sales_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM product_sales")
        product_sales_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM item_product_sales")
        item_sales_count = cursor.fetchone()[0]

        print()
        print("=" * 70)
        print("✓ Data generation complete!")
        print()
        print("OPERATIONAL DATA:")
        print(f"  Stores: {len(stores):,}")
        print(f"  Products: {len(products):,}")
        print(f"  Items/Complements: {len(items):,}")
        print(f"  Customers: {len(customers):,}")
        print(f"  Sales: {sales_count:,}")
        print(f"  Product Sales: {product_sales_count:,}")
        print(f"  Item Customizations: {item_sales_count:,}")
        print()
        print("FINANCIAL DATA (Phase 1):")
        print(f"  Suppliers: {len(suppliers):,}")
        print(f"  Product Costs (historical): {product_costs:,}")
        print(f"  Operating Expenses: {operating_expenses:,}")
        print(f"  Fixed Costs: {fixed_costs:,}")
        print(f"  Channel Commissions: {channel_commissions:,}")
        print()
        print(f"  Avg items per sale: {product_sales_count/sales_count:.1f}")
        print("=" * 70)

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()
