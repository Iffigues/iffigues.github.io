myawesomefunction() {
  curl -Ls -o /dev/null -w '%{url_effective}\n' "$1"
}
myawesomefunction $1
