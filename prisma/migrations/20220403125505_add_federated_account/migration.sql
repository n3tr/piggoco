-- CreateEnum
CREATE TYPE "FederationProvider" AS ENUM ('FACEBOOK_PAGE', 'FACEBOOK_APP');

-- CreateTable
CREATE TABLE "FederatedAccount" (
    "userId" VARCHAR(32) NOT NULL,
    "provider" "FederationProvider" NOT NULL,
    "subject" VARCHAR(32) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FederatedAccount_userId_provider_subject_key" ON "FederatedAccount"("userId", "provider", "subject");

-- AddForeignKey
ALTER TABLE "FederatedAccount" ADD CONSTRAINT "FederatedAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
