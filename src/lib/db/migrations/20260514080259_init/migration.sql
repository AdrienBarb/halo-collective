-- CreateEnum
CREATE TYPE "Sport" AS ENUM ('TENNIS');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "NewsletterStatus" AS ENUM ('DRAFT', 'SENDING', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('ATHLETE_REVIEW', 'WEEK_RECAP', 'COMING_UP', 'MONETISATION', 'FAN_ENGAGEMENT');

-- CreateEnum
CREATE TYPE "EditionMode" AS ENUM ('TOURNAMENT', 'WEEKLY');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "countryCode" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "tracking_params" JSONB,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "interest_sports" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interest_lifestyle" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interest_brands" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "athlete" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "sport" "Sport" NOT NULL DEFAULT 'TENNIS',
    "tour" TEXT,
    "countryCode" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "coverImageUrl" TEXT,
    "worldRank" INTEGER,
    "countryRank" INTEGER,
    "titlesCount" INTEGER NOT NULL DEFAULT 0,
    "socialLinks" JSONB,
    "welcomeMessage" VARCHAR(4000),
    "brevoListId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athlete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsor" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "editionNumber" INTEGER NOT NULL,
    "editionDate" TIMESTAMP(3),
    "editionMode" "EditionMode" NOT NULL DEFAULT 'WEEKLY',
    "title" TEXT NOT NULL,
    "emailSubject" TEXT,
    "slug" TEXT NOT NULL,
    "heroImageUrl" TEXT,
    "tournamentName" TEXT,
    "tournamentLogoUrl" TEXT,
    "tournamentCategory" TEXT,
    "tournamentLocation" TEXT,
    "tournamentSurface" TEXT,
    "tournamentStartDate" TIMESTAMP(3),
    "tournamentEndDate" TIMESTAMP(3),
    "worldRankSnapshot" INTEGER,
    "countryRankSnapshot" INTEGER,
    "status" "NewsletterStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "renderedHtml" TEXT,
    "brevoCampaignId" TEXT,
    "brevoSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fan_engagement_response" (
    "id" TEXT NOT NULL,
    "newsletterId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "blockKind" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "optionIndex" INTEGER,
    "isCorrect" BOOLEAN,
    "reaction" TEXT,
    "rating" INTEGER,
    "text" TEXT,
    "consentGiven" BOOLEAN,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fan_engagement_response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_section" (
    "id" TEXT NOT NULL,
    "newsletterId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "SectionType" NOT NULL,
    "blocks" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "brevoContactId" TEXT,
    "partnerOffersConsent" BOOLEAN NOT NULL DEFAULT false,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "newsletter_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "position" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "athlete_slug_key" ON "athlete"("slug");

-- CreateIndex
CREATE INDEX "sponsor_athleteId_idx" ON "sponsor"("athleteId");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_athleteId_slug_key" ON "newsletter"("athleteId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_athleteId_editionNumber_key" ON "newsletter"("athleteId", "editionNumber");

-- CreateIndex
CREATE INDEX "fan_engagement_response_newsletterId_blockId_idx" ON "fan_engagement_response"("newsletterId", "blockId");

-- CreateIndex
CREATE INDEX "fan_engagement_response_userId_idx" ON "fan_engagement_response"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "fan_engagement_response_newsletterId_blockId_userId_key" ON "fan_engagement_response"("newsletterId", "blockId", "userId");

-- CreateIndex
CREATE INDEX "newsletter_section_newsletterId_idx" ON "newsletter_section"("newsletterId");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_section_newsletterId_order_key" ON "newsletter_section"("newsletterId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscription_userId_athleteId_key" ON "newsletter_subscription"("userId", "athleteId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_email_key" ON "waitlist"("email");

-- AddForeignKey
ALTER TABLE "sponsor" ADD CONSTRAINT "sponsor_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter" ADD CONSTRAINT "newsletter_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fan_engagement_response" ADD CONSTRAINT "fan_engagement_response_newsletterId_fkey" FOREIGN KEY ("newsletterId") REFERENCES "newsletter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fan_engagement_response" ADD CONSTRAINT "fan_engagement_response_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_section" ADD CONSTRAINT "newsletter_section_newsletterId_fkey" FOREIGN KEY ("newsletterId") REFERENCES "newsletter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_subscription" ADD CONSTRAINT "newsletter_subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_subscription" ADD CONSTRAINT "newsletter_subscription_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
