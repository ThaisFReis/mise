#!/bin/bash
# Convenience script to run data generator with .env configuration

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}God Level Data Generator${NC}"
echo "================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found!${NC}"
    echo ""
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env with your Railway credentials:${NC}"
    echo "  nano .env"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if venv exists
if [ ! -d venv ]; then
    echo -e "${RED}✗ Virtual environment not found!${NC}"
    echo "Please create it first:"
    echo "  python3 -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r requirements.txt"
    exit 1
fi

# Activate venv
source venv/bin/activate

# Load .env to show connection info
source .env

echo -e "${GREEN}✓ Configuration loaded from .env${NC}"
echo "  Database: $(echo $DATABASE_URL | sed 's/:[^:]*@/:****@/')"
echo "  Months: ${MONTHS:-6}"
echo "  Stores: ${STORES:-50}"
echo "  Products: ${PRODUCTS:-500}"
echo "  Items: ${ITEMS:-200}"
echo "  Customers: ${CUSTOMERS:-10000}"
echo ""

# Test connection first
echo "Testing database connection..."
python test_connection.py "$DATABASE_URL"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Connection test failed!${NC}"
    echo "Please check your .env configuration."
    exit 1
fi

echo ""
echo -e "${GREEN}Starting data generation...${NC}"
echo ""

# Run generator
python generate_data.py "$@"

echo ""
echo -e "${GREEN}✓ Done!${NC}"
