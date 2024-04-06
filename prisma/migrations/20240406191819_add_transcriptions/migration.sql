-- CreateTable
CREATE TABLE "Transcription" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "end_time" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transcription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
