// Seed SQL executed when the in-browser DB initializes
export const SEED_SQL = `
-- ============================================================
-- SCB-1001 Playground Database — escolar_admin
-- SQLite (compatible con la sintaxis MySQL del curso)
-- ============================================================

PRAGMA journal_mode=WAL;

-- ─── SCHEMA ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS carreras (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  clave   TEXT NOT NULL UNIQUE,
  nombre  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS alumnos (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_control  TEXT NOT NULL UNIQUE,
  nombre          TEXT NOT NULL,
  apellido_p      TEXT NOT NULL,
  apellido_m      TEXT,
  semestre        INTEGER NOT NULL CHECK(semestre BETWEEN 1 AND 12),
  carrera         TEXT NOT NULL DEFAULT 'ISC',
  activo          INTEGER NOT NULL DEFAULT 1,
  creado_en       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS materias (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  clave    TEXT NOT NULL UNIQUE,
  nombre   TEXT NOT NULL,
  creditos INTEGER NOT NULL CHECK(creditos > 0),
  semestre INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS inscripciones (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  alumno_id    INTEGER NOT NULL REFERENCES alumnos(id),
  materia_id   INTEGER NOT NULL REFERENCES materias(id),
  periodo      TEXT NOT NULL,
  calificacion REAL CHECK(calificacion BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS docentes (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre  TEXT NOT NULL,
  email   TEXT NOT NULL UNIQUE,
  depto   TEXT NOT NULL DEFAULT 'Sistemas Computacionales'
);

CREATE TABLE IF NOT EXISTS bitacora_accesos (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario   TEXT NOT NULL,
  operacion TEXT NOT NULL CHECK(operacion IN ('LOGIN','LOGOUT','INSERT','UPDATE','DELETE','SELECT')),
  tabla     TEXT,
  fecha_hora TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS usuarios_bd (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario   TEXT NOT NULL UNIQUE,
  rol       TEXT NOT NULL CHECK(rol IN ('dba','captura','consulta','auditor')),
  activo    INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── INDICES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_alumnos_carrera ON alumnos(carrera);
CREATE INDEX IF NOT EXISTS idx_alumnos_semestre ON alumnos(semestre);
CREATE INDEX IF NOT EXISTS idx_alumnos_carrera_semestre ON alumnos(carrera, semestre);
CREATE INDEX IF NOT EXISTS idx_inscripciones_alumno ON inscripciones(alumno_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_periodo ON inscripciones(periodo);
CREATE INDEX IF NOT EXISTS idx_bitacora_fecha ON bitacora_accesos(fecha_hora);

-- ─── CARRERAS ────────────────────────────────────────────────
INSERT OR IGNORE INTO carreras (clave, nombre) VALUES
  ('ISC','Ingeniería en Sistemas Computacionales'),
  ('IIA','Ingeniería en Inteligencia Artificial'),
  ('IC','Ingeniería Civil'),
  ('IM','Ingeniería Mecatrónica'),
  ('LA','Licenciatura en Administración');

-- ─── DOCENTES ────────────────────────────────────────────────
INSERT OR IGNORE INTO docentes (nombre, email, depto) VALUES
  ('Dr. Raúl Morales Ibarra','rmorales@itd.edu.mx','Sistemas Computacionales'),
  ('M.C. Sandra Torres Vega','storres@itd.edu.mx','Sistemas Computacionales'),
  ('Ing. Felipe Ortega Ruiz','fortega@itd.edu.mx','Matemáticas'),
  ('Dra. Carmen Soto Luna','csoto@itd.edu.mx','Ciencias Básicas');

-- ─── MATERIAS ────────────────────────────────────────────────
INSERT OR IGNORE INTO materias (clave, nombre, creditos, semestre) VALUES
  ('SCA-1011','Fundamentos de Programación',5,1),
  ('SCB-1001','Administración de Base de Datos',5,5),
  ('SCB-1002','Programación Web',5,5),
  ('SCB-1003','Inteligencia Artificial',5,6),
  ('SCB-1004','Redes de Computadoras',5,4),
  ('SCB-1005','Sistemas Operativos',5,3),
  ('SCB-1006','Ingeniería de Software',5,6),
  ('SCB-1007','Tópicos de Programación',5,7),
  ('SCB-1008','Programación Móvil',5,7),
  ('SCA-1012','Álgebra Lineal',5,2);

-- ─── ALUMNOS ─────────────────────────────────────────────────
INSERT OR IGNORE INTO alumnos (numero_control, nombre, apellido_p, apellido_m, semestre, carrera, activo, creado_en) VALUES
  ('21100001','Sofía','Hernández','García',5,'ISC',1,'2021-08-23'),
  ('21100002','Diego','Martínez','López',5,'ISC',1,'2021-08-23'),
  ('21100003','Valentina','Rodríguez','Pérez',5,'ISC',1,'2021-08-23'),
  ('21100004','Santiago','González','Ruiz',5,'ISC',1,'2021-08-23'),
  ('21100005','Camila','López','Torres',5,'IIA',1,'2021-08-23'),
  ('21100006','Mateo','García','Ramírez',5,'IIA',1,'2021-08-23'),
  ('21100007','Isabella','Torres','Flores',5,'ISC',1,'2021-08-23'),
  ('21100008','Sebastián','Ramírez','Cruz',5,'ISC',1,'2021-08-23'),
  ('21100009','Valeria','Cruz','Morales',5,'IIA',1,'2021-08-23'),
  ('21100010','Emiliano','Flores','Vega',5,'ISC',1,'2021-08-23'),
  ('21200011','Ana','Vega','Ortega',3,'ISC',1,'2022-08-22'),
  ('21200012','Carlos','Ortega','Mendoza',3,'ISC',1,'2022-08-22'),
  ('21200013','Lucia','Mendoza','Castro',3,'IIA',1,'2022-08-22'),
  ('21200014','Miguel','Castro','Reyes',3,'IC',1,'2022-08-22'),
  ('21200015','Fernanda','Reyes','Jiménez',3,'IM',1,'2022-08-22'),
  ('22300016','José','Jiménez','Díaz',1,'ISC',1,'2023-08-21'),
  ('22300017','María','Díaz','Moreno',1,'ISC',1,'2023-08-21'),
  ('22300018','Roberto','Moreno','Álvarez',1,'IIA',1,'2023-08-21'),
  ('22300019','Patricia','Álvarez','Romero',1,'LA',0,'2023-08-21'),
  ('22300020','Eduardo','Romero','Soto',1,'ISC',1,'2023-08-21'),
  ('20100021','Laura','Soto','Vargas',7,'ISC',1,'2020-08-24'),
  ('20100022','Andrés','Vargas','Guerrero',7,'ISC',1,'2020-08-24'),
  ('20100023','Elena','Guerrero','Medina',7,'IIA',1,'2020-08-24'),
  ('20100024','Tomás','Medina','Aguilar',7,'ISC',0,'2020-08-24'),
  ('20100025','Adriana','Aguilar','Silva',7,'ISC',1,'2020-08-24');

-- ─── INSCRIPCIONES ───────────────────────────────────────────
INSERT OR IGNORE INTO inscripciones (alumno_id, materia_id, periodo, calificacion) VALUES
  (1,2,'2026A',87),(1,3,'2026A',92),(1,4,'2026A',78),
  (2,2,'2026A',NULL),(2,3,'2026A',88),(2,4,'2026A',95),
  (3,2,'2026A',73),(3,3,'2026A',68),(3,4,'2026A',82),
  (4,2,'2026A',91),(4,3,'2026A',76),(4,4,'2026A',84),
  (5,2,'2026A',65),(5,5,'2026A',89),(5,6,'2026A',77),
  (6,2,'2026A',88),(6,3,'2026A',94),(6,4,'2026A',71),
  (7,2,'2026A',79),(7,3,'2026A',85),(7,4,'2026A',90),
  (8,2,'2026A',62),(8,3,'2026A',NULL),(8,4,'2026A',88),
  (9,5,'2026A',93),(9,6,'2026A',81),(9,7,'2026A',76),
  (10,2,'2026A',84),(10,3,'2026A',71),(10,4,'2026A',88),
  -- semestre anterior
  (1,5,'2025B',90),(2,5,'2025B',85),(3,5,'2025B',72),
  (4,6,'2025B',88),(5,6,'2025B',77),(6,7,'2025B',91),
  (7,8,'2025B',68),(8,9,'2025B',95),(9,8,'2025B',83),
  (10,9,'2025B',78),(11,1,'2025B',84),(12,1,'2025B',77),
  (21,7,'2026A',88),(22,7,'2026A',92),(23,8,'2026A',76),
  (24,7,'2026A',NULL),(25,8,'2026A',89);

-- ─── USUARIOS BD ────────────────────────────────────────────
INSERT OR IGNORE INTO usuarios_bd (usuario, rol, activo) VALUES
  ('app_captura','captura',1),
  ('app_reader','consulta',1),
  ('svc_reportes','consulta',1),
  ('admin_dba','dba',1),
  ('svc_backup','auditor',1),
  ('old_user','consulta',0);

-- ─── BITACORA ────────────────────────────────────────────────
INSERT OR IGNORE INTO bitacora_accesos (usuario, operacion, tabla, fecha_hora) VALUES
  ('app_captura','LOGIN',NULL,'2026-03-10 08:01:12'),
  ('app_captura','INSERT','alumnos','2026-03-10 08:05:33'),
  ('app_captura','UPDATE','inscripciones','2026-03-10 08:07:45'),
  ('app_reader','LOGIN',NULL,'2026-03-10 09:15:02'),
  ('app_reader','SELECT','alumnos','2026-03-10 09:16:18'),
  ('app_reader','SELECT','inscripciones','2026-03-10 09:17:44'),
  ('admin_dba','LOGIN',NULL,'2026-03-10 10:00:00'),
  ('admin_dba','DELETE','bitacora_accesos','2026-03-10 10:05:11'),
  ('app_captura','LOGOUT',NULL,'2026-03-10 11:30:55'),
  ('app_reader','SELECT','materias','2026-03-10 11:45:22'),
  ('svc_reportes','SELECT','inscripciones','2026-03-10 12:01:09'),
  ('svc_reportes','SELECT','alumnos','2026-03-10 12:01:10'),
  ('admin_dba','UPDATE','alumnos','2026-03-10 14:22:18'),
  ('app_captura','LOGIN',NULL,'2026-03-10 15:00:00'),
  ('app_captura','INSERT','inscripciones','2026-03-10 15:03:44');
`

