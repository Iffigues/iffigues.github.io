FROM certbot/certbot:v2.9.0

# Script d'entrée qui vérifie et renouvelle automatiquement le certificat toutes les 12 heures
ENTRYPOINT ["sh", "-c", "trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;"]