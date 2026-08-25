-- CreateTable
CREATE TABLE "login_activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'success',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_activity_userId_created_at_idx" ON "login_activity"("userId", "created_at" DESC);

-- CreateIndex
CREATE INDEX "login_activity_created_at_idx" ON "login_activity"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "login_activity" ADD CONSTRAINT "login_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
