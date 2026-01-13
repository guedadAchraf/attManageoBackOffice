/*
  Warnings:

  - You are about to drop the column `formSubmissionId` on the `excel_files` table. All the data in the column will be lost.
  - Added the required column `formId` to the `excel_files` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "excel_files" DROP CONSTRAINT "excel_files_formSubmissionId_fkey";

-- DropIndex
DROP INDEX "excel_files_formSubmissionId_key";

-- AlterTable
ALTER TABLE "excel_files" DROP COLUMN "formSubmissionId",
ADD COLUMN     "formId" INTEGER NOT NULL,
ADD COLUMN     "submissionsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "excel_files" ADD CONSTRAINT "excel_files_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
