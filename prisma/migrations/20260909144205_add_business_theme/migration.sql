-- CreateTable
CREATE TABLE "BusinessTheme" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#fbbf24',
    "backgroundColor" TEXT NOT NULL DEFAULT '#0c0a09',
    "surfaceColor" TEXT NOT NULL DEFAULT '#1c1917',
    "textColor" TEXT NOT NULL DEFAULT '#f5f5f4',
    "borderRadius" TEXT NOT NULL DEFAULT 'large',
    "buttonStyle" TEXT NOT NULL DEFAULT 'filled',
    "fontFamily" TEXT NOT NULL DEFAULT 'default',
    "showAddress" BOOLEAN NOT NULL DEFAULT true,
    "showPhone" BOOLEAN NOT NULL DEFAULT true,
    "showPrices" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessTheme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessTheme_businessId_key" ON "BusinessTheme"("businessId");

-- AddForeignKey
ALTER TABLE "BusinessTheme" ADD CONSTRAINT "BusinessTheme_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
