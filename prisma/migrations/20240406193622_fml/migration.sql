/*
  Warnings:

  - You are about to drop the column `engagement_id` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `transcription_id` on the `Video` table. All the data in the column will be lost.
  - Added the required column `video_id` to the `Engagement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `video_id` to the `Transcription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_engagement_id_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_transcription_id_fkey";

-- AlterTable
ALTER TABLE "Engagement" ADD COLUMN     "video_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transcription" ADD COLUMN     "video_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "engagement_id",
DROP COLUMN "transcription_id";

-- AddForeignKey
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
