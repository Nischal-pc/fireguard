# Runbook — local setup and reset

## Start everything

```bash
pnpm db:up && pnpm db:migrate && pnpm db:seed
pnpm --filter @fireguard/api dev
```

If `pnpm db:migrate` fails with `role "fireguard" does not exist`, another
Postgres (for example a Windows `postgresql-x64-*` service) is using port 5432.
Stop it in an administrator PowerShell:
`Stop-Service postgresql-x64-17; Set-Service postgresql-x64-17 -StartupType Manual`.

## Run the tablet app (Expo Go, same Wi-Fi as the PC)

Until P1 task 4 the app runs in Expo Go and loads the job pack from the API.

1. Find the PC's address: run `ipconfig` and copy the **IPv4 Address** under
   the Wi-Fi adapter (for example `192.168.1.20`).
2. Copy `apps/mobile/.env.example` to `apps/mobile/.env` and set
   `EXPO_PUBLIC_API_URL=http://<that address>:3000`.
3. Let the tablet reach the PC through Windows Firewall:
   - Settings → Network & internet → Wi-Fi → your network → set
     **Network profile type** to **Private**.
   - Windows Security → Firewall & network protection → **Allow an app
     through firewall** → **Change settings** → tick **Private** (not Public)
     for every **Node.js JavaScript Runtime** entry. If Windows asks when the
     API or Expo first starts, choose **Private networks** only.
   - This opens ports 3000 (API) and 8081 (Expo) on private networks only.
4. Start the database and API (above), then in a second terminal:
   `pnpm --filter @fireguard/mobile start`
5. On the tablet, install **Expo Go**, open it and scan the QR code.
6. Check from the tablet's browser that `http://<that address>:3000/health`
   answers if the app shows "Can't reach server".

From P1 task 4 the app uses PowerSync, which has native code, so Expo Go is
no longer enough: we build an Expo development build (`expo-dev-client`) and
install it on the tablet instead. See `docs/decisions/0007-mobile-tooling.md`.

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
