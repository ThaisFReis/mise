#!/bin/bash

echo "======================================================================"
echo "Backend Verification Script"
echo "======================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1 - MISSING"
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
    else
        echo -e "${RED}✗${NC} $1/ - MISSING"
    fi
}

echo "Checking directory structure..."
echo "----------------------------------------------------------------------"
check_dir "src"
check_dir "src/config"
check_dir "src/controllers"
check_dir "src/services"
check_dir "src/routes"
check_dir "src/middleware"
check_dir "src/types"
check_dir "prisma"
echo ""

echo "Checking configuration files..."
echo "----------------------------------------------------------------------"
check_file "package.json"
check_file "tsconfig.json"
check_file "Dockerfile"
check_file ".env"
check_file ".env.example"
check_file ".gitignore"
check_file "README.md"
echo ""

echo "Checking source files..."
echo "----------------------------------------------------------------------"
check_file "src/server.ts"
check_file "src/config/database.ts"
check_file "src/config/redis.ts"
check_file "src/config/env.ts"
check_file "src/middleware/errorHandler.ts"
check_file "src/types/index.ts"
echo ""

echo "Checking services..."
echo "----------------------------------------------------------------------"
check_file "src/services/cacheService.ts"
check_file "src/services/dashboardService.ts"
check_file "src/services/productService.ts"
check_file "src/services/channelService.ts"
check_file "src/services/storeService.ts"
echo ""

echo "Checking controllers..."
echo "----------------------------------------------------------------------"
check_file "src/controllers/dashboardController.ts"
check_file "src/controllers/productController.ts"
check_file "src/controllers/channelController.ts"
check_file "src/controllers/storeController.ts"
echo ""

echo "Checking routes..."
echo "----------------------------------------------------------------------"
check_file "src/routes/index.ts"
check_file "src/routes/dashboard.ts"
check_file "src/routes/products.ts"
check_file "src/routes/channels.ts"
check_file "src/routes/stores.ts"
echo ""

echo "Checking Prisma..."
echo "----------------------------------------------------------------------"
check_file "prisma/schema.prisma"
echo ""

echo "======================================================================"
echo "Verification complete!"
echo "======================================================================"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Install dependencies: npm install"
echo "2. Generate Prisma Client: npm run prisma:generate"
echo "3. Start the server: npm run dev"
echo ""
