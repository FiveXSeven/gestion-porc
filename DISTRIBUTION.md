# 📦 Gestion Porc - Distribution Guide

## Quick Start

### For End Users
1. Download the installer for your platform:
   - **Windows**: `gestion-porc-setup.exe`
   - **macOS**: `gestion-porc.dmg`
   - **Linux**: `gestion-porc.AppImage`

2. Install and run the application
3. Use default credentials:
   - Email: `admin@gestion-porc.local` | PIN: `1234`
   - Email: `user@gestion-porc.local` | PIN: `5678`

### For Developers

#### Build All Platforms
```bash
npm run dist
```

#### Build Specific Platform
```bash
npm run dist:win    # Windows (.exe)
npm run dist:mac    # macOS (.dmg)
npm run dist:linux  # Linux (.AppImage)
```

## Distribution Files

After building, find installers in `release/` directory:

```
release/
├── gestion-porc-1.0.0-setup.exe      # Windows installer
├── gestion-porc-1.0.0.dmg            # macOS installer
└── gestion-porc-1.0.0.AppImage       # Linux portable
```

## Features

✅ **Self-contained**: No external dependencies  
✅ **Auto-start backend**: Backend starts automatically  
✅ **Cross-platform**: Windows, macOS, Linux  
✅ **Secure**: All security features included  
✅ **Offline**: Works completely offline  

## File Structure

```
Gestion Porc App/
├── main.js              # Electron main process
├── dist/                 # Frontend build
├── backend/              # Backend build + dependencies
│   ├── dist/            # Compiled backend
│   ├── node_modules/    # Backend dependencies
│   └── prisma/          # Database schema
└── assets/              # App icons and resources
```

## Troubleshooting

**App won't start**: Check if port 3000 is available  
**Database issues**: App creates fresh database on first run  
**Permission errors**: Run as administrator (Windows) or with sudo (Linux)

---
*Built with Electron + Node.js + React*
