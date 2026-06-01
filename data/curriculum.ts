import type { Unit, Practice } from '@/types'

// Mapa del semestre. El status desbloquea la experiencia visual, no controla permisos reales.

export const units: Unit[] = [
  {
    id: 1, slug: 'perspectiva',
    title: 'Perspectiva del DBA',
    subtitle: 'El rol estratégico del administrador',
    description: 'Comprende qué hace realmente un DBA, cómo elegir un SGBD y hacia dónde va la profesión.',
    status: 'done',
    accentColor: '#22c55e',
    bgGradient: 'from-green-950/40 to-transparent',
    icon: '🔭', character: 'El Explorador', characterEmoji: '🧭',
    lore: 'Antes de tocar una sola línea de SQL, necesitas entender el territorio. El Explorador mapea el mundo de los datos, conoce a los guardianes de cada sistema y sabe exactamente cuándo MySQL, PostgreSQL u Oracle es la herramienta correcta.',
    xpReward: 400, badgeName: 'El Explorador', badgeEmoji: '🔭',
    practiceIds: [1, 2, 3, 4], weeks: 'Semanas 1–3',
  },
  {
    id: 2, slug: 'arquitectura',
    title: 'Arquitectura e Instalación',
    subtitle: 'Levanta tu primer servidor MySQL',
    description: 'Instala y configura MySQL en Ubuntu Server desde cero, comprende su arquitectura interna y domina la gestión del servicio.',
    status: 'active',
    accentColor: '#3b82f6',
    bgGradient: 'from-blue-950/40 to-transparent',
    icon: '🏗️', character: 'El Arquitecto', characterEmoji: '⚙️',
    lore: 'El Arquitecto construye los cimientos de todo. Conoce cada byte del my.cnf, cada proceso del mysqld, y tiene la capacidad mística de levantar un servidor MySQL en 10 minutos en cualquier máquina Ubuntu que le pongan enfrente.',
    xpReward: 600, badgeName: 'El Arquitecto', badgeEmoji: '🏗️',
    practiceIds: [5, 6, 7, 8], weeks: 'Semanas 4–7',
  },
  {
    id: 3, slug: 'espacio-disco',
    title: 'Espacio en Disco',
    subtitle: 'Tablespaces, roles y primera conexión JDBC',
    description: 'Gestiona el almacenamiento lógico de MySQL, diseña un modelo de roles con privilegios mínimos y conecta Java al servidor.',
    status: 'locked',
    accentColor: '#f59e0b',
    bgGradient: 'from-amber-950/40 to-transparent',
    icon: '💾', character: 'El Tesorero', characterEmoji: '🗄️',
    lore: 'El Tesorero conoce cada kilobyte de espacio en disco. Sabe exactamente cuándo un tablespace está a punto de llenarse, crea usuarios con los permisos justos y necesarios, y fue el primero en conectar Java directamente al motor sin ningún ORM de por medio.',
    xpReward: 700, badgeName: 'El Tesorero', badgeEmoji: '💾',
    practiceIds: [9, 10, 11, 12], weeks: 'Semanas 8–11',
  },
  {
    id: 4, slug: 'operacion',
    title: 'Operación y Mantenimiento',
    subtitle: 'Logs, índices y transacciones JDBC',
    description: 'Analiza logs de rendimiento, optimiza consultas con índices y gestiona transacciones manuales desde Java.',
    status: 'locked',
    accentColor: '#8b5cf6',
    bgGradient: 'from-violet-950/40 to-transparent',
    icon: '⚡', character: 'El Mecánico', characterEmoji: '🔧',
    lore: 'El Mecánico mantiene el motor corriendo a máxima potencia. Lee el slow_query_log como otros leen el periódico, sabe exactamente qué índice crear para cualquier consulta, y nunca deja un commit sin su rollback correspondiente.',
    xpReward: 750, badgeName: 'El Mecánico', badgeEmoji: '⚡',
    practiceIds: [13, 14, 15, 16], weeks: 'Semanas 12–13',
  },
  {
    id: 5, slug: 'seguridad',
    title: 'Seguridad',
    subtitle: 'Replicación, respaldo y cifrado',
    description: 'Configura replicación Source-Replica, políticas de respaldo automatizadas, TLS y doble DataSource JDBC.',
    status: 'locked',
    accentColor: '#ef4444',
    bgGradient: 'from-red-950/40 to-transparent',
    icon: '🔐', character: 'El Guardián', characterEmoji: '🛡️',
    lore: 'El Guardián duerme con un ojo abierto. Tiene replicación activa, respaldos automatizados cada 6 horas, TLS en todas las conexiones, y una política de privilegios tan estricta que incluso el root le pide permiso para hacer algo.',
    xpReward: 800, badgeName: 'El Guardián', badgeEmoji: '🔐',
    practiceIds: [17, 18, 19, 20], weeks: 'Semanas 14–17',
  },
  {
    id: 6, slug: 'monitoreo',
    title: 'Monitoreo y Auditoría',
    subtitle: 'Performance Schema y trazabilidad',
    description: 'Implementa monitoreo con Performance Schema, auditoría de operaciones DDL/DML y tableros de alertas.',
    status: 'locked',
    accentColor: '#06b6d4',
    bgGradient: 'from-cyan-950/40 to-transparent',
    icon: '👁️', character: 'El Oráculo', characterEmoji: '🔮',
    lore: 'El Oráculo lo ve todo. Cada query que tarda más de 1 segundo le llega como alerta, cada full scan le duele físicamente, y tiene dashboards que muestran el estado del servidor en tiempo real. Nada escapa a su vista.',
    xpReward: 900, badgeName: 'El Oráculo', badgeEmoji: '👁️',
    practiceIds: [21, 22, 23, 24], weeks: 'Semanas 18',
  },
]

