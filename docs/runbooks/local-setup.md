# Runbook — local setup and reset

## Start everything

```bash
pnpm db:up && pnpm db:migrate && pnpm db:seed
pnpm --filter @fireguard/api dev
```

## Reset the local database (wipes local data)

```bash
docker compose down -v   # -v deletes the data volume
pnpm db:up && pnpm db:migrate && pnpm db:seed
```

## Load the 1,000-device site

```bash
pnpm make:big-site
pnpm db:seed -- ../../test-data/big-site.json
```

## Look inside the database

```bash
docker exec -it fireguard-postgres psql -U fireguard -d fireguard
\dt                       -- list tables
select count(*) from devices;
\q
```