// Snippet library organized by unit
export const SNIPPETS: {
  unit: number
  label: string
  title: string
  sql: string
}[] = [
  // INTRO
  { unit: 0, label: 'Ver tablas', title: 'Listar todas las tablas', sql: `-- Ver todas las tablas disponibles en la BD
SELECT name AS tabla
FROM sqlite_master
WHERE type = 'table'
ORDER BY name;` },
  { unit: 0, label: 'Ver índices', title: 'Listar índices existentes', sql: `-- Ver todos los índices de la BD
SELECT name AS indice, tbl_name AS tabla
FROM sqlite_master
WHERE type = 'index'
ORDER BY tbl_name, name;` },
  { unit: 0, label: 'Contar filas', title: 'Conteo por tabla', sql: `-- Cuántos registros tiene cada tabla
SELECT 'alumnos'       AS tabla, COUNT(*) AS total FROM alumnos       UNION ALL
SELECT 'inscripciones' AS tabla, COUNT(*) AS total FROM inscripciones  UNION ALL
SELECT 'materias'      AS tabla, COUNT(*) AS total FROM materias       UNION ALL
SELECT 'bitacora_accesos' AS tabla, COUNT(*) AS total FROM bitacora_accesos UNION ALL
SELECT 'usuarios_bd'   AS tabla, COUNT(*) AS total FROM usuarios_bd;` },

  // U2 — ARQUITECTURA
  { unit: 2, label: 'Buffer pool', title: 'U2 — Simular: parámetros de memoria', sql: `-- En MySQL real ejecutarías:
-- SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
-- Aquí simulamos la idea con metadatos de SQLite:
SELECT 'innodb_buffer_pool_size' AS variable, '256M' AS valor UNION ALL
SELECT 'max_connections',  '151' UNION ALL
SELECT 'sort_buffer_size', '262144' UNION ALL
SELECT 'tmp_table_size',   '16M';` },
  { unit: 2, label: 'Archivos SGBD', title: 'U2 — Simular: archivos de la BD', sql: `-- En MySQL real verías los .ibd con:
-- SHOW VARIABLES LIKE 'datadir';
-- SELECT name FROM information_schema.INNODB_TABLESPACES;
-- Aquí puedes ver el "master" de tablas de SQLite:
SELECT tbl_name AS tabla, sql AS ddl_original
FROM sqlite_master WHERE type='table';` },

  // U3 — ESPACIO EN DISCO
  { unit: 3, label: 'Tablespaces', title: 'U3 — Tamaño aproximado por tabla', sql: `-- Estimación de tamaño por tabla
-- (En MySQL: SELECT * FROM information_schema.TABLES WHERE TABLE_SCHEMA='escolar_admin')
SELECT
  name AS tabla,
  (SELECT COUNT(*) FROM sqlite_master s2 WHERE s2.tbl_name=name AND type='index') AS num_indices
FROM sqlite_master WHERE type='table' ORDER BY name;` },
  { unit: 3, label: 'Roles/privs', title: 'U3 — Modelo de roles', sql: `-- Ver el modelo de roles y accesos definido
SELECT
  u.usuario,
  u.rol,
  CASE u.rol
    WHEN 'dba'      THEN 'ALL PRIVILEGES'
    WHEN 'captura'  THEN 'SELECT, INSERT, UPDATE'
    WHEN 'consulta' THEN 'SELECT'
    WHEN 'auditor'  THEN 'SELECT (+ performance_schema)'
  END AS privilegios,
  CASE u.activo WHEN 1 THEN '✓ Activo' ELSE '✗ Inactivo' END AS estado
FROM usuarios_bd u
ORDER BY u.rol, u.usuario;` },
  { unit: 3, label: 'Partición RANGE', title: 'U3 — Simular particionamiento por año', sql: `-- Datos de bitácora distribuidos por año (simula PARTITION BY RANGE)
SELECT
  strftime('%Y', fecha_hora) AS anio,
  COUNT(*) AS registros,
  GROUP_CONCAT(DISTINCT operacion) AS operaciones
FROM bitacora_accesos
GROUP BY strftime('%Y', fecha_hora)
ORDER BY anio;` },

  // U4 — OPERACIÓN
  { unit: 4, label: 'EXPLAIN plan', title: 'U4 — Plan de ejecución', sql: `-- Ver el plan de ejecución de una query
EXPLAIN QUERY PLAN
SELECT a.nombre, a.apellido_p, i.calificacion
FROM alumnos a
JOIN inscripciones i ON i.alumno_id = a.id
WHERE a.carrera = 'ISC'
ORDER BY i.calificacion DESC;` },
  { unit: 4, label: 'Sin índice', title: 'U4 — Query sin índice (full scan)', sql: `-- Esta query no tiene índice óptimo (busca por apellido)
EXPLAIN QUERY PLAN
SELECT * FROM alumnos WHERE apellido_p = 'García';
-- Compara: el plan dirá 'SCAN alumnos' = full scan
-- Crea el índice y vuelve a correr:
-- CREATE INDEX idx_apellido ON alumnos(apellido_p);` },
  { unit: 4, label: 'Slow queries', title: 'U4 — Simular análisis de slow log', sql: `-- Simula lo que ves en el slow_query_log de MySQL
-- queries por usuario, operación y frecuencia:
SELECT
  usuario,
  operacion,
  COUNT(*) AS frecuencia,
  MIN(fecha_hora) AS primera_vez,
  MAX(fecha_hora) AS ultima_vez
FROM bitacora_accesos
GROUP BY usuario, operacion
ORDER BY frecuencia DESC;` },
  { unit: 4, label: 'Mantenimiento', title: 'U4 — ANALYZE TABLE (SQLite ANALYZE)', sql: `-- SQLite también tiene ANALYZE (equivale a ANALYZE TABLE de MySQL)
ANALYZE;
-- Después podemos verificar las estadísticas de índices:
SELECT * FROM sqlite_stat1 LIMIT 20;` },

  // U5 — SEGURIDAD
  { unit: 5, label: 'Auditoría', title: 'U5/U6 — Auditoría de accesos', sql: `-- Actividad reciente por usuario (simula el Audit Log de MySQL)
SELECT
  usuario,
  operacion,
  COALESCE(tabla, '—') AS tabla_afectada,
  fecha_hora
FROM bitacora_accesos
ORDER BY fecha_hora DESC
LIMIT 15;` },
  { unit: 5, label: 'Privilegios', title: 'U5 — Auditoría de privilegios', sql: `-- Detectar usuarios con roles excesivos o inactivos
SELECT
  usuario,
  rol,
  CASE
    WHEN activo = 0 THEN '⚠️  Inactivo — revisar si eliminar'
    WHEN rol = 'dba' THEN '🔴 Máximo privilegio — auditar'
    ELSE '✅ OK'
  END AS evaluacion
FROM usuarios_bd
ORDER BY rol DESC, activo;` },
  { unit: 5, label: 'Replicación', title: 'U5 — Simular estado de replicación', sql: `-- En MySQL real ejecutarías: SHOW REPLICA STATUS\\G
-- Aquí simulamos el concepto:
SELECT
  'replica_user@10.0.0.20' AS replica_host,
  'YES' AS IO_Running,
  'YES' AS SQL_Running,
  0 AS seconds_behind_source,
  'OK' AS estado;` },

  // U6 — MONITOREO
  { unit: 6, label: 'Hit ratio', title: 'U6 — Hit ratio del buffer pool', sql: `-- En MySQL real:
-- SELECT (1 - reads/read_requests) * 100 AS hit_ratio FROM global_status
-- Simulamos el concepto con nuestros datos:
SELECT
  COUNT(*) AS total_alumnos,
  SUM(activo) AS alumnos_activos,
  ROUND(SUM(activo)*100.0/COUNT(*),1) AS pct_activos
FROM alumnos;
-- Analogía: pct_activos ≈ "hit rate" (datos útiles vs totales)` },
  { unit: 6, label: 'Top queries', title: 'U6 — Top operaciones en bitácora', sql: `-- Equivale a consultar performance_schema en MySQL
SELECT
  operacion,
  COUNT(*) AS total_ejecuciones,
  COUNT(DISTINCT usuario) AS usuarios_distintos,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM bitacora_accesos), 1) AS pct
FROM bitacora_accesos
GROUP BY operacion
ORDER BY total_ejecuciones DESC;` },
  { unit: 6, label: 'Full scans', title: 'U6 — Detectar full scans', sql: `-- Tablas que un query escanea completo (sin índice)
EXPLAIN QUERY PLAN
SELECT a.nombre, a.apellido_p,
       COUNT(i.id) AS materias_inscritas,
       AVG(i.calificacion) AS promedio
FROM alumnos a
LEFT JOIN inscripciones i ON i.alumno_id = a.id
WHERE a.apellido_m LIKE '%ez'   -- ← LIKE con comodín inicial
GROUP BY a.id
ORDER BY promedio DESC;` },

  // AVANZADOS
  { unit: 99, label: 'Reporte final', title: 'Reporte completo de inscripciones', sql: `-- Reporte completo: alumnos con materias y calificaciones
SELECT
  a.numero_control,
  a.nombre || ' ' || a.apellido_p AS alumno,
  a.carrera,
  a.semestre,
  m.clave,
  m.nombre AS materia,
  i.periodo,
  COALESCE(CAST(i.calificacion AS TEXT), 'Sin calificar') AS calificacion,
  CASE
    WHEN i.calificacion IS NULL THEN '⏳ Pendiente'
    WHEN i.calificacion >= 70   THEN '✅ Acreditada'
    ELSE '❌ Reprobada'
  END AS estado
FROM alumnos a
JOIN inscripciones i ON i.alumno_id = a.id
JOIN materias m ON m.id = i.materia_id
WHERE a.activo = 1
ORDER BY a.carrera, a.semestre, a.apellido_p, m.semestre;` },
  { unit: 99, label: 'Promedios', title: 'Ranking de promedios por carrera', sql: `-- Ranking de alumnos por promedio dentro de su carrera
SELECT
  a.carrera,
  a.nombre || ' ' || a.apellido_p AS alumno,
  a.semestre,
  ROUND(AVG(i.calificacion), 2) AS promedio,
  COUNT(i.id) AS materias,
  RANK() OVER (PARTITION BY a.carrera ORDER BY AVG(i.calificacion) DESC) AS ranking
FROM alumnos a
JOIN inscripciones i ON i.alumno_id = a.id
WHERE i.calificacion IS NOT NULL AND a.activo = 1
GROUP BY a.id
ORDER BY a.carrera, ranking;` },
  { unit: 99, label: 'Insertar', title: 'INSERT — Agregar un alumno', sql: `-- Insertar un nuevo alumno
INSERT INTO alumnos (numero_control, nombre, apellido_p, apellido_m, semestre, carrera)
VALUES ('24400099', 'Tu Nombre', 'Tu Apellido', 'Paterno', 1, 'ISC');

-- Verificar que se insertó
SELECT * FROM alumnos WHERE numero_control = '24400099';` },
  { unit: 99, label: 'UPDATE', title: 'UPDATE — Registrar calificación', sql: `-- Registrar una calificación a una inscripción sin calificar
UPDATE inscripciones
SET calificacion = 88.5
WHERE alumno_id = 2 AND materia_id = 2 AND periodo = '2026A';

-- Verificar el cambio
SELECT a.nombre, m.nombre AS materia, i.calificacion
FROM inscripciones i
JOIN alumnos a ON a.id = i.alumno_id
JOIN materias m ON m.id = i.materia_id
WHERE i.alumno_id = 2 AND i.periodo = '2026A';` },
  { unit: 99, label: 'Subconsulta', title: 'Subconsulta correlacionada', sql: `-- Alumnos con calificación por encima del promedio de su carrera
SELECT
  a.numero_control,
  a.nombre || ' ' || a.apellido_p AS alumno,
  a.carrera,
  ROUND(AVG(i.calificacion),2) AS mi_promedio,
  (SELECT ROUND(AVG(i2.calificacion),2)
   FROM inscripciones i2
   JOIN alumnos a2 ON a2.id = i2.alumno_id
   WHERE a2.carrera = a.carrera
     AND i2.calificacion IS NOT NULL
  ) AS promedio_carrera
FROM alumnos a
JOIN inscripciones i ON i.alumno_id = a.id
WHERE i.calificacion IS NOT NULL AND a.activo = 1
GROUP BY a.id
HAVING mi_promedio > promedio_carrera
ORDER BY mi_promedio DESC;` },
]

export const SCHEMA_INFO = {
  alumnos: {
    cols: ['id','numero_control','nombre','apellido_p','apellido_m','semestre','carrera','activo','creado_en'],
    desc: 'Estudiantes registrados en el sistema escolar',
  },
  materias: {
    cols: ['id','clave','nombre','creditos','semestre'],
    desc: 'Materias del plan de estudios',
  },
  inscripciones: {
    cols: ['id','alumno_id','materia_id','periodo','calificacion'],
    desc: 'Inscripciones de alumnos a materias por período',
  },
  docentes: {
    cols: ['id','nombre','email','depto'],
    desc: 'Planta docente del instituto',
  },
  bitacora_accesos: {
    cols: ['id','usuario','operacion','tabla','fecha_hora'],
    desc: 'Registro de operaciones DBA (simula el Audit Log de MySQL)',
  },
  usuarios_bd: {
    cols: ['id','usuario','rol','activo','creado_en'],
    desc: 'Usuarios y roles de la base de datos',
  },
  carreras: {
    cols: ['id','clave','nombre'],
    desc: 'Catálogo de carreras del instituto',
  },
}