export const practices: Practice[] = [
  // Unidad 1: contexto del rol antes de tocar servidores.
  {
    id: 1, slug: 'rol-dba', title: 'Rol y responsabilidades del DBA',
    unitId: 1, type: 'doc', difficulty: 1, xpReward: 80,
    estimatedTime: '1.5 horas', repoRequired: false,
    mode: 'desktop', missionIds: [],
    desktopTools: ['Procesador de texto', 'Investigación bibliográfica'],
    objectives: [
      'Identificar las funciones operativas, tácticas y estratégicas del DBA',
      'Describir 5 interacciones críticas con otras áreas de la organización',
      'Elaborar un perfil técnico mínimo para DBA junior',
    ],
    deliverables: ['Tabla de responsabilidades', 'Organigrama con relaciones de trabajo', 'Conclusión de una cuartilla'],
    content: `## ¿Qué hace realmente un DBA?

No es el personaje que "cuida las tablas". El DBA es el profesional que garantiza que los datos de la organización estén disponibles, íntegros, seguros y accesibles en el momento en que alguien los necesite — 24/7, sin excusas.

### Las tres dimensiones del trabajo

**Operativo (el día a día)**
- Monitorear el rendimiento del servidor y resolver incidencias
- Gestionar usuarios, roles y privilegios
- Ejecutar respaldos y verificar su integridad
- Analizar queries lentos y proponer optimizaciones

**Táctico (semanas/meses)**
- Planificar el crecimiento de almacenamiento
- Implementar particionamiento y archivado de datos históricos
- Configurar y mantener replicación
- Documentar procedimientos y estándares

**Estratégico (trimestres/años)**
- Recomendar tecnologías y arquitecturas de datos
- Evaluar migración entre SGBDs o hacia la nube
- Definir políticas de gobierno del dato
- Participar en la planificación de capacidad

---

## Interacciones con otras áreas

| Área | Tipo de interacción | Frecuencia |
|---|---|---|
| **Desarrollo** | Revisión de queries, diseño de esquemas, conexiones JDBC | Diaria |
| **Infraestructura** | Servidores, red, storage, virtualización | Semanal |
| **Seguridad** | Políticas de acceso, auditoría, cifrado | Mensual |
| **Dirección** | Reportes de disponibilidad, propuestas de inversión | Trimestral |
| **Soporte** | Diagnóstico de errores reportados por usuarios | Según incidencias |

---

## Actividades de la práctica

1. Dibuja un mapa de responsabilidades del DBA en modalidad **on-prem** y **nube** (puede ser tabla o diagrama).
2. Para cada área de la tabla anterior, escribe un ejemplo concreto de una interacción que hayas tenido o puedas imaginar en una empresa real.
3. Define el perfil técnico mínimo para un DBA junior en una empresa de comercio electrónico con MySQL 8.x.

> 💡 **Tip del Explorador**: Busca el salario promedio de DBA en México en sitios como OCC y LinkedIn. Spoiler: no está mal para el año 1 de carrera.
`,
  },
  {
    id: 2, slug: 'analisis-manejadores', title: 'Análisis de manejadores de base de datos',
    unitId: 1, type: 'doc', difficulty: 1, xpReward: 80,
    estimatedTime: '1.5 horas', repoRequired: false,
    mode: 'desktop', missionIds: [],
    desktopTools: ['Procesador de texto'],
    objectives: [
      'Definir entradas, procesos y salidas para cada etapa del ciclo de vida',
      'Relacionar riesgos típicos por etapa',
      'Proponer controles preventivos de administración',
    ],
    deliverables: ['Diagrama del ciclo de vida', 'Matriz de riesgos/controles'],
    content: `## El ciclo de vida de una BD

Toda base de datos nace, crece, envejece y a veces muere. Como DBA, participarás en todas estas etapas.

\`\`\`
Análisis → Diseño Lógico → Diseño Físico → Implementación → Operación → Retiro
   ↑                                                              |
   └──────────────── Mejora continua ────────────────────────────┘
\`\`\`

### Etapa 1: Análisis
- **Entradas**: Requerimientos del negocio, casos de uso, volumen estimado
- **Salidas**: Modelo conceptual (entidad-relación), lista de requerimientos de datos
- **Riesgo principal**: Requisitos incompletos o ambiguos
- **Control DBA**: Cuestionario de levantamiento, validación con usuarios finales

### Etapa 2: Diseño Lógico
- **Entradas**: Modelo conceptual, reglas de normalización
- **Salidas**: Diagrama relacional normalizado (3FN mínimo)
- **Riesgo principal**: Sobrenormalización (afecta rendimiento) o subnormalización (afecta integridad)
- **Control DBA**: Revisión de dependencias funcionales, prueba con datos reales

### Etapa 3: Diseño Físico
- **Entradas**: Modelo lógico, características del SGBD elegido
- **Salidas**: DDL completo, estrategia de índices, particionamiento
- **Riesgo principal**: Elegir tipos de dato incorrectos (VARCHAR(255) para todo)
- **Control DBA**: Revisión de tipos de dato, estimación de tamaño en disco

### Etapa 4: Implementación
- **Entradas**: Scripts DDL, datos iniciales (seeds)
- **Salidas**: Base de datos funcional en producción
- **Riesgo principal**: Errores en migración de datos históricos
- **Control DBA**: Scripts versionados, prueba en staging antes de producción

### Etapa 5: Operación
- **Entradas**: Transacciones del negocio
- **Salidas**: Datos almacenados, reportes, backups
- **Riesgo principal**: Degradación del rendimiento, pérdida de datos
- **Control DBA**: Monitoreo continuo, ventanas de mantenimiento, respaldos verificados

---

## Tu tarea

Construye la **matriz de riesgos y controles** completa en formato tabla para las 5 etapas. Para cada riesgo, propón al menos un control preventivo y uno correctivo.

> 🧭 **El Explorador dice**: Un buen DBA no espera a que algo falle. Diseña con la falla en mente desde el principio.
`,
  },
  {
    id: 3, slug: 'criterios-sgbd', title: 'Consideraciones para elegir un SGBD',
    unitId: 1, type: 'doc', difficulty: 2, xpReward: 100,
    estimatedTime: '2 horas', repoRequired: false,
    mode: 'desktop', missionIds: [],
    desktopTools: ['Editor de texto', 'MySQL Workbench'],
    objectives: [
      'Definir convenciones para nombres de esquemas, tablas, índices y usuarios',
      'Crear formato de encabezado estándar para scripts SQL',
      'Proponer estructura de bitácora de cambios (changelog)',
    ],
    deliverables: ['Guía de estándares SQL (guia-estandares-abd.md)', 'Ejemplo de script DDL con encabezado estándar'],
    content: `## ¿Por qué importan los estándares?

En 6 meses, otro DBA (o tú mismo) va a leer tu código. Los estándares son el contrato social del equipo técnico.

---

## Convenciones de nomenclatura

### Tablas
\`\`\`
✅ alumnos, materias, inscripciones, bitacora_accesos
❌ Alumno, tblAlumno, ALUMNOS, datos1
\`\`\`
- **Siempre en minúsculas**, usando snake_case
- **Plural** para tablas de entidades
- **Singular** para tablas de configuración: \`config_sistema\`
- **Prefijo para bitácoras**: \`log_\` o \`bitacora_\`

### Columnas
\`\`\`sql
-- ✅ Correcto
id BIGINT PRIMARY KEY AUTO_INCREMENT
nombre VARCHAR(120) NOT NULL
creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
actualizado_en TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

-- ❌ Evitar
ID, Nombre, Created, fecha1
\`\`\`

### Índices
\`\`\`sql
-- Patrón: idx_tabla_columnas
CREATE INDEX idx_alumnos_carrera ON alumnos(carrera);
CREATE INDEX idx_alumnos_carrera_semestre ON alumnos(carrera, semestre);
CREATE UNIQUE INDEX uq_alumnos_control ON alumnos(numero_control);
\`\`\`

### Usuarios de base de datos
\`\`\`
app_{rol}_{entorno}: app_writer_prod, app_reader_dev
svc_{servicio}: svc_reportes, svc_backup
\`\`\`

---

## Encabezado estándar para scripts SQL

\`\`\`sql
-- =============================================================================
-- nombre-del-script.sql
-- Descripción breve del propósito
--
-- Asignatura : SCB-1001 Administración de Base de Datos
-- Unidad     : X — Nombre de la unidad
-- Versión    : 1.0.0
-- Autor      : Tu Nombre <control@itdurango.edu.mx>
-- Fecha      : YYYY-MM-DD
--
-- Ejecutar   : mysql -u usuario -p base_de_datos < script.sql
-- Reversión  : Ver sección ROLLBACK al final del archivo
-- Dependencias: scripts/01-esquema.sql debe ejecutarse primero
-- =============================================================================
\`\`\`

---

## Bitácora de cambios (CHANGELOG.md)

\`\`\`markdown
# CHANGELOG

## [Unreleased]
### Pendiente
- Agregar índice en tabla inscripciones

## [1.2.0] - 2026-04-15
### Agregado
- Tabla bitacora_accesos con particionamiento por año
### Modificado
- Columna semestre: TINYINT → SMALLINT (soporta posgrado)

## [1.1.0] - 2026-03-22
### Corregido
- Error en constraint CHECK de calificaciones (0-10 → 0-100)
\`\`\`

> ⚙️ **El Arquitecto dice**: Los estándares que defines hoy son los que tendrás que defender ante el nuevo DBA en 2 años. Hazlos claros.
`,
  },
  {
    id: 4, slug: 'investigacion-abd', title: 'Investigación ABD — Diagnóstico inicial',
    unitId: 1, type: 'doc', difficulty: 3, xpReward: 140,
    estimatedTime: '4 horas', repoRequired: false,
    mode: 'desktop', missionIds: [],
    desktopTools: ['Procesador de texto', 'Internet'],
    objectives: [
      'Comparar al menos 5 SGBDs con criterios técnicos objetivos',
      'Identificar tendencias tecnológicas que redefinen el rol del DBA',
      'Justificar la elección de MySQL 8.x para el proyecto integrador',
    ],
    deliverables: ['Investigación_ABD.pdf (o .md) con tabla comparativa, análisis de tendencias y justificación de elección'],
    content: `## El gran debate: ¿cuál SGBD elegir?

Esta investigación es el punto de partida de todo el semestre. La pregunta central: **¿por qué MySQL?**

---

## Comparativa de SGBDs

| Criterio | MySQL 8.x | PostgreSQL 16 | SQL Server 2022 | Oracle 21c | MongoDB 7 |
|---|---|---|---|---|---|
| **Modelo** | Relacional | Relacional+ | Relacional | Relacional | Documental |
| **Licencia** | GPL / Comercial | PostgreSQL (libre) | Comercial | Comercial | SSPL / Comercial |
| **ACID** | ✅ (InnoDB) | ✅ | ✅ | ✅ | Parcial |
| **JSON nativo** | ✅ MySQL 5.7+ | ✅ JSONB superior | ✅ | ✅ | ✅ nativo |
| **Replicación** | Source-Replica, Group | Streaming, Logical | Always On AG | DataGuard | ReplicaSet, Sharding |
| **Escalabilidad** | Vertical + Réplica lectura | Vertical + extensiones | Vertical + AG | Horizontal enterprise | Horizontal nativo |
| **Ecosistema Java** | ✅ Conector oficial | ✅ JDBC pgsql | ✅ JDBC / JPA | ✅ JDBC ojdbc | ✅ Driver oficial |
| **Curva aprendizaje** | ⭐⭐ Media | ⭐⭐⭐ Media-alta | ⭐⭐⭐ Media-alta | ⭐⭐⭐⭐ Alta | ⭐⭐ Media |
| **Costo anual empresa** | $0 – ~$5K | $0 | $3K – $15K+ | $15K – $100K+ | $0 – $9K |

---

## Cuatro tendencias que redefinen al DBA

### 1. DBaaS — Bases de datos como servicio
AWS RDS, Google Cloud SQL y Azure Database for MySQL permiten tener MySQL corriendo en minutos sin tocar un servidor físico. El DBA migra de administrar hardware a gestionar configuraciones, costos y SLAs en la nube.

### 2. IA y automatización
Herramientas como AWS Aurora Autopilot, OtterTune y MySQL HeatWave ML automatizan la optimización de parámetros y la detección de anomalías. El DBA del futuro supervisa la IA, no reemplaza tablas manualmente.

### 3. Bases de datos vectoriales
Con el auge de ChatGPT y LLMs, las bases vectoriales (Pinecone, pgvector, Milvus) almacenan embeddings para búsqueda semántica. El DBA moderno necesita entender qué es un vector y cómo indexarlo.

### 4. Analítica integrada al OLTP
MySQL HeatWave, SQL Server Synapse y Oracle Autonomous Database mezclan OLTP y OLAP en el mismo motor. La separación tradicional "BD transaccional | Data Warehouse" está desapareciendo.

---

## Por qué MySQL para este curso

Justifica tu elección considerando: popularidad en el mercado laboral mexicano, integración nativa con Java/Spring Boot, documentación oficial extensa, costo cero de licenciamiento para organizaciones académicas, y comunidad de soporte activa.

> 🔭 **El Explorador dice**: No existe el "mejor" SGBD. Existe el más adecuado para cada contexto. Tu trabajo como DBA es saber cuándo usar cuál.
`,
  },

  // Unidad 2: instalación y arquitectura base de MySQL.
  {
    id: 5, slug: 'instalacion-mysql', title: 'Instalación de MySQL en Ubuntu Server',
    unitId: 2, type: 'bash', difficulty: 2, xpReward: 120,
    estimatedTime: '2 horas', repoRequired: true,
    mode: 'desktop', missionIds: [],
    desktopTools: ['Ubuntu Server 22.04', 'Terminal bash'],
    objectives: [
      'Instalar MySQL 8.x desde el repositorio APT oficial en Ubuntu 22.04 LTS',
      'Aplicar hardening básico con mysql_secure_installation',
      'Crear un script de instalación reproducible',
    ],
    deliverables: ['scripts/install-mysql.sh (ejecutable y documentado)', 'reporte.md con capturas del proceso'],
    content: `## ¡Hora de instalar el motor!

Esta práctica te convierte en el Arquitecto del servidor. Nada de interfaces gráficas: MySQL se instala desde la terminal y se administra desde la terminal.

---

## Requisitos del sistema

- Ubuntu Server 22.04 LTS (o VM con VirtualBox)
- 2 GB RAM mínimo, 4 GB recomendado
- 20 GB disco libre
- Acceso a internet para descargar paquetes

---

## Procedimiento paso a paso

### 1. Actualizar el sistema

\`\`\`bash
sudo apt-get update && sudo apt-get upgrade -y
\`\`\`

### 2. Instalar MySQL Server

\`\`\`bash
sudo apt-get install -y mysql-server
\`\`\`

### 3. Verificar el servicio

\`\`\`bash
sudo systemctl status mysql
# Debe mostrar: active (running)

# Habilitar inicio automático al arranque
sudo systemctl enable mysql
\`\`\`

### 4. Hardening con mysql_secure_installation

\`\`\`bash
sudo mysql_secure_installation
\`\`\`

Responde a cada pregunta y documenta tus decisiones:
- ¿Instalar el componente VALIDATE PASSWORD? → Sí en producción
- ¿Eliminar usuarios anónimos? → **Siempre Sí**
- ¿Prohibir login remoto de root? → **Siempre Sí**
- ¿Eliminar la base de datos test? → **Siempre Sí**
- ¿Recargar la tabla de privilegios? → **Siempre Sí**

### 5. Verificar la instalación

\`\`\`bash
# Versión instalada
mysql --version

# Conectar al cliente
sudo mysql

# Dentro del cliente MySQL:
SELECT VERSION();
SHOW DATABASES;
EXIT;
\`\`\`

---

## Archivos que debes conocer

\`\`\`bash
# Configuración del servidor
cat /etc/mysql/mysql.conf.d/mysqld.cnf

# Log de errores
sudo tail -20 /var/log/mysql/error.log

# Directorio de datos
sudo ls -lh /var/lib/mysql/
\`\`\`

---

## Tu script install-mysql.sh

Tu entregable principal es un script Bash que automatice todo el proceso. Debe incluir:
- Verificación de que se ejecuta como root
- Verificación de conectividad a internet
- Instalación de MySQL
- Configuración del servicio
- Hardening básico (las opciones seguras de mysql_secure_installation)
- Mensaje de resumen al final

\`\`\`bash
#!/usr/bin/env bash
set -euo pipefail

# Tu código aquí...
\`\`\`

> ⚙️ **El Arquitecto dice**: Un buen script de instalación puede ejecutarse en una máquina limpia en 5 minutos y dejar el servidor listo para producción. El tuyo debe hacer exactamente eso.
`,
  },
  {
    id: 6, slug: 'estructura-memoria', title: 'Estructura de memoria de la instancia MySQL',
    unitId: 2, type: 'sql', difficulty: 3, xpReward: 130,
    estimatedTime: '2 horas', repoRequired: true,
    mode: 'desktop', missionIds: [],
    desktopTools: ['MySQL 8.x', 'Ubuntu Server'],
    objectives: [
      'Identificar los componentes de memoria de MySQL: InnoDB Buffer Pool, Log Buffer, Connection Pool',
      'Analizar la salida de SHOW ENGINE INNODB STATUS',
      'Proponer ajustes de configuración basados en métricas reales',
    ],
    deliverables: ['reporte.md con diagrama de arquitectura', 'Tabla comparativa (valor actual vs recomendado)'],
    content: `## La memoria es el arma del DBA

El 80% de los problemas de rendimiento de MySQL se resuelven ajustando correctamente el InnoDB Buffer Pool. Esta práctica te enseña a leer las entrañas del motor.

---

## Componentes de memoria en MySQL 8.x

\`\`\`
┌─────────────────────────────────────────────┐
│              MySQL Instance                  │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │    InnoDB Buffer Pool (el más       │    │  ← Caché de páginas de datos e índices
│  │    importante — 50-70% de la RAM)   │    │    Aquí "vive" la BD en RAM
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌──────────────┐  ┌────────────────────┐   │
│  │  Log Buffer  │  │  Connection Memory │   │  ← sort_buffer, tmp_table, join_buffer
│  │  (redo logs) │  │  (por conexión)    │   │    Se multiplica por max_connections
│  └──────────────┘  └────────────────────┘   │
└─────────────────────────────────────────────┘
\`\`\`

---

## Consultas de análisis

\`\`\`sql
-- 1. Parámetros de memoria global
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
SHOW VARIABLES LIKE 'innodb_log_buffer_size';
SHOW VARIABLES LIKE 'max_connections';
SHOW VARIABLES LIKE 'sort_buffer_size';
SHOW VARIABLES LIKE 'tmp_table_size';

-- 2. Hit ratio del buffer pool (objetivo: > 99%)
SELECT ROUND(
  (1 - (
    (SELECT VARIABLE_VALUE FROM performance_schema.global_status
     WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads') /
    NULLIF((SELECT VARIABLE_VALUE FROM performance_schema.global_status
     WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests'), 0)
  )) * 100, 2
) AS hit_ratio_pct;

-- 3. Estado en tiempo real del buffer pool
SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_pages%';

-- 4. Conexiones
SHOW GLOBAL STATUS LIKE 'Threads_connected';
SHOW GLOBAL STATUS LIKE 'Max_used_connections';

-- 5. Estado detallado del motor InnoDB
SHOW ENGINE INNODB STATUS\\G
\`\`\`

---

## Regla de oro para el Buffer Pool

\`\`\`ini
# Si tienes 4 GB RAM:
innodb_buffer_pool_size = 2G   # 50% de la RAM

# Si tienes 8 GB RAM:
innodb_buffer_pool_size = 5G   # ~60% de la RAM

# Si tienes 16 GB RAM:
innodb_buffer_pool_size = 10G  # ~62% de la RAM
\`\`\`

Deja siempre RAM suficiente para el sistema operativo, conexiones activas y otros procesos.

> ⚙️ **El Arquitecto dice**: Si tu hit ratio es menor al 95%, tu servidor está yendo a disco demasiado seguido. Aumenta el buffer pool o reduce el volumen de datos activos.
`,
  },
  {
    id: 7, slug: 'archivos-sgbd', title: 'Estructura física y archivos del SGBD',
    unitId: 2, type: 'bash', difficulty: 2, xpReward: 110,
    estimatedTime: '1.5 horas', repoRequired: true,
    mode: 'desktop', missionIds: [],
    desktopTools: ['MySQL 8.x', 'Ubuntu Server'],
    objectives: [
      'Localizar y describir los 6 tipos de archivos clave de MySQL',
      'Entender la relación entre cada archivo y las operaciones del SGBD',
      'Interpretar el contenido del error log',
    ],
    deliverables: ['reporte.md con tabla de archivos identificados + capturas de comandos'],
    content: `## MySQL no es magia — es archivos en disco

Detrás de cada tabla hay un archivo .ibd. Detrás de cada transacción hay un redo log. Esta práctica te enseña dónde vive todo.

---

## Mapa de archivos de MySQL en Ubuntu

| Archivo / Ruta | Propósito |
|---|---|
| \`/etc/mysql/mysql.conf.d/mysqld.cnf\` | Configuración del servidor |
| \`/var/lib/mysql/{bd}/{tabla}.ibd\` | Datos e índices de cada tabla InnoDB |
| \`/var/log/mysql/error.log\` | Errores, advertencias e información del servidor |
| \`/var/lib/mysql/binlog.*\` | Binary logs: registro de cambios para replicación y PITR |
| \`/var/lib/mysql/#innodb_undo*\` | Undo logs: control transaccional (MVCC) |
| \`/var/run/mysqld/mysqld.sock\` | Socket Unix para conexiones locales |

---

## Comandos de exploración

\`\`\`bash
# 1. Ver todos los archivos en el datadir
sudo ls -lh /var/lib/mysql/

# 2. Ver archivos .ibd de una base de datos específica
sudo ls -lh /var/lib/mysql/escolar_admin/

# 3. Ver los últimos 30 mensajes del error log
sudo tail -30 /var/log/mysql/error.log

# 4. Buscar errores recientes
sudo grep -i 'error\|warning' /var/log/mysql/error.log | tail -20

# 5. Ver binary logs listados
mysql -uroot -p -e "SHOW BINARY LOGS;"

# 6. Verificar datadir desde MySQL
mysql -uroot -p -e "SHOW VARIABLES LIKE 'datadir';"
\`\`\`

---

## Demostración: crear una tabla y ver su .ibd

\`\`\`sql
CREATE DATABASE IF NOT EXISTS test_archivos;
USE test_archivos;
CREATE TABLE demo (id INT PRIMARY KEY, nombre VARCHAR(50)) ENGINE=InnoDB;
\`\`\`

\`\`\`bash
# Verificar que se creó el archivo .ibd
sudo ls -lh /var/lib/mysql/test_archivos/
# Debes ver: demo.ibd
\`\`\`

> ⚙️ **El Arquitecto dice**: Saber dónde viven los archivos es crítico en una emergencia. Si el disco se llena, necesitas saber exactamente qué borrar (y qué nunca tocar).
`,
  },
  {
    id: 8, slug: 'alta-baja', title: 'Configuración y comandos de alta/baja',
    unitId: 2, type: 'bash', difficulty: 2, xpReward: 120,
    estimatedTime: '2 horas', repoRequired: true,
    mode: 'desktop', missionIds: [],
    desktopTools: ['MySQL 8.x', 'Ubuntu Server', 'systemctl'],
    objectives: [
      'Editar y justificar parámetros clave del my.cnf',
      'Demostrar los 6 comandos de gestión del servicio con capturas',
      'Crear un script start-stop.sh funcional',
    ],
    deliverables: ['scripts/start-stop.sh', 'scripts/my-cnf-config.ini comentado', 'reporte.md con capturas'],
    content: `## Dominar el servicio MySQL con systemd

Un DBA que no controla el servicio no controla nada. Esta práctica te da el control total sobre el ciclo de vida del servidor.

---

## Los 6 comandos que necesitas conocer

\`\`\`bash
sudo systemctl start   mysql   # Iniciar el servicio
sudo systemctl stop    mysql   # Detener (espera a que las conexiones cierren)
sudo systemctl restart mysql   # Detener + iniciar
sudo systemctl reload  mysql   # Recargar configuración SIN reiniciar (no siempre disponible)
sudo systemctl status  mysql   # Ver estado detallado
sudo systemctl enable  mysql   # Habilitar inicio automático al boot
sudo systemctl disable mysql   # Deshabilitar inicio automático
\`\`\`

---

## Parámetros esenciales del my.cnf

Edita el archivo en \`/etc/mysql/mysql.conf.d/mysqld.cnf\`:

\`\`\`ini
[mysqld]
# Directorio de datos (no cambiar después de inicializar)
datadir = /var/lib/mysql

# Puerto de escucha
port = 3306

# InnoDB Buffer Pool: ~50% de tu RAM disponible
# Con 4 GB de RAM en la VM del laboratorio:
innodb_buffer_pool_size = 512M

# Log de errores
log_error = /var/log/mysql/error.log

# Binary log (necesario para PITR y replicación en U5)
log_bin = /var/lib/mysql/binlog
binlog_format = ROW
binlog_expire_logs_seconds = 604800   # 7 días

# Slow query log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/mysql-slow.log
long_query_time = 1

# Zona horaria del Instituto (UTC-6)
default_time_zone = '-06:00'
\`\`\`

---

## Después de editar my.cnf

\`\`\`bash
# Verificar que la configuración es válida antes de reiniciar
sudo mysqld --validate-config

# Si no hay errores, aplicar los cambios
sudo systemctl restart mysql

# Confirmar que arrancó con los nuevos parámetros
mysql -uroot -p -e "SHOW VARIABLES LIKE 'innodb_buffer_pool_size';"
mysql -uroot -p -e "SHOW VARIABLES LIKE 'slow_query_log';"
\`\`\`

---

## Tu script start-stop.sh

Crea un script que acepte argumentos (start, stop, restart, status, cycle) y maneje cada caso con mensajes claros.

> ⚙️ **El Arquitecto dice**: Antes de reiniciar MySQL en producción, siempre verifica que no hay transacciones largas activas: \`SHOW PROCESSLIST;\`. Un reinicio interrumpe todas las conexiones activas.
`,
  },

  // Unidad 3: almacenamiento, roles y primeras conexiones desde Java.
  {
    id: 9, slug: 'tablespaces', title: 'Tablespaces y archivos de datos InnoDB',
    unitId: 3, type: 'sql', difficulty: 3, xpReward: 130,
    estimatedTime: '2 horas', repoRequired: true,
    mode: 'desktop', missionIds: [],
    desktopTools: ['MySQL 8.x', 'Ubuntu Server', 'MySQL Workbench'],
    objectives: [
      'Crear bases de datos y tablas InnoDB documentando la generación de archivos .ibd',
      'Verificar la estrategia de almacenamiento por tabla (file-per-table)',
      'Documentar una estrategia de crecimiento de almacenamiento',
    ],
    deliverables: ['scripts/crear-tablespaces.sql', 'reporte.md con capturas de archivos .ibd'],
    content: `## El almacenamiento físico de InnoDB

En MySQL 8.x, cada tabla InnoDB tiene su propio archivo .ibd. Esto facilita el manejo del espacio y la recuperación ante fallos.

---

## Verificar la configuración de file-per-table

\`\`\`sql
-- Debe estar ON en MySQL 8.x (valor por defecto)
SHOW VARIABLES LIKE 'innodb_file_per_table';
\`\`\`

---

## Creación del esquema del proyecto

\`\`\`sql
CREATE DATABASE IF NOT EXISTS escolar_admin
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE escolar_admin;

-- Tabla principal: cada fila = un estudiante
CREATE TABLE IF NOT EXISTS alumnos (
  id              BIGINT          PRIMARY KEY AUTO_INCREMENT,
  numero_control  VARCHAR(20)     NOT NULL UNIQUE,
  nombre          VARCHAR(120)    NOT NULL,
  apellido_p      VARCHAR(80)     NOT NULL,
  apellido_m      VARCHAR(80),
  semestre        TINYINT         NOT NULL CHECK (semestre BETWEEN 1 AND 12),
  carrera         VARCHAR(100)    NOT NULL DEFAULT 'ISC',
  activo          BOOLEAN         NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC;

CREATE TABLE IF NOT EXISTS materias (
  id          INT         PRIMARY KEY AUTO_INCREMENT,
  clave       VARCHAR(10) NOT NULL UNIQUE,
  nombre      VARCHAR(150) NOT NULL,
  creditos    TINYINT     NOT NULL CHECK (creditos > 0),
  semestre    TINYINT     NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inscripciones (
  id          BIGINT      PRIMARY KEY AUTO_INCREMENT,
  alumno_id   BIGINT      NOT NULL,
  materia_id  INT         NOT NULL,
  periodo     CHAR(6)     NOT NULL,
  calificacion DECIMAL(4,2) CHECK (calificacion BETWEEN 0 AND 100),
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
  FOREIGN KEY (materia_id) REFERENCES materias(id)
) ENGINE=InnoDB;
\`\`\`

---

## Verificar los archivos en disco

\`\`\`bash
# Listar los .ibd del esquema recién creado
sudo ls -lh /var/lib/mysql/escolar_admin/

# Debes ver:
# alumnos.ibd
# materias.ibd
# inscripciones.ibd
\`\`\`

\`\`\`sql
-- Verificar tamaño desde SQL
SELECT
  TABLE_NAME,
  ROUND(DATA_LENGTH/1024, 2)  AS datos_kb,
  ROUND(INDEX_LENGTH/1024, 2) AS indices_kb,
  TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'escolar_admin';
\`\`\`

---

## Estrategia de crecimiento

Documenta en tu reporte: dado que el Instituto tiene ~3,000 alumnos activos, 80 materias y 4 períodos de inscripción por alumno por año — ¿cuánto espacio estimarías para 5 años de datos? Calcula en MB.

> 🗄️ **El Tesorero dice**: Siempre reserva el doble del espacio estimado. Los datos siempre crecen más de lo previsto.
`,
  },
  {
    id: 10, slug: 'usuarios-roles', title: 'Usuarios, roles y privilegios mínimos',
    unitId: 3, type: 'sql', difficulty: 3, xpReward: 140,
    estimatedTime: '2 horas', repoRequired: true,
    mode: 'desktop', missionIds: [],
    desktopTools: ['MySQL 8.x', 'Ubuntu Server'],
    objectives: [
      'Crear roles diferenciados con el principio de mínimo privilegio',
      'Asignar usuarios a roles y probar restricciones',
      'Documentar el modelo de acceso del proyecto',
    ],
    deliverables: ['scripts/usuarios-roles.sql', 'reporte.md con pruebas de acceso y restricciones'],
    content: `## El principio de mínimo privilegio

La regla más importante de seguridad en bases de datos: **ningún usuario debe tener más permisos de los estrictamente necesarios**.

---

## Modelo de roles para el proyecto escolar

\`\`\`sql
-- Crear los roles diferenciados
CREATE ROLE IF NOT EXISTS
  rol_dba,          -- administrador completo del esquema
  rol_captura,      -- ingresa y actualiza datos (sin eliminar)
  rol_consulta,     -- solo lectura
  rol_auditor;      -- lectura + performance_schema

-- Asignar privilegios
GRANT ALL PRIVILEGES ON escolar_admin.* TO rol_dba;
GRANT SELECT, INSERT, UPDATE ON escolar_admin.* TO rol_captura;
GRANT SELECT ON escolar_admin.* TO rol_consulta;
GRANT SELECT ON escolar_admin.* TO rol_auditor;
GRANT SELECT ON performance_schema.* TO rol_auditor;
\`\`\`

---

## Crear usuarios y asignar roles

\`\`\`sql
-- Aplicación de captura de datos
CREATE USER IF NOT EXISTS 'app_captura'@'localhost'
  IDENTIFIED BY 'CapApp_2026!'
  PASSWORD EXPIRE INTERVAL 90 DAY;
GRANT rol_captura TO 'app_captura'@'localhost';
SET DEFAULT ROLE rol_captura TO 'app_captura'@'localhost';

-- Aplicación de solo lectura (reportes, API pública)
CREATE USER IF NOT EXISTS 'app_reader'@'%'
  IDENTIFIED BY 'ReadApp_2026!'
  PASSWORD EXPIRE INTERVAL 90 DAY;
GRANT rol_consulta TO 'app_reader'@'%';
SET DEFAULT ROLE rol_consulta TO 'app_reader'@'%';

-- Verificar
SHOW GRANTS FOR 'app_captura'@'localhost';
SHOW GRANTS FOR 'app_reader'@'%';
\`\`\`

---

## Probar las restricciones

\`\`\`bash
# Conectar como app_captura
mysql -u app_captura -p escolar_admin

# Dentro de la sesión:
INSERT INTO alumnos (numero_control, nombre, apellido_p, semestre, carrera)
VALUES ('NC-000001', 'Test', 'Alumno', 1, 'ISC');
-- ✅ Debe funcionar

DELETE FROM alumnos WHERE id = 1;
-- ❌ Debe fallar: ERROR 1142 (42000): DELETE command denied

DROP TABLE alumnos;
-- ❌ Debe fallar: ERROR 1142 (42000): DROP command denied
\`\`\`

Documenta los mensajes de error en tu reporte — son la evidencia de que el modelo funciona.

> 🗄️ **El Tesorero dice**: Si un atacante compromete tu usuario de aplicación, el daño máximo es proporcional a los privilegios que le diste. Dale los justos y necesarios.
`,
  },
  {
    id: 11, slug: 'particionamiento', title: 'Particionamiento por rango y hash',
    unitId: 3, type: 'sql', difficulty: 4, xpReward: 160,
    estimatedTime: '2.5 horas', repoRequired: true,
    mode: 'playground', missionIds: [8, 9, 10, 11],
    desktopTools: ['MySQL 8.x'],
    objectives: [
      'Implementar particionamiento RANGE para datos históricos (bitácora por año)',
      'Implementar particionamiento HASH para distribución uniforme',
      'Verificar partition pruning con EXPLAIN y medir impacto',
      'Ejecutar operaciones de mantenimiento sobre particiones individuales',
    ],
    deliverables: ['scripts/particionamiento.sql', 'reporte.md con comparativa EXPLAIN y análisis de partition pruning'],
    content: `## ¿Por qué particionar? El problema de la escala

Imagina una tabla con 500 millones de registros. Sin particionamiento, cada query \`WHERE fecha BETWEEN '...' AND '...'\` lee millones de filas. **Con particionamiento RANGE por fecha, MySQL salta directamente a las particiones relevantes**.

---

## RANGE: bitácora de accesos por año

\`\`\`sql
CREATE TABLE bitacora_accesos (
  id              BIGINT   NOT NULL AUTO_INCREMENT,
  usuario         VARCHAR(80) NOT NULL,
  operacion       ENUM('LOGIN','LOGOUT','INSERT','UPDATE','DELETE') NOT NULL,
  fecha_hora      DATETIME NOT NULL,
  PRIMARY KEY (id, fecha_hora)  -- columna de partición DEBE estar en el PK
) ENGINE=InnoDB
PARTITION BY RANGE (YEAR(fecha_hora)) (
  PARTITION p_2023 VALUES LESS THAN (2024),
  PARTITION p_2024 VALUES LESS THAN (2025),
  PARTITION p_2025 VALUES LESS THAN (2026),
  PARTITION p_futuro VALUES LESS THAN MAXVALUE
);
\`\`\`

---

## Verificar partition pruning con EXPLAIN

\`\`\`sql
-- Sin pruning: lee todas las particiones
EXPLAIN SELECT * FROM bitacora_accesos WHERE usuario = 'admin';
-- partitions: p_2023,p_2024,p_2025,p_futuro  ← sin filtro por fecha

-- CON pruning: solo lee la partición relevante
EXPLAIN SELECT * FROM bitacora_accesos
WHERE fecha_hora >= '2025-01-01' AND fecha_hora < '2026-01-01';
-- partitions: p_2025  ← ¡solo una partición!
\`\`\`

---

## HASH: distribución uniforme de calificaciones

\`\`\`sql
CREATE TABLE calificaciones (
  id        BIGINT NOT NULL AUTO_INCREMENT,
  alumno_id BIGINT NOT NULL,
  periodo   CHAR(6) NOT NULL,
  calificacion DECIMAL(4,2) NOT NULL,
  PRIMARY KEY (id, alumno_id)
) PARTITION BY HASH(alumno_id) PARTITIONS 4;
-- alumno_id MOD 4 → partición 0, 1, 2 o 3
\`\`\`

---

## Mantenimiento de particiones

\`\`\`sql
-- Agregar partición para 2026
ALTER TABLE bitacora_accesos
  REORGANIZE PARTITION p_futuro INTO (
    PARTITION p_2026   VALUES LESS THAN (2027),
    PARTITION p_futuro VALUES LESS THAN MAXVALUE
  );

-- Vaciar una partición sin eliminar la estructura
ALTER TABLE bitacora_accesos TRUNCATE PARTITION p_2023;

-- Eliminar partición + datos (mucho más rápido que DELETE)
-- ALTER TABLE bitacora_accesos DROP PARTITION p_2023;
\`\`\`

> 🗄️ **El Tesorero dice**: \`DROP PARTITION\` es instantáneo aunque la partición tenga 100M de filas. \`DELETE WHERE year=2023\` puede tardar horas. Esta diferencia puede salvarte en producción.
`,
  },
  {
    id: 12, slug: 'jdbc-conexion', title: 'Primera conexión JDBC con usuario restringido',
    unitId: 3, type: 'java', difficulty: 3, xpReward: 150,
    estimatedTime: '2.5 horas', repoRequired: true,
    mode: 'desktop', missionIds: [],
    desktopTools: ['Java 17', 'Spring Boot 3.x', 'MySQL 8.x'],
    objectives: [
      'Conectar desde Java al usuario app_captura (solo DML)',
      'Verificar que las operaciones DDL son rechazadas por el SGBD',
      'Implementar ConexionFactory y UsuarioRepository con PreparedStatement',
    ],
    deliverables: ['jdbc-conexion-demo/ (proyecto Maven)', 'reporte.md con capturas de DDL rechazado'],
    content: `## Java habla con MySQL — sin ORM, sin magia

Esta es la práctica donde Java y MySQL se dan la mano. Sin Hibernate, sin JPA — solo JDBC puro. Cada línea de SQL que escribes en Java es exactamente lo que MySQL va a ejecutar.

---

## ConexionFactory.java

\`\`\`java
public class ConexionFactory {
    private static final String URL =
        "jdbc:mysql://localhost:3306/escolar_admin" +
        "?useSSL=false&serverTimezone=America/Monterrey";
    private static final String USER = "app_captura";
    private static final String PASS = System.getenv("DB_PASSWORD");

    public static Connection obtenerConexion() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASS);
    }
}
\`\`\`

---

## AlumnoRepository.java con PreparedStatement

\`\`\`java
// Con este usuario sí se permite DML; aquí no debería saltar ningún permiso raro.
public void insertar(Alumno a) throws SQLException {
    String sql = "INSERT INTO alumnos (numero_control, nombre, apellido_p, semestre) VALUES (?, ?, ?, ?)";
    try (Connection c = ConexionFactory.obtenerConexion();
         PreparedStatement ps = c.prepareStatement(sql)) {
        ps.setString(1, a.getNumeroControl());
        ps.setString(2, a.getNombre());
        ps.setString(3, a.getApellidoP());
        ps.setInt(4, a.getSemestre());
        ps.executeUpdate();
    }
}

// La carrera va parametrizada para no armar SQL con strings pegados. SQL injection no entra a esta fiesta.
public List<Alumno> porCarrera(String carrera) throws SQLException {
    String sql = "SELECT id, numero_control, nombre FROM alumnos WHERE carrera = ?";
    List<Alumno> resultado = new ArrayList<>();
    try (Connection c = ConexionFactory.obtenerConexion();
         PreparedStatement ps = c.prepareStatement(sql)) {
        ps.setString(1, carrera);
        ResultSet rs = ps.executeQuery();
        while (rs.next()) {
            resultado.add(new Alumno(rs.getLong("id"), rs.getString("numero_control"), rs.getString("nombre")));
        }
    }
    return resultado;
}
\`\`\`

---

## Verificar el rechazo de DDL

\`\`\`java
// Si esto no falla, el usuario app_captura tiene demasiado poder y ya valió la práctica.
String ddl = "DROP TABLE alumnos";
try (Connection c = ConexionFactory.obtenerConexion();
     Statement st = c.createStatement()) {
    st.execute(ddl);
    System.out.println("ERROR: el DDL no debería haberse ejecutado");
} catch (SQLException e) {
    System.out.println("✅ DDL rechazado correctamente: " + e.getMessage());
    // Este error confirma que el usuario de captura no puede hacer cosplay de DBA.
}
\`\`\`

Captura el mensaje de error en tu reporte — es la evidencia de que el modelo de privilegios funciona.

> 🗄️ **El Tesorero dice**: Nunca uses el usuario root en tu aplicación. Nunca. La aplicación solo necesita DML. El día que te hackeen, la diferencia entre un DELETE en tabla y un DROP DATABASE la habrás definido tú hoy.
`,
  },

  // Unidad 4: operación diaria, índices y transacciones.
  {
    id: 13, slug: 'consultas-lentas', title: 'Diagnóstico de consultas lentas',
    unitId: 4, type: 'bash', difficulty: 3, xpReward: 140,
    estimatedTime: '2.5 horas', repoRequired: true,
    mode: 'playground', missionIds: [12, 15],
    desktopTools: ['MySQL 8.x'],
    objectives: [
      'Habilitar slow_query_log en caliente sin reiniciar el servidor',
      'Analizar el log con mysqldumpslow e identificar los 5 queries más costosos',
      'Consultar performance_schema como alternativa moderna',
    ],
    deliverables: ['scripts/analisis-slowlog.sh', 'reporte.md con análisis de queries y propuestas de optimización'],
    content: `## El 80/20 del rendimiento de MySQL

El 80% de los problemas de rendimiento vienen del 20% de las consultas. Tu trabajo es encontrar ese 20%.

---

## Habilitar el slow query log (sin reiniciar)

\`\`\`sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;           -- umbral: 1 segundo
SET GLOBAL log_queries_not_using_indexes = 'ON';

-- Verificar
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';
\`\`\`

---

## Generar queries lentos de prueba

\`\`\`sql
USE escolar_admin;

-- Insertar 50,000 registros de prueba (si no los tienes)
-- (ver práctica 9 completa en el repositorio)

-- Queries que generarán entradas en el slow log:

-- 1. Función sobre columna → no usa índice
SELECT * FROM alumnos WHERE YEAR(creado_en) = 2025;

-- 2. LIKE con comodín al inicio
SELECT * FROM alumnos WHERE nombre LIKE '%arcía';

-- 3. Query legítima sin índice adecuado
SELECT semestre, COUNT(*) FROM alumnos
WHERE carrera = 'ISC' GROUP BY semestre ORDER BY 2 DESC;
\`\`\`

---

## Analizar con mysqldumpslow

\`\`\`bash
# Top 5 queries por tiempo total acumulado
sudo mysqldumpslow -s t -t 5 /var/log/mysql/mysql-slow.log

# Top 5 por número de apariciones
sudo mysqldumpslow -s c -t 5 /var/log/mysql/mysql-slow.log

# Interpretación de la salida:
# Count: 847 → aparece 847 veces
# Time=2.34s (1981s) → promedio (total acumulado)
# Rows=0.0 (0) → devuelve 0 filas en promedio
\`\`\`

---

## Alternativa moderna: Performance Schema

\`\`\`sql
SELECT
  SUBSTR(DIGEST_TEXT, 1, 80) AS query,
  COUNT_STAR AS ejecuciones,
  ROUND(AVG_TIMER_WAIT/1e9, 3) AS avg_seg,
  ROUND(SUM_ROWS_EXAMINED / NULLIF(SUM_ROWS_SENT, 0), 0) AS ratio
FROM performance_schema.events_statements_summary_by_digest
WHERE DIGEST_TEXT IS NOT NULL
ORDER BY AVG_TIMER_WAIT DESC LIMIT 10;
\`\`\`

> 🔧 **El Mecánico dice**: Un \`Rows_examined / Rows_sent > 100\` significa que el query lee 100 veces más datos de los que necesita. Eso es un índice faltante gritándote.
`,
  },
  {
    id: 14, slug: 'mantenimiento', title: 'Plan de mantenimiento: ANALYZE y OPTIMIZE',
    unitId: 4, type: 'sql', difficulty: 2, xpReward: 110,
    estimatedTime: '1.5 horas', repoRequired: true,
    mode: 'desktop', missionIds: [],
    desktopTools: ['MySQL 8.x', 'Ubuntu Server'],
    objectives: [
      'Ejecutar ANALYZE TABLE y entender su propósito',
      'Ejecutar OPTIMIZE TABLE y documentar el impacto en fragmentación',
      'Diseñar un plan de mantenimiento preventivo mensual',
    ],
    deliverables: ['scripts/mantenimiento.sql', 'reporte.md con plan de mantenimiento y evidencias'],
    content: `## El mantenimiento preventivo salva servidores

Como el aceite del motor de un coche, MySQL necesita mantenimiento regular para funcionar bien.

---

## ANALYZE TABLE: actualizar estadísticas del optimizador

\`\`\`sql
-- El optimizador de MySQL usa estadísticas para elegir los índices
-- Después de cargas masivas, las estadísticas pueden estar desactualizadas

ANALYZE TABLE escolar_admin.alumnos;
ANALYZE TABLE escolar_admin.materias;
ANALYZE TABLE escolar_admin.inscripciones;

-- Verificar estado después
SHOW TABLE STATUS FROM escolar_admin\\G
-- Buscar la columna "Update_time" — indica cuándo se actualizaron estadísticas
\`\`\`

---

## OPTIMIZE TABLE: eliminar fragmentación

\`\`\`sql
-- Ver fragmentación antes
SELECT TABLE_NAME, Data_free AS fragmentacion_bytes
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'escolar_admin'
ORDER BY Data_free DESC;

-- Reorganizar la tabla (equivalente a reconstruir el .ibd)
OPTIMIZE TABLE escolar_admin.alumnos;

-- Verificar después
SELECT TABLE_NAME, Data_free
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'escolar_admin' AND TABLE_NAME = 'alumnos';
\`\`\`

---

## Tu plan de mantenimiento mensual

Crea una tabla con las tareas, frecuencia y responsable:

| Tarea | Frecuencia | Comando | Ventana sugerida |
|---|---|---|---|
| Actualizar estadísticas | Diario (tablas activas) | ANALYZE TABLE | 02:00 AM |
| Optimizar tablas fragmentadas | Mensual | OPTIMIZE TABLE | Domingo 03:00 AM |
| Verificar integridad | Mensual | CHECK TABLE | Domingo 04:00 AM |
| Revisar slow log | Semanal | mysqldumpslow | Viernes |
| Verificar tamaño de BD | Diario | information_schema | 06:00 AM |

> 🔧 **El Mecánico dice**: OPTIMIZE TABLE reconstruye el archivo .ibd completo. En tablas grandes puede tardar horas. Hazlo siempre en horario de baja actividad.
`,
  },
  {
    id: 15, slug: 'indices', title: 'Gestión de índices y análisis con EXPLAIN',
    unitId: 4, type: 'sql', difficulty: 4, xpReward: 160,
    estimatedTime: '3 horas', repoRequired: true,
    mode: 'playground', missionIds: [13, 14, 15],
    desktopTools: ['MySQL 8.x', 'MySQL Workbench'],
    objectives: [
      'Medir el rendimiento de queries con y sin índice usando EXPLAIN',
      'Crear índices simples, compuestos y covering indexes',
      'Identificar los 4 antipatrones principales que deshabilitan índices',
    ],
    deliverables: ['scripts/gestion-indices.sql', 'reporte.md con tabla comparativa EXPLAIN antes/después'],
    content: `## Los índices son el arma secreta del DBA

Un índice bien puesto puede convertir una query de 30 segundos en 0.001 segundos. Uno mal puesto puede ralentizar todas las escrituras.

---

## Baseline: sin índices

\`\`\`sql
-- Ver índices actuales
SHOW INDEX FROM escolar_admin.alumnos;

-- EXPLAIN sin índice adecuado
EXPLAIN SELECT * FROM alumnos WHERE carrera = 'ISC' AND semestre = 3;
-- Buscar: type=ALL  key=NULL  rows=~50000  ← full scan
\`\`\`

---

## Crear índices estratégicos

\`\`\`sql
-- Índice compuesto: carrera + semestre
-- Orden importa: la columna con mayor selectividad va primero
CREATE INDEX idx_carrera_semestre ON alumnos (carrera, semestre);

-- Índice para ORDER BY (evita filesort)
CREATE INDEX idx_carrera_nombre ON alumnos (carrera, nombre);

-- Índice para rango de fechas
CREATE INDEX idx_creado_en ON alumnos (creado_en);

-- Actualizar estadísticas
ANALYZE TABLE alumnos;
\`\`\`

---

## EXPLAIN después de los índices

\`\`\`sql
EXPLAIN SELECT * FROM alumnos WHERE carrera = 'ISC' AND semestre = 3;
-- Ahora: type=ref  key=idx_carrera_semestre  rows=~2000

EXPLAIN SELECT nombre, semestre FROM alumnos
WHERE carrera = 'ISC' ORDER BY nombre LIMIT 10;
-- Extra: NO "Using filesort" gracias a idx_carrera_nombre
\`\`\`

---

## Los 4 antipatrones que deshabilitan índices

\`\`\`sql
-- ❌ 1. Función sobre columna indexada
WHERE YEAR(creado_en) = 2025
-- ✅ Reescribir con rango:
WHERE creado_en >= '2025-01-01' AND creado_en < '2026-01-01'

-- ❌ 2. LIKE con comodín al inicio
WHERE nombre LIKE '%arcía'
-- ✅ LIKE con prefijo usa índice:
WHERE nombre LIKE 'García%'

-- ❌ 3. Conversión implícita de tipos
WHERE numero_control = 100  -- número en columna VARCHAR
-- ✅ Tipo correcto:
WHERE numero_control = '100'

-- ❌ 4. Solo el segundo campo del índice compuesto
WHERE semestre = 3  -- sin carrera
-- El índice (carrera, semestre) no puede usarse sin carrera
-- ✅ Crear índice específico: INDEX idx_semestre ON alumnos(semestre)
\`\`\`

> 🔧 **El Mecánico dice**: Un \`EXPLAIN\` que muestra \`type=ALL\` en una tabla grande es una emergencia silenciosa. Puede ser que en desarrollo con 100 filas no se note, pero en producción con 10M filas tu servidor se caerá.
`,
  },
  {
    id: 16, slug: 'modos-operacion', title: 'Modos de operación: alta, baja y recovery',
    unitId: 4, type: 'java', difficulty: 4, xpReward: 170,
    estimatedTime: '3 horas', repoRequired: true,
    mode: 'desktop', missionIds: [17, 18],
    desktopTools: ['Java 17', 'Spring Boot 3.x', 'MySQL 8.x'],
    objectives: [
      'Implementar transacciones manuales con setAutoCommit(false)',
      'Manejar rollback en casos de error correctamente',
      'Verificar con EXPLAIN desde Java que los queries usan los índices creados',
    ],
    deliverables: ['jdbc-transacciones-demo/ (proyecto Maven)', 'reporte.md con demostración de rollback y EXPLAIN'],
    content: `## Las transacciones: todo o nada

Una transacción es una promesa: o se ejecutan TODAS las operaciones, o no se ejecuta NINGUNA. Sin transacciones, una falla a la mitad deja los datos en un estado inconsistente.

---

## TransaccionService.java

\`\`\`java
public class TransaccionService {

    // Dos escrituras que deben vivir o morir juntas; no queremos media inscripción en producción.
    public void inscribir(long alumnoId, int materiaId, String periodo)
            throws SQLException {

        try (Connection conn = ConexionFactory.obtenerConexion()) {
            conn.setAutoCommit(false);  // Desde aquí nada se confirma solo; modo jefe final activado.

            try {
                // Primero registramos la inscripción real.
                String sql1 = "INSERT INTO inscripciones (alumno_id, materia_id, periodo) VALUES (?, ?, ?)";
                try (PreparedStatement ps = conn.prepareStatement(sql1)) {
                    ps.setLong(1, alumnoId);
                    ps.setInt(2, materiaId);
                    ps.setString(3, periodo);
                    ps.executeUpdate();
                }

                // Luego dejamos rastro en bitácora; si esto falla, también cae la inscripción.
                String sql2 = "INSERT INTO bitacora_accesos (usuario, operacion, tabla_afectada, fecha_hora) VALUES (?, 'INSERT', 'inscripciones', NOW())";
                try (PreparedStatement ps = conn.prepareStatement(sql2)) {
                    ps.setLong(1, alumnoId);
                    ps.executeUpdate();
                }

                conn.commit();  // Ambos pasos pasaron, ahora sí se guarda el combo completo.
                System.out.println("✅ Inscripción confirmada");

            } catch (SQLException e) {
                conn.rollback();  // Algo explotó; regresamos el estado para no dejar datos a medias.
                System.out.println("❌ Rollback ejecutado: " + e.getMessage());
                throw e;
            }
        }
    }
}
\`\`\`

---

## Verificar el uso de índices desde Java

\`\`\`java
public void verificarIndice(String carrera) throws SQLException {
    String explain = "EXPLAIN SELECT * FROM alumnos WHERE carrera = ? AND semestre = 3";
    try (Connection conn = ConexionFactory.obtenerConexion();
         PreparedStatement ps = conn.prepareStatement(explain)) {
        ps.setString(1, carrera);
        ResultSet rs = ps.executeQuery();
        while (rs.next()) {
            System.out.printf("type: %-8s | key: %-25s | rows: %d%n",
                rs.getString("type"),
                rs.getString("key"),   // Si no sale idx_carrera_semestre, el optimizador tomó otro camino.
                rs.getInt("rows"));
        }
    }
}
\`\`\`

---

## Simular un rollback

Para demostrar que el rollback funciona, lanza una excepción intencionalmente en el paso 2 y verifica que el paso 1 también se revirtió:

\`\`\`java
// Lanza esto después del paso 1 y antes del commit para comprobar que rollback sí deshace todo.
if (simularError) {
    throw new SQLException("Error simulado para demostrar rollback");
}
\`\`\`

Verifica con \`SELECT COUNT(*) FROM inscripciones\` que el registro NO fue insertado.

> 🔧 **El Mecánico dice**: setAutoCommit(false) es la primera línea de una transacción. Si lo olvidas, cada sentencia se confirma sola — y no hay rollback posible.
`,
  },

  // Unidad 5: seguridad, réplica y recuperación.
  {
    id: 17, slug: 'espejeo', title: 'Espejeo (mirroring) y alta disponibilidad',
    unitId: 5, type: 'sql', difficulty: 3, xpReward: 130,
    estimatedTime: '2 horas', repoRequired: true,
    mode: 'desktop', missionIds: [16],
    desktopTools: ['MySQL 8.x', 'Ubuntu Server'],
    objectives: [
      'Implementar política de contraseñas con validate_password',
      'Auditar usuarios existentes y detectar privilegios excesivos',
      'Documentar el modelo de acceso completo del proyecto',
    ],
    deliverables: ['scripts/politica-privilegios.sql', 'reporte.md con auditoría de usuarios'],
    content: `## La seguridad empieza con los usuarios

El primer vector de ataque a una base de datos son los usuarios con privilegios excesivos. Esta práctica te enseña a auditarlos y corregirlos.

---

## Auditoría de usuarios existentes

\`\`\`sql
-- Ver todos los usuarios, sus hosts y método de autenticación
SELECT user, host, plugin, password_expired, account_locked
FROM mysql.user
ORDER BY user;

-- Detectar usuarios con acceso desde cualquier host (riesgo)
SELECT user, host FROM mysql.user WHERE host = '%';

-- Detectar usuarios sin contraseña
SELECT user, host FROM mysql.user WHERE authentication_string = '';

-- Detectar usuarios con ALL PRIVILEGES (potencialmente excesivo)
SELECT GRANTEE, PRIVILEGE_TYPE
FROM information_schema.USER_PRIVILEGES
WHERE PRIVILEGE_TYPE = 'SUPER' OR PRIVILEGE_TYPE = 'FILE';
\`\`\`

---

## Configurar política de contraseñas

\`\`\`sql
-- Verificar si validate_password está activo
SHOW VARIABLES LIKE 'validate_password%';

-- Activar si no está activo
INSTALL COMPONENT 'file://component_validate_password';

-- Configurar nivel de seguridad
SET GLOBAL validate_password.policy = 'MEDIUM';
SET GLOBAL validate_password.length = 10;
SET GLOBAL validate_password.mixed_case_count = 1;
SET GLOBAL validate_password.number_count = 1;
SET GLOBAL validate_password.special_char_count = 1;
\`\`\`

---

## Aplicar el modelo de privilegios mínimos

\`\`\`sql
-- Revisar los privilegios de cada usuario del proyecto
SHOW GRANTS FOR 'app_captura'@'localhost';
SHOW GRANTS FOR 'app_reader'@'%';

-- Si tienen más privilegios de los necesarios, revocar el exceso
REVOKE INSERT, UPDATE ON escolar_admin.* FROM 'app_reader'@'%';

-- Forzar expiración de contraseña para cambio inmediato
ALTER USER 'app_captura'@'localhost' PASSWORD EXPIRE;
\`\`\`

> 🛡️ **El Guardián dice**: Haz esta auditoría cada 3 meses en producción. Los privilegios se van acumulando con el tiempo — desarrolladores que piden acceso temporal y nunca lo devuelven.
`,
  },
  {
    id: 18, slug: 'respaldo', title: 'Métodos de respaldo del SGBD',
    unitId: 5, type: 'sql', difficulty: 4, xpReward: 160,
    estimatedTime: '2.5 horas', repoRequired: true,
    mode: 'desktop', missionIds: [],
    desktopTools: ['MySQL 8.x', 'Ubuntu Server', 'OpenSSL'],
    objectives: [
      'Verificar que TLS está activo en las conexiones cliente-servidor',
      'Configurar require_secure_transport para forzar conexiones cifradas',
      'Documentar la estrategia de cifrado en reposo con InnoDB',
    ],
    deliverables: ['scripts/verificar-tls.sql', 'reporte.md con evidencias de TLS activo'],
    content: `## Datos en tránsito = datos en riesgo

Sin TLS, cada credencial, cada consulta y cada resultado viaja en texto plano por la red. Un ataque de hombre en el medio (MITM) capturaría todo.

---

## Verificar el estado actual de TLS

\`\`\`sql
-- ¿Está TLS habilitado?
SHOW VARIABLES LIKE 'require_secure_transport';
SHOW VARIABLES LIKE 'tls_version';

-- ¿La conexión actual usa TLS?
SHOW STATUS LIKE 'Ssl_cipher';
SHOW STATUS LIKE 'Ssl_version';
-- Si Ssl_cipher está vacío, la conexión actual NO usa TLS
\`\`\`

---

## Forzar TLS en todas las conexiones

\`\`\`sql
-- Habilitar TLS obligatorio (cuidado: todas las conexiones deben soportarlo)
SET GLOBAL require_secure_transport = ON;
\`\`\`

En /etc/mysql/mysql.conf.d/mysqld.cnf para hacerlo persistente:
\`\`\`ini
require_secure_transport = ON
tls_version = TLSv1.2,TLSv1.3
\`\`\`

---

## Conectar con TLS desde el cliente

\`\`\`bash
# Conexión explícita con TLS
mysql -u root -p --ssl-mode=REQUIRED

# Verificar que la conexión usa cifrado
mysql> SHOW STATUS LIKE 'Ssl_cipher';
# Debe mostrar algo como: TLS_AES_256_GCM_SHA384
\`\`\`

---

## Cifrado en reposo: InnoDB Tablespace Encryption

\`\`\`sql
-- MySQL 8.x soporta cifrado a nivel de tablespace
-- Verificar disponibilidad
SHOW VARIABLES LIKE 'table_encryption_privilege_check';

-- Crear tabla cifrada (requiere keyring plugin configurado)
CREATE TABLE datos_sensibles (
  id INT PRIMARY KEY,
  informacion TEXT
) ENGINE=InnoDB ENCRYPTION='Y';
\`\`\`

> 🛡️ **El Guardián dice**: TLS protege los datos mientras viajan. El cifrado en reposo los protege si alguien roba el disco físico del servidor. Necesitas ambos.
`,
  },
  {
    id: 19, slug: 'replicacion', title: 'Réplica (replication) Source-Replica',
    unitId: 5, type: 'sql', difficulty: 5, xpReward: 200,
    estimatedTime: '4 horas', repoRequired: true,
    mode: 'desktop', missionIds: [],
    desktopTools: ['MySQL 8.x', 'Ubuntu Server (x2)'],
    objectives: [
      'Configurar replicación asíncrona Source-Replica entre dos instancias MySQL',
      'Verificar que los datos se sincronizan correctamente',
      'Medir el lag de replicación y entender su impacto',
    ],
    deliverables: ['scripts/replicacion-config.sql', 'reporte.md con evidencias de replicación funcionando'],
    content: `## La replicación: el seguro de vida de la BD

La replicación Source-Replica te da: alta disponibilidad, distribución de carga de lectura, y una réplica lista para tomar el lugar del source si falla.

---

## Arquitectura de la práctica

\`\`\`
VM1 (Source) ──binlog──→ VM2 (Replica)
  ├── escrituras           └── lecturas (reportes, API pública)
  └── binlog habilitado        └── read_only = ON
\`\`\`

---

## En el SOURCE (VM1)

\`\`\`sql
-- Verificar que binlog está habilitado
SHOW VARIABLES LIKE 'log_bin';

-- Crear usuario de replicación con acceso solo desde la subred de réplicas
CREATE USER 'replica_user'@'10.%' IDENTIFIED BY 'ReplicaPass_2026!';
GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'replica_user'@'10.%';
FLUSH PRIVILEGES;

-- Ver posición actual del binlog
SHOW MASTER STATUS\\G
\`\`\`

---

## En la REPLICA (VM2)

\`\`\`sql
-- Apuntar a la fuente
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST     = '10.0.0.10',
  SOURCE_USER     = 'replica_user',
  SOURCE_PASSWORD = 'ReplicaPass_2026!',
  SOURCE_AUTO_POSITION = 1,
  SOURCE_SSL      = 1;

-- Iniciar replicación
START REPLICA;

-- Verificar estado
SHOW REPLICA STATUS\\G
-- Campos críticos:
-- Replica_IO_Running   : Yes ✅
-- Replica_SQL_Running  : Yes ✅
-- Seconds_Behind_Source: 0  ✅
\`\`\`

---

## Verificar sincronización

\`\`\`sql
-- En el SOURCE: insertar un registro
INSERT INTO escolar_admin.alumnos (numero_control, nombre, apellido_p, semestre, carrera)
VALUES ('NC-TEST-01', 'Test Replica', 'Prueba', 1, 'ISC');

-- En la REPLICA (segundos después): verificar que llegó
SELECT * FROM escolar_admin.alumnos WHERE numero_control = 'NC-TEST-01';
-- Debe aparecer el registro
\`\`\`

> 🛡️ **El Guardián dice**: La replicación no es un respaldo. Si borras datos en el source, se borran en la réplica también. Necesitas AMBAS cosas: replicación para disponibilidad y backups para recuperación.
`,
  },
  {
    id: 20, slug: 'recuperacion-migracion', title: 'Métodos de recuperación y migración de la BD',
    unitId: 5, type: 'bash', difficulty: 4, xpReward: 170,
    estimatedTime: '2.5 horas', repoRequired: true,  // Junta recuperación y migración porque comparten el mismo plan de rollback.
    mode: 'desktop', missionIds: [],
    desktopTools: ['MySQL 8.x', 'Ubuntu Server'],
    objectives: [
      'Ejecutar checklist completo de hardening de MySQL',
      'Documentar el estado antes y después de cada control',
      'Generar un reporte de postura de seguridad',
    ],
    deliverables: ['scripts/auditoria-hardening.sh', 'reporte.md con checklist de hardening completado'],
    content: `## El checklist de seguridad que todo DBA debe memorizar

El hardening es el proceso de reducir la superficie de ataque del servidor. Cada elemento del checklist que completes elimina una posible vía de compromiso.

---

## Checklist de hardening MySQL

\`\`\`bash
#!/usr/bin/env bash
# auditoria-hardening.sh

echo "Auditoría de hardening MySQL"
echo "Fecha: $(date)"
echo ""

echo "1. Usuarios anónimos (debe ser 0)"
mysql -uroot -p -se "SELECT COUNT(*) FROM mysql.user WHERE User='';"

echo "2. Root con acceso remoto (debe ser 0)"
mysql -uroot -p -se "SELECT user, host FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost','127.0.0.1','::1');"

echo "3. Base de datos test (debe no existir)"
mysql -uroot -p -se "SHOW DATABASES LIKE 'test';"

echo "4. Transport security"
mysql -uroot -p -se "SHOW VARIABLES LIKE 'require_secure_transport';"

echo "5. Validación de contraseñas"
mysql -uroot -p -se "SHOW VARIABLES LIKE 'validate_password%';"

echo "6. Usuarios con privilegios excesivos"
mysql -uroot -p -se "SELECT user, host FROM mysql.user WHERE Super_priv='Y' AND user != 'root';"

echo "7. Slow query log activo"
mysql -uroot -p -se "SHOW VARIABLES LIKE 'slow_query_log';"

echo "8. Binary log activo"
mysql -uroot -p -se "SHOW VARIABLES LIKE 'log_bin';"
\`\`\`

---

## Correcciones a aplicar

Para cada elemento en rojo (estado inseguro), documenta el comando que ejecutaste para corregirlo y el estado después:

| Control | Estado antes | Comando aplicado | Estado después |
|---|---|---|---|
| Usuarios anónimos | 1 encontrado | \`DELETE FROM mysql.user WHERE User='';\` | 0 |
| … | … | … | … |

> 🛡️ **El Guardián dice**: El hardening no es un evento único. Cada vez que alguien instala MySQL nuevo, hay que hardenearlo. Automatiza este script en el proceso de instalación.
`,
  },

  // Unidad 6: monitoreo, auditoría y cierre del proyecto.
  {
    id: 21, slug: 'metricas', title: 'Métricas de disponibilidad y rendimiento',
    unitId: 6, type: 'sql', difficulty: 3, xpReward: 140,
    estimatedTime: '2.5 horas', repoRequired: true,
    mode: 'playground', missionIds: [19, 20],
    desktopTools: ['MySQL 8.x', 'performance_schema'],
    objectives: [
      'Construir un panel de métricas con Performance Schema',
      'Medir hit ratio del buffer pool, conexiones activas y throughput',
      'Definir umbrales de alerta con criterio técnico',
    ],
    deliverables: ['scripts/metricas-performance.sql', 'reporte.md con panel de métricas y umbrales definidos'],
    content: `## Performance Schema: el ojo que todo lo ve

Performance Schema es la herramienta de observabilidad más poderosa de MySQL. Captura métricas en memoria en tiempo real sin necesidad de instalar nada externo.

---

## Panel de métricas completo

\`\`\`sql
-- Panel de monitoreo SCB-1001. Corre cada bloque por separado si MySQL se pone dramático.

-- 1. Uptime del servidor
SELECT SEC_TO_TIME(VARIABLE_VALUE) AS uptime_legible
FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Uptime';

-- 2. Hit ratio del buffer pool (objetivo: > 99%)
SELECT ROUND(
  (1 - (
    (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME='Innodb_buffer_pool_reads') /
    NULLIF((SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME='Innodb_buffer_pool_read_requests'),0)
  )) * 100, 2
) AS hit_ratio_pct;

-- 3. Uso de conexiones
SELECT
  (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME='Threads_connected') AS activas,
  (SELECT VARIABLE_VALUE FROM performance_schema.global_variables WHERE VARIABLE_NAME='max_connections') AS maximas;

-- 4. Top 5 queries más lentos
SELECT SUBSTR(DIGEST_TEXT,1,80) AS query,
       COUNT_STAR AS runs,
       ROUND(AVG_TIMER_WAIT/1e9,3) AS avg_seg
FROM performance_schema.events_statements_summary_by_digest
WHERE DIGEST_TEXT IS NOT NULL
ORDER BY AVG_TIMER_WAIT DESC LIMIT 5;

-- 5. Tablas con full scans
SELECT OBJECT_SCHEMA, OBJECT_NAME, COUNT_FULL_SCANS
FROM performance_schema.table_io_waits_summary_by_table
WHERE COUNT_FULL_SCANS > 0
ORDER BY COUNT_FULL_SCANS DESC LIMIT 5;
\`\`\`

---

## Tabla de umbrales de alerta

Define para tu proyecto integrador:

| Métrica | Normal | Advertencia | Crítico | Acción |
|---|---|---|---|---|
| Hit ratio buffer pool | > 99% | 95-99% | < 95% | Aumentar innodb_buffer_pool_size |
| Conexiones activas | < 70% | 70-85% | > 85% | Revisar pool de conexiones |
| Queries lentos/hora | < 10 | 10-50 | > 50 | EXPLAIN + optimizar |
| Lag replicación | 0 seg | 1-30 seg | > 30 seg | Revisar red y carga |

> 👁️ **El Oráculo dice**: El monitoreo reactivo llega tarde. El proactivo llega antes de que el usuario note el problema. Define umbrales antes de que la crisis ocurra.
`,
  },
  {
    id: 22, slug: 'auditoria', title: 'Auditoría de operaciones DDL/DML',
    unitId: 6, type: 'sql', difficulty: 4, xpReward: 160,
    estimatedTime: '2.5 horas', repoRequired: true,
    mode: 'desktop', missionIds: [22],
    desktopTools: ['MySQL 8.x', 'Audit Log Plugin'],
    objectives: [
      'Configurar Performance Schema para capturar eventos DDL/DML por usuario',
      'Generar un reporte de actividad de los últimos N días',
      'Proponer una política formal de auditoría para el proyecto',
    ],
    deliverables: ['scripts/auditoria-basica.sql', 'reporte.md con política de auditoría y evidencias'],
    content: `## La trazabilidad: saber quién hizo qué y cuándo

En producción, necesitas poder responder: ¿quién borró esa tabla? ¿cuándo se modificaron esos datos? La auditoría te da esa respuesta.

---

## Auditoría con Performance Schema

\`\`\`sql
-- 1. Verificar que PS está activo
SHOW VARIABLES LIKE 'performance_schema';

-- 2. Habilitar instrumentación de statements por usuario
UPDATE performance_schema.setup_instruments
SET ENABLED='YES', TIMED='YES' WHERE NAME LIKE 'statement/%';

UPDATE performance_schema.setup_consumers
SET ENABLED='YES' WHERE NAME LIKE '%statements%';

-- 3. Resumen de operaciones por tipo
SELECT EVENT_NAME, COUNT_STAR AS total
FROM performance_schema.events_statements_summary_global_by_event_name
WHERE EVENT_NAME LIKE 'statement/sql/%' AND COUNT_STAR > 0
ORDER BY COUNT_STAR DESC LIMIT 15;

-- 4. Actividad por usuario/cuenta
SELECT USER, HOST,
       COUNT_STAR AS total_statements,
       SUM_ERRORS AS errores,
       SUM_WARNINGS AS advertencias
FROM performance_schema.events_statements_summary_by_account_by_event_name
WHERE COUNT_STAR > 0
GROUP BY USER, HOST ORDER BY COUNT_STAR DESC;

-- 5. Historial reciente de queries (últimas 10,000 ejecuciones)
SELECT EVENT_ID, CURRENT_SCHEMA, SQL_TEXT,
       TIMER_WAIT/1e9 AS duracion_seg,
       ERRORS, WARNINGS
FROM performance_schema.events_statements_history_long
WHERE SQL_TEXT IS NOT NULL
ORDER BY EVENT_ID DESC LIMIT 20;
\`\`\`

---

## Política de auditoría (documento a redactar)

Tu reporte debe incluir una política formal con:

1. **¿Qué eventos auditar?** (DDL, DML fallido, logins fallidos)
2. **¿Por cuánto tiempo retener los logs?** (30 días, 90 días, 1 año)
3. **¿Quién revisa los reportes?** (DBA, Seguridad, Dirección)
4. **¿Qué desencadena una alerta?** (X errores consecutivos, operaciones masivas)
5. **¿Dónde se almacenan los logs?** (local, SIEM, S3)

> 👁️ **El Oráculo dice**: Sin auditoría, un incidente de datos se convierte en un misterio imposible de resolver. Con auditoría, es una investigación con evidencias concretas.
`,
  },
  {
    id: 23, slug: 'alertas-tablero', title: 'Alertamiento básico y tableros',
    unitId: 6, type: 'sql', difficulty: 3, xpReward: 140,
    estimatedTime: '2 horas', repoRequired: true,
    mode: 'playground', missionIds: [23],
    desktopTools: ['MySQL 8.x'],
    objectives: [
      'Definir umbrales de alerta para las métricas principales',
      'Implementar checks manuales que generan alertas cuando se superan umbrales',
      'Diseñar el tablero de monitoreo del proyecto integrador',
    ],
    deliverables: ['scripts/alertas-umbral.sql', 'reporte.md con diseño del tablero y umbrales'],
    content: `## Del monitoreo pasivo al activo

Ver métricas es observar. Recibir alertas cuando algo se sale de rango es monitorear proactivamente.

---

## Checks de umbral implementables en SQL

\`\`\`sql
-- Check 1: Conexiones (alerta si > 80% del máximo)
SELECT
  VARIABLE_VALUE AS conexiones_activas,
  (SELECT VARIABLE_VALUE FROM performance_schema.global_variables
   WHERE VARIABLE_NAME='max_connections') AS max_conexiones,
  CASE
    WHEN CAST(VARIABLE_VALUE AS UNSIGNED) > 0.8 *
         CAST((SELECT VARIABLE_VALUE FROM performance_schema.global_variables
               WHERE VARIABLE_NAME='max_connections') AS UNSIGNED)
    THEN '🔴 ALERTA: conexiones > 80%'
    ELSE '✅ OK'
  END AS estado
FROM performance_schema.global_status
WHERE VARIABLE_NAME='Threads_connected';

-- Check 2: Queries lentos acumulados
SELECT VARIABLE_VALUE AS slow_queries_total,
  CASE WHEN CAST(VARIABLE_VALUE AS UNSIGNED) > 1000 THEN '🔴 ALERTA'
       WHEN CAST(VARIABLE_VALUE AS UNSIGNED) > 100  THEN '⚠️ ADVERTENCIA'
       ELSE '✅ OK' END AS estado
FROM performance_schema.global_status
WHERE VARIABLE_NAME='Slow_queries';

-- Check 3: Conexiones abortadas (posible ataque o fallo de red)
SELECT VARIABLE_VALUE AS aborted_connects,
  CASE WHEN CAST(VARIABLE_VALUE AS UNSIGNED) > 50 THEN '🔴 Revisar seguridad'
       ELSE '✅ OK' END AS estado
FROM performance_schema.global_status
WHERE VARIABLE_NAME='Aborted_connects';

-- Check 4: Threads en ejecución activa
SHOW GLOBAL STATUS LIKE 'Threads_running';
-- Si > 20: posible saturación del servidor
\`\`\`

---

## Diseño del tablero de monitoreo

En tu reporte, diseña (puede ser diagrama o tabla) el tablero con:
- 4-6 métricas visibles en pantalla principal
- Color verde/amarillo/rojo según umbral
- Frecuencia de actualización (cada 30s, 1 min, 5 min)
- Quién lo consulta y con qué frecuencia

Herramientas que podrías usar más adelante: Grafana + Prometheus + mysql_exporter.

> 👁️ **El Oráculo dice**: Un tablero que nadie mira no sirve de nada. Diseña el tablero para la persona que lo va a usar, no para impresionar.
`,
  },
  {
    id: 24, slug: 'informe-final', title: 'Informe final de continuidad operativa',
    unitId: 6, type: 'java', difficulty: 5, xpReward: 250,
    estimatedTime: '5 horas', repoRequired: true,
    mode: 'desktop', missionIds: [21],
    desktopTools: ['MySQL 8.x', 'Google Docs/Word'],
    objectives: [
      'Integrar MonitoreoRepository con consultas JDBC a performance_schema',
      'Exponer health check con Spring Boot Actuator',
      'Entregar el informe final del proyecto integrador',
    ],
    deliverables: ['jdbc-monitoreo-demo/ (proyecto Maven con Actuator)', 'informe-final.md con plan 30/60/90 días'],
    content: `## El jefe final: el Proyecto Integrador

Esta es la práctica culminante. Integras todo lo aprendido: MySQL configurado, roles y privilegios, índices optimizados, replicación, respaldos, monitoreo — todo conectado a la API REST de Spring Boot.

---

## MonitoreoRepository.java

\`\`\`java
@Repository
public class MonitoreoRepository {
    private final JdbcTemplate jdbc;

    public int conexionesActivas() {
        return jdbc.queryForObject(
            "SELECT COUNT(*) FROM performance_schema.processlist WHERE command != 'Sleep'",
            Integer.class);
    }

    public double hitRatioBufferPool() {
        return jdbc.queryForObject("""
            SELECT ROUND(1 - (
              (SELECT VARIABLE_VALUE FROM performance_schema.global_status
               WHERE VARIABLE_NAME='Innodb_buffer_pool_reads') /
              NULLIF((SELECT VARIABLE_VALUE FROM performance_schema.global_status
               WHERE VARIABLE_NAME='Innodb_buffer_pool_read_requests'), 0)
            ), 4)""", Double.class);
    }

    public List<Map<String,Object>> tablasConFullScan() {
        return jdbc.queryForList("""
            SELECT OBJECT_SCHEMA, OBJECT_NAME, COUNT_FULL_SCANS
            FROM performance_schema.table_io_waits_summary_by_table
            WHERE COUNT_FULL_SCANS > 0
              AND OBJECT_SCHEMA NOT IN ('mysql','performance_schema','information_schema','sys')
            ORDER BY COUNT_FULL_SCANS DESC LIMIT 5""");
    }
}
\`\`\`

---

## application.properties para Actuator

\`\`\`properties
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always

# Verificar desde terminal:
# curl http://localhost:8080/actuator/health
# curl http://localhost:8080/actuator/metrics/hikaricp.connections.active
\`\`\`

---

## Informe final: plan 30/60/90 días

| Período | Actividad | Objetivo |
|---|---|---|
| **30 días** | Optimizar los 3 queries más lentos identificados | Reducir avg_sec < 0.1 |
| **30 días** | Automatizar script de backup + verificación | RPO < 24 horas |
| **60 días** | Implementar alertas vía email para métricas críticas | Detección proactiva |
| **60 días** | Revisar y rotar contraseñas de usuarios de aplicación | Cumplimiento política 90 días |
| **90 días** | Evaluar particionamiento de tabla inscripciones | Preparar para crecimiento 5 años |
| **90 días** | Documentar Runbook de recuperación ante desastres | RTO < 4 horas |

> 👁️ **El Oráculo dice**: Un DBA completo no solo hace que las cosas funcionen hoy. Planifica para que sigan funcionando en 1, 3 y 5 años. El informe de continuidad operativa es tu promesa al futuro.
`,
  },
]

