# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a Unstable Unicorns Online!  
Este proyecto está construido con una arquitectura modular (engine, server, client).  
Las contribuciones son bienvenidas y ayudan a que el proyecto siga creciendo.

---

## 1. Requisitos Previos

Asegúrate de tener:

- Node (usa la versión definida en .nvmrc)
- npm
- Git
- nvm instalado

Instalar y usar la versión correcta:

````bash
nvm install
nvm use
````

---

## 2. Cómo correr el proyecto

### Motor del juego (game-engine)

````bash
cd game-engine
npm install
npm run build
````

### Servidor

````bash
cd server
npm install
npm run dev
````

### Cliente

````bash
cd client
npm install
npm run dev
````

---

## 3. Flujo para contribuir

1. Haz un fork del repositorio  
2. Crea una rama nueva:

````bash
git checkout -b feature/nueva-funcionalidad
````

3. Realiza tus cambios  
4. Ejecuta el linter y formateo:

````bash
npm run lint
npm run format
````

5. Haz commit siguiendo Conventional Commits:

### Ejemplos:

- feat: agregar carta nueva "Robo Brillante"
- fix: corregir lógica de descarte
- refactor: optimizar lógica de turnos
- docs: actualizar README
- chore: actualizar dependencias

6. Sube tu rama:

````bash
git push origin feature/nueva-funcionalidad
````

7. Abre un Pull Request con:
- Descripción clara
- Qué problema resuelve
- Cómo probarlo
- Checklist de completado

---

## 4. Estilo de Código

El proyecto usa:

- TypeScript estricto
- ESLint
- Prettier
- EditorConfig

Reglas importantes:
- No usar "any" sin justificación
- Mantener funciones pequeñas y limpias
- Mantener separación:
  - game-engine → reglas del juego
  - server → comunicación en tiempo real
  - client → interfaz

---

## 5. Ideas de contribución

- Agregar cartas faltantes del mazo
- Implementar reglas avanzadas
- Mejorar UI/UX del cliente
- Optimizar rendering
- Crear sistema de salas
- Agregar persistencia de partidas
- Mejorar animaciones

---

## 6. Reportar errores

Incluye:

- Pasos para reproducir
- Comportamiento esperado
- Logs / capturas
- Módulo afectado (engine/server/client)

---

## 7. Código de Conducta

Sé respetuoso y cordial.  
Queremos una comunidad segura y colaborativa.

---

## 8. Gracias 🙌

Tu tiempo y esfuerzo hacen este proyecto mejor.  
Cada contribución es bienvenida.