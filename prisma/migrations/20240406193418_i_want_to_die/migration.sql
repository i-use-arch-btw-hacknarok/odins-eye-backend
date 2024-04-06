-- DropForeignKey
ALTER TABLE "Conference" DROP CONSTRAINT "Conference_video_id_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_engagement_id_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_transcription_id_fkey";

-- AlterTable
ALTER TABLE "Conference" ALTER COLUMN "video_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "engagement_id" DROP NOT NULL,
ALTER COLUMN "transcription_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Conference" ADD CONSTRAINT "Conference_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_engagement_id_fkey" FOREIGN KEY ("engagement_id") REFERENCES "Engagement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_transcription_id_fkey" FOREIGN KEY ("transcription_id") REFERENCES "Transcription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
