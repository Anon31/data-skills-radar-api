-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'VISITOR');

-- CreateEnum
CREATE TYPE "NiveauImpactIA" AS ENUM ('FORT', 'MOYEN', 'FAIBLE', 'INCONNU');

-- CreateEnum
CREATE TYPE "CategorieCompetence" AS ENUM ('TECHNIQUE', 'COMPORTEMENTALE', 'OUTIL', 'CERTIFICATION');

-- CreateEnum
CREATE TYPE "TypeTache" AS ENUM ('COGNITIVE_ROUTINIERE', 'COGNITIVE_COMPLEXE', 'MANUELLE_ROUTINIERE', 'MANUELLE_COMPLEXE');

-- CreateEnum
CREATE TYPE "TendanceEmploi" AS ENUM ('EN_CROISSANCE', 'EN_DECLIN', 'EN_MUTATION', 'STABLE');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "role" "Role" NOT NULL DEFAULT 'VISITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" UUID NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Address_userId_key" ON "Address"("userId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
