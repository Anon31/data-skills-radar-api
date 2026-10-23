# ==========================================
# ÉTAPE 1 : Build (Construction)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances et du schéma Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Installation de toutes les dépendances (y compris dev)
RUN npm ci

# Génération du client Prisma
RUN npx prisma generate

# Copie du reste du code source et compilation NestJS
COPY . .
RUN npm run build

# ==========================================
# ÉTAPE 2 : Production (Image finale allégée)
# ==========================================
FROM node:22-alpine

WORKDIR /app

# Définition de l'environnement de production
ENV NODE_ENV=production

# Copie des dépendances et du schéma Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Installation UNIQUEMENT des dépendances de production
RUN npm ci --omit=dev

# Génération du client Prisma pour la production
RUN npx prisma generate

# Copie du build compilé depuis l'étape précédente
COPY --from=builder /app/dist ./dist

# Exposition du port de l'API
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "start:prod"]