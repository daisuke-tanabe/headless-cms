-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('text', 'richtext', 'number', 'date', 'boolean');

-- CreateTable
CREATE TABLE "content_types" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fields" (
    "id" TEXT NOT NULL,
    "content_type_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FieldType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entries" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content_type_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "hashed_key" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_types_org_id_idx" ON "content_types"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_types_org_id_slug_key" ON "content_types"("org_id", "slug");

-- CreateIndex
CREATE INDEX "fields_content_type_id_idx" ON "fields"("content_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "fields_content_type_id_slug_key" ON "fields"("content_type_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "entries_slug_key" ON "entries"("slug");

-- CreateIndex
CREATE INDEX "entries_org_id_idx" ON "entries"("org_id");

-- CreateIndex
CREATE INDEX "entries_content_type_id_idx" ON "entries"("content_type_id");

-- CreateIndex
CREATE INDEX "entries_deleted_at_idx" ON "entries"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_hashed_key_key" ON "api_keys"("hashed_key");

-- CreateIndex
CREATE INDEX "api_keys_org_id_idx" ON "api_keys"("org_id");

-- CreateIndex
CREATE INDEX "api_keys_hashed_key_idx" ON "api_keys"("hashed_key");

-- AddForeignKey
ALTER TABLE "fields" ADD CONSTRAINT "fields_content_type_id_fkey" FOREIGN KEY ("content_type_id") REFERENCES "content_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_content_type_id_fkey" FOREIGN KEY ("content_type_id") REFERENCES "content_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
