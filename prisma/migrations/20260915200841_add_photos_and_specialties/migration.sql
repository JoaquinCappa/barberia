-- AlterTable
ALTER TABLE "Barber" ADD COLUMN     "specialties" TEXT;

-- CreateTable
CREATE TABLE "BusinessPhoto" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarberPhoto" (
    "id" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BarberPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessPhoto_businessId_sortOrder_idx" ON "BusinessPhoto"("businessId", "sortOrder");

-- CreateIndex
CREATE INDEX "BarberPhoto_barberId_sortOrder_idx" ON "BarberPhoto"("barberId", "sortOrder");

-- AddForeignKey
ALTER TABLE "BusinessPhoto" ADD CONSTRAINT "BusinessPhoto_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarberPhoto" ADD CONSTRAINT "BarberPhoto_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
