-- CreateTable
CREATE TABLE "Engagement" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "engagement_percentage" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Engagement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
