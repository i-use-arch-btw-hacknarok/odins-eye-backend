/*
  Warnings:

  - Added the required column `tags` to the `Conference` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conference" ADD COLUMN     "tags" TEXT NOT NULL;
