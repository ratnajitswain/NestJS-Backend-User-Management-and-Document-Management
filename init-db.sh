
set -e

if ! psql -U "$POSTGRES_USER" -lqt | cut -d \| -f 1 | grep -qw "$POSTGRES_DB"; then
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE $POSTGRES_DB;
EOSQL
  echo "Database $POSTGRES_DB created."
else
  echo "Database $POSTGRES_DB already exists. Skipping creation."
fi