# Unstable Unicorns Online 🦄

![CI](https://github.com/karolymUXE/unstable-unicorns-online/actions/workflows/ci.yml/badge.svg)
![Version](https://img.shields.io/github/v/tag/karolymUXE/unstable-unicorns-online?label=version&color=blue)
![License](https://img.shields.io/badge/license-MIT-green?style=flat)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen?style=flat)
![Coverage](https://img.shields.io/badge/coverage-0%25-lightgrey?style=flat)
![Issues](https://img.shields.io/github/issues/karolymUXE/unstable-unicorns-online?color=yellow)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-purple?style=flat)
![Status](https://img.shields.io/badge/status-active-success?style=flat)

Juego **multijugador online** inspirado en Unstable Unicorns, construido con arquitectura modular:

- 🔧 Motor de juego modular completamente escrito en TypeScript
- 🃏 Mazo completo de cartas del juego base
- 🔄 Soporte para reglas, turnos y estados del juego
- 🌐 Servidor en tiempo real con Socket.IO
- 🎨 Cliente en React + Vite
- ✅ Tests unitarios en el game-engine con Jest
- 📦 Arquitectura escalable lista para CI/CD
- 🔒 Configuración para contribuciones seguras (branch protection + PR required)

---

## 📁 Arquitectura del proyecto

```txt
unstable-unicorns-online/
 ├── game-engine/     # Lógica del juego (reglas, cartas, turnos)
 ├── server/          # API + WebSocket (Socket.io) que usa el engine
 ├── client/          # SPA en React que consume el estado en tiempo real
 ├── .nvmrc           # Versión de Node recomendada para el proyecto
 ├── .editorconfig    # Estándares de formateo entre IDEs
 └── README.md
```

## 🧰 Tecnologías principales

| Módulo         | Tecnología |
|----------------|------------|
| **Motor del juego** | TypeScript |
| **Servidor** | Express, Socket.io |
| **Cliente** | React + Vite |
| **Estándares** | ESLint, Prettier, EditorConfig |
| **Gestión Node** | nvm + `.nvmrc` |

---

## 📦 Requisitos

- Tener instalado **nvm**  
- Usar la versión de Node definida en `.nvmrc`:

```bash
nvm use
```

## 🚀 Instalación

Clonar el repo:

```bash
git clone unstable-unicorns-online
cd unstable-unicorns-online
nvm use
```

Instalar dependencias:

### Motor del juego

```bash
cd game-engine
npm install
npm run build
```

### Servidor

```bash
cd ../server
npm install
```

### Cliente

```bash
cd ../client
npm install
```

## 🧑‍💻 Desarrollo
### 1. Compilar el engine

```bash
cd game-engine
npm run build
```

### 2. Levantar servidor

```bash
cd server
npm run dev
```

Servidor en: http://localhost:4000

### 3. Levantar cliente

```bash
cd client
npm run dev
```

Cliente en: http://localhost:5173

## 📜 Scripts disponibles
### Linter

```bash
npm run lint
```

### Formateo

```bash
npm run format
```

## 🤝 Contribución

¡Contribuciones son bienvenidas!
Si deseas colaborar:

Haz un **fork** del repositorio

Crea una rama nueva:

````bash
git checkout -b feature/nueva-funcionalidad
````

Asegúrate de correr:

````bash
npm run lint
npm run format
````

Envía un **Pull Request** describiendo claramente los cambios.

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.

Significa que puedes:

- Usarlo
- Modificarlo
- Distribuirlo
- Venderlo
Siempre y cuando mantengas la atribución correspondiente.

````txt
MIT License

Copyright (c) 2025 Karolym Montiel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction…

(continúa la licencia completa en tu archivo LICENSE)
````
