#!/bin/bash

domains=(votre-domaine.com)     # Remplace par ton vrai nom de domaine
email="ton-email@exemple.com"  # Remplace par ton e-mail pour Let's Encrypt
rsa_key_size=4096

echo "### Démarrage temporaire de Nginx pour valider le challenge ACME..."
docker compose up --no-deps -d nginx

echo "### Demande du certificat initial auprès de Let's Encrypt..."
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $domain_args \
    --email $email \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal" certbot

echo "### Rechargement de Nginx avec le nouveau certificat..."
docker compose exec nginx nginx -s reload