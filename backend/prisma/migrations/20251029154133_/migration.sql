-- CreateTable
CREATE TABLE "public"."brands" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sub_brands" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stores" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "sub_brand_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100),
    "state" VARCHAR(2),
    "district" VARCHAR(100),
    "address_street" VARCHAR(200),
    "address_number" INTEGER,
    "zipcode" VARCHAR(10),
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_own" BOOLEAN NOT NULL DEFAULT false,
    "is_holding" BOOLEAN NOT NULL DEFAULT false,
    "creation_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."channels" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "type" CHAR(1) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "sub_brand_id" INTEGER,
    "name" VARCHAR(200) NOT NULL,
    "type" CHAR(1) NOT NULL DEFAULT 'P',
    "pos_uuid" VARCHAR(100),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "sub_brand_id" INTEGER,
    "category_id" INTEGER,
    "name" VARCHAR(500) NOT NULL,
    "pos_uuid" VARCHAR(100),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."option_groups" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "sub_brand_id" INTEGER,
    "category_id" INTEGER,
    "name" VARCHAR(500) NOT NULL,
    "pos_uuid" VARCHAR(100),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "option_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."items" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "sub_brand_id" INTEGER,
    "category_id" INTEGER,
    "name" VARCHAR(500) NOT NULL,
    "pos_uuid" VARCHAR(100),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" SERIAL NOT NULL,
    "customer_name" VARCHAR(100),
    "email" VARCHAR(100),
    "phone_number" VARCHAR(50),
    "cpf" VARCHAR(100),
    "birth_date" DATE,
    "gender" VARCHAR(10),
    "store_id" INTEGER,
    "sub_brand_id" INTEGER,
    "registration_origin" VARCHAR(20),
    "agree_terms" BOOLEAN NOT NULL DEFAULT false,
    "receive_promotions_email" BOOLEAN NOT NULL DEFAULT false,
    "receive_promotions_sms" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sales" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "sub_brand_id" INTEGER,
    "customer_id" INTEGER,
    "channel_id" INTEGER NOT NULL,
    "cod_sale1" VARCHAR(100),
    "cod_sale2" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL,
    "customer_name" VARCHAR(100),
    "sale_status_desc" VARCHAR(100) NOT NULL,
    "total_amount_items" DECIMAL(10,2) NOT NULL,
    "total_discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_increase" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "delivery_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "service_tax_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "value_paid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "production_seconds" INTEGER,
    "delivery_seconds" INTEGER,
    "people_quantity" INTEGER,
    "discount_reason" VARCHAR(300),
    "increase_reason" VARCHAR(300),
    "origin" VARCHAR(100) NOT NULL DEFAULT 'POS',

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_sales" (
    "id" SERIAL NOT NULL,
    "sale_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "base_price" DOUBLE PRECISION NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "observations" VARCHAR(300),

    CONSTRAINT "product_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."item_product_sales" (
    "id" SERIAL NOT NULL,
    "product_sale_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "option_group_id" INTEGER,
    "quantity" DOUBLE PRECISION NOT NULL,
    "additional_price" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "observations" VARCHAR(300),

    CONSTRAINT "item_product_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."item_item_product_sales" (
    "id" SERIAL NOT NULL,
    "item_product_sale_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "option_group_id" INTEGER,
    "quantity" DOUBLE PRECISION NOT NULL,
    "additional_price" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "item_item_product_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."delivery_sales" (
    "id" SERIAL NOT NULL,
    "sale_id" INTEGER NOT NULL,
    "courier_id" VARCHAR(100),
    "courier_name" VARCHAR(100),
    "courier_phone" VARCHAR(100),
    "courier_type" VARCHAR(100),
    "delivered_by" VARCHAR(100),
    "delivery_type" VARCHAR(100),
    "status" VARCHAR(100),
    "delivery_fee" DOUBLE PRECISION,
    "courier_fee" DOUBLE PRECISION,
    "timing" VARCHAR(100),
    "mode" VARCHAR(100),

    CONSTRAINT "delivery_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."delivery_addresses" (
    "id" SERIAL NOT NULL,
    "sale_id" INTEGER NOT NULL,
    "delivery_sale_id" INTEGER,
    "street" VARCHAR(200),
    "number" VARCHAR(20),
    "complement" VARCHAR(200),
    "formatted_address" VARCHAR(500),
    "neighborhood" VARCHAR(100),
    "city" VARCHAR(100),
    "state" VARCHAR(50),
    "country" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "reference" VARCHAR(300),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "delivery_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_types" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER,
    "description" VARCHAR(100) NOT NULL,

    CONSTRAINT "payment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" SERIAL NOT NULL,
    "sale_id" INTEGER NOT NULL,
    "payment_type_id" INTEGER,
    "value" DECIMAL(10,2) NOT NULL,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "description" VARCHAR(100),
    "currency" VARCHAR(10) NOT NULL DEFAULT 'BRL',

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coupons" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER,
    "code" VARCHAR(50) NOT NULL,
    "discount_type" VARCHAR(1),
    "discount_value" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coupon_sales" (
    "id" SERIAL NOT NULL,
    "sale_id" INTEGER,
    "coupon_id" INTEGER,
    "value" DOUBLE PRECISION,
    "target" VARCHAR(100),
    "sponsorship" VARCHAR(100),

    CONSTRAINT "coupon_sales_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."sub_brands" ADD CONSTRAINT "sub_brands_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stores" ADD CONSTRAINT "stores_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stores" ADD CONSTRAINT "stores_sub_brand_id_fkey" FOREIGN KEY ("sub_brand_id") REFERENCES "public"."sub_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."channels" ADD CONSTRAINT "channels_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_sub_brand_id_fkey" FOREIGN KEY ("sub_brand_id") REFERENCES "public"."sub_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_sub_brand_id_fkey" FOREIGN KEY ("sub_brand_id") REFERENCES "public"."sub_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."option_groups" ADD CONSTRAINT "option_groups_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."option_groups" ADD CONSTRAINT "option_groups_sub_brand_id_fkey" FOREIGN KEY ("sub_brand_id") REFERENCES "public"."sub_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."option_groups" ADD CONSTRAINT "option_groups_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."items" ADD CONSTRAINT "items_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."items" ADD CONSTRAINT "items_sub_brand_id_fkey" FOREIGN KEY ("sub_brand_id") REFERENCES "public"."sub_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."items" ADD CONSTRAINT "items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_sub_brand_id_fkey" FOREIGN KEY ("sub_brand_id") REFERENCES "public"."sub_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales" ADD CONSTRAINT "sales_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales" ADD CONSTRAINT "sales_sub_brand_id_fkey" FOREIGN KEY ("sub_brand_id") REFERENCES "public"."sub_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales" ADD CONSTRAINT "sales_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales" ADD CONSTRAINT "sales_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_sales" ADD CONSTRAINT "product_sales_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_sales" ADD CONSTRAINT "product_sales_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_product_sales" ADD CONSTRAINT "item_product_sales_product_sale_id_fkey" FOREIGN KEY ("product_sale_id") REFERENCES "public"."product_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_product_sales" ADD CONSTRAINT "item_product_sales_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_product_sales" ADD CONSTRAINT "item_product_sales_option_group_id_fkey" FOREIGN KEY ("option_group_id") REFERENCES "public"."option_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_item_product_sales" ADD CONSTRAINT "item_item_product_sales_item_product_sale_id_fkey" FOREIGN KEY ("item_product_sale_id") REFERENCES "public"."item_product_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_item_product_sales" ADD CONSTRAINT "item_item_product_sales_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_item_product_sales" ADD CONSTRAINT "item_item_product_sales_option_group_id_fkey" FOREIGN KEY ("option_group_id") REFERENCES "public"."option_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."delivery_sales" ADD CONSTRAINT "delivery_sales_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."delivery_addresses" ADD CONSTRAINT "delivery_addresses_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."delivery_addresses" ADD CONSTRAINT "delivery_addresses_delivery_sale_id_fkey" FOREIGN KEY ("delivery_sale_id") REFERENCES "public"."delivery_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_types" ADD CONSTRAINT "payment_types_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_payment_type_id_fkey" FOREIGN KEY ("payment_type_id") REFERENCES "public"."payment_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupons" ADD CONSTRAINT "coupons_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupon_sales" ADD CONSTRAINT "coupon_sales_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupon_sales" ADD CONSTRAINT "coupon_sales_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
