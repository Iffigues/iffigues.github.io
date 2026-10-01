#!/bin/bash

domains=(217-182-206-51.sslip.io)
email="boris.denoyelle@gmail.com" # Ton email pour recevoir les notifications Let's Encrypt
rsa_key_size=4096

echo "### Démarrage de Nginx..."
docker compose up -d nginx

echo "### Demande du certificat pour 217-182-206-51.sslip.io..."
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
    --no-eff-email \
    --force-renewal" certbot

echo "### Rechargement de Nginx avec le nouveau certificat..."
docker compose exec nginx nginx -s reload