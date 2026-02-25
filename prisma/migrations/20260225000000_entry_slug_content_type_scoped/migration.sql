-- DropIndex
DROP INDEX "entries_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "entries_content_type_id_slug_key" ON "entries"("content_type_id", "slug");
