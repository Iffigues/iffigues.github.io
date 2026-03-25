#!/bin/bash

myawesomefunction() {
  case "$1" in
    bit.ly/*|www.bit.ly/*|http://bit.ly/*|https://bit.ly/*|http://www.bit.ly/*|https://www.bit.ly/*)
      curl -Ls -o /dev/null -w '%{url_effective}\n' "$1"
      ;;
    *)
      echo "❌ URL doit être un lien bit.ly"
      return 1
      ;;
  esac
}

# Vérifie argument
if [ -z "$1" ]; then
  echo "Usage: $0 <url>"
  exit 1
fi

myawesomefunction "$1"
