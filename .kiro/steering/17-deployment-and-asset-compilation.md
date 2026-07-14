# 17. Deployment & Asset Compilation (Plesk & Vite)

## Context
When deploying updates to Plesk, you may encounter `Vite manifest not found` errors. Front-end assets must be compiled after code is pulled.

## Guidelines
1. **Plesk Git Hook Automation (Recommended):**
   In Plesk under **Git** > **Repository Settings**, enable **additional deployment actions** and paste:
   ```bash
   /opt/plesk/node/22/bin/npm install
   /opt/plesk/node/22/bin/npm run build
   ```
   *(Ensure Node version number matches your server).*

2. **Pre-compiled Assets via Git:**
   If you compile locally with `npm run build`, you must commit the `public/build` directory (removing it from `.gitignore`). This avoids running compilation tasks on Plesk, saving memory.

3. **Speeding up Backend Testing:**
   Always run PHPUnit tests in parallel:
   ```bash
   php artisan test --parallel
   ```
