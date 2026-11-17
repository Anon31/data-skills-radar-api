#!/bin/bash

# ==============================================================================
# Script d'amorçage local pour HashiCorp Vault (Data Skills Radar)
# ==============================================================================

VAULT_CONTAINER="dsr-vault"
DEV_TOKEN="dsr_dev_vault_token"
VAULT_URL="http://127.0.0.1:8200"

echo "⏳ Vérification de l'état de Vault..."

# Vérification que le conteneur tourne bien avant de continuer
if ! docker ps | grep -q $VAULT_CONTAINER; then
  echo "❌ Erreur : Le conteneur $VAULT_CONTAINER ne tourne pas !"
  echo "👉 Lance d'abord : docker compose up -d"
  exit 1
fi

sleep 3

# 1. Connexion en Root (Mode Dev)
echo "🔑 Authentification..."
docker exec -e VAULT_ADDR=$VAULT_URL -i $VAULT_CONTAINER vault login $DEV_TOKEN

# 2. Activation du moteur de secrets (Key-Value v2)
echo "📂 Activation du moteur KV-v2..."
docker exec -e VAULT_ADDR=$VAULT_URL -i $VAULT_CONTAINER vault secrets enable -path=secret kv-v2 2>/dev/null || true

# 3. Injection des secrets locaux (Variables de dev)
# NOTE: Le chemin correspond exactement à ce que NestJS demande (dataskillsradar/development/backend)
echo "💉 Injection des secrets de développement..."
docker exec -e VAULT_ADDR=$VAULT_URL -i $VAULT_CONTAINER vault kv put secret/dataskillsradar/development/backend \
    JWT_SECRET="une_cle_secrete_tres_longue_et_complexe_pour_le_dev_2026" \
    AWS_ACCESS_KEY_ID="local_s3_key" \
    AWS_SECRET_ACCESS_KEY="local_s3_secret" \
    S3_ENDPOINT="http://localhost:9000" \
    S3_REGION="local"

# 4. Configuration de la Policy
# NOTE: La policy autorise la lecture sur toute l'arborescence dataskillsradar
echo "📜 Création de la policy de lecture..."
docker exec -e VAULT_ADDR=$VAULT_URL -i $VAULT_CONTAINER vault policy write dsr-read-policy - <<EOF
path "secret/data/dataskillsradar/*" {
  capabilities = ["read"]
}
EOF

# 5. Activation et configuration de l'AppRole (Machine-to-Machine)
echo "🤖 Configuration de l'AppRole..."
docker exec -e VAULT_ADDR=$VAULT_URL -i $VAULT_CONTAINER vault auth enable approle 2>/dev/null || true

# Je crée le rôle et je force la création d'un Role ID customisé et lisible pour le dev
docker exec -e VAULT_ADDR=$VAULT_URL -i $VAULT_CONTAINER vault write auth/approle/role/dsr-api-role \
    token_policies="dsr-read-policy" \
    token_ttl=1h \
    token_max_ttl=4h

docker exec -e VAULT_ADDR=$VAULT_URL -i $VAULT_CONTAINER vault write auth/approle/role/dsr-api-role/role-id \
    role_id="local-dev-role-id"

# Je force un Secret ID statique (Custom Secret ID)
docker exec -e VAULT_ADDR=$VAULT_URL -i $VAULT_CONTAINER vault write auth/approle/role/dsr-api-role/custom-secret-id \
    secret_id="local-dev-secret-id"

echo "✅ Vault local est prêt et configuré !"
echo "ROLE_ID   = local-dev-role-id"
echo "SECRET_ID = local-dev-secret-id"