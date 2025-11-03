#!/usr/bin/env python3
"""Test PostgreSQL connection"""
import sys
import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get DATABASE_URL from .env or command line argument
db_url = sys.argv[1] if len(sys.argv) > 1 else os.getenv('DATABASE_URL', "postgresql://postgres:password@localhost:5432/railway")

# Parse connection info for display
from urllib.parse import urlparse
parsed = urlparse(db_url)

print(f"Testing connection to Railway PostgreSQL...")
print(f"Host: {parsed.hostname}:{parsed.port}")
print(f"Database: {parsed.path.lstrip('/')}")
print()

try:
    print("Attempting to connect...")
    conn = psycopg2.connect(db_url, connect_timeout=10)
    print("✓ Connection successful!")

    cursor = conn.cursor()
    cursor.execute("SELECT version()")
    version = cursor.fetchone()[0]
    print(f"✓ PostgreSQL version: {version}")

    # Check if tables exist
    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    tables = cursor.fetchall()

    if tables:
        print(f"\n✓ Found {len(tables)} tables:")
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
            count = cursor.fetchone()[0]
            print(f"  - {table[0]}: {count} records")
    else:
        print("\n⚠ No tables found. Database is empty.")
        print("  You may need to run migrations first.")

    conn.close()
    print("\n✓ Connection test completed successfully!")

except psycopg2.OperationalError as e:
    print(f"\n✗ Connection failed!")
    print(f"Error: {e}")
    print("\nPossible solutions:")
    print("1. Check if Railway service is running")
    print("2. Verify credentials in Railway dashboard")
    print("3. Wait a few minutes if service was just restarted")
    print("4. Check if database was properly initialized with schema")
    sys.exit(1)

except Exception as e:
    print(f"\n✗ Unexpected error: {e}")
    sys.exit(1)
