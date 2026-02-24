-- DropForeignKey
ALTER TABLE "entries" DROP CONSTRAINT "entries_content_type_id_fkey";

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_content_type_id_fkey" FOREIGN KEY ("content_type_id") REFERENCES "content_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