// Búsquedas usadas por páginas dinámicas; mantenlas simples para no esconder navegación en magia.

export function getPracticeById(id: number): Practice | undefined {
  return practices.find(p => p.id === id)
}

export function getPracticesByUnit(unitId: number): Practice[] {
  return practices.filter(p => p.unitId === unitId)
}

export function getUnitById(id: number): Unit | undefined {
  return units.find(u => u.id === id)
}

export function getUnitByPracticeId(practiceId: number): Unit | undefined {
  const practice = getPracticeById(practiceId)
  if (!practice) return undefined
  return getUnitById(practice.unitId)
}

export const typeColors: Record<string, string> = {
  sql: '#3b82f6', java: '#f97316', bash: '#22c55e', doc: '#a78bfa',
}
export const typeBg: Record<string, string> = {
  sql: 'bg-blue-950/60 border-blue-800/40 text-blue-300',
  java: 'bg-orange-950/60 border-orange-800/40 text-orange-300',
  bash: 'bg-green-950/60 border-green-800/40 text-green-300',
  doc: 'bg-violet-950/60 border-violet-800/40 text-violet-300',
}
export const typeLabel: Record<string, string> = {
  sql: 'SQL', java: 'Java/JDBC', bash: 'Bash', doc: 'Doc',
}
export const difficultyLabel = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐']
