# SCB-1001 — Portal de Administración de Base de Datos

Portal gamificado para el curso **Administración de Base de Datos (SCB-1001)**  
TecNM · Ingeniería en Sistemas Computacionales · Feb–Jul 2026

## Arranque rápido

```bash
npm install
npm run dev
# → http://localhost:3000
```

El portal funciona **sin configurar nada** en modo offline (localStorage).  
Para sincronizar las entregas de todos los alumnos en la nube, configura Firebase.

---

## Configuración de Firebase (opcional pero recomendada)

### 1. Crear proyecto
1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Nuevo proyecto → activa **Authentication** (proveedor: Google)
3. Activa **Firestore Database** (modo producción)

### 2. Obtener credenciales
Configuración del proyecto → Tus apps → Web → copia la config.

### 3. Variables de entorno
Copia `.env.local.example` a `.env.local` y pega tus credenciales:
```bash
cp .env.local.example .env.local
```

### 4. Reglas de Firestore
Sube el archivo `firestore.rules`:
```bash
firebase deploy --only firestore:rules
```

O pégalas manualmente en la consola de Firebase.

### 5. Estructura en Firestore

| Colección | Documento | Descripción |
|-----------|-----------|-------------|
| `users` | `{uid}` | Perfil del alumno (nombre, control, XP, badges) |
| `submissions` | `{auto}` | Entrega de práctica (repo URL, notas, fecha) |
| `missionCompletions` | `{auto}` | Misión SQL completada en el playground |

### Ver entregas como profesor
En Firestore Console → `submissions` → filtra por `unitId` o `practiceId`.  
O exporta con: `firebase firestore:export ./backup`

---

## Estructura del portal

| Página | Ruta | Descripción |
|--------|------|-------------|
| Roadmap | `/` | 6 unidades con estado y prácticas |
| Práctica | `/practica/[id]` | Detalle, objetivos, contenido, entrega |
| Playground | `/playground` | Consola SQL (SQLite en browser) |
| Misiones | `/misiones` | 23 misiones SQL gamificadas |
| Misión | `/misiones/[id]` | Desafío individual con validador |
| Perfil | `/perfil` | XP, nivel, insignias del alumno |
| Tablero | `/tablero` | Historial de entregas + exportar CSV |

## Programa oficial cubierto (SCB-1001 TecNM)

| Unidad | Subtemas | Prácticas |
|--------|----------|-----------|
| U1 Perspectiva | 1.1 DBA · 1.2 Análisis manejadores · 1.3 Criterios elección · 1.4 Nuevas tecnologías | P1–P4 |
| U2 Arquitectura | 2.1 Memoria/procesos · 2.2 Estructura física · 2.3–2.6 Instalación · 2.7 Configuración · 2.8 Alta/baja | P5–P8 |
| U3 Espacio disco | 3.1 Def. espacio · 3.2 Creación espacios · 3.3 Cuotas usuarios · 3.4 Espacios objetos · 3.4 Roles | P9–P12 |
| U4 Operación | 4.1 Archivos log · 4.2 Modos operación · 4.3 Índices | P13–P16 |
| U5 Seguridad | 5.1 Espejeo · 5.2 Réplica · 5.3 Respaldo · 5.4 Recuperación · 5.5 Migración | P17–P20 |
| U6 Monitoreo | 6.1 Monitoreo · 6.2 Auditoría | P21–P24 |
