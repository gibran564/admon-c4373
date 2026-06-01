declare global {
  interface Window {
    initSqlJs: (config: { locateFile: (file: string) => string }) => Promise<any>
  }
}
'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

export interface QueryResult {
  columns: string[]
  rows: unknown[][]
  rowsAffected?: number
  executionTime?: number
}

export interface SQLError {
  message: string
  near?: string
}

export type QueryStatus = 'idle' | 'running' | 'success' | 'error'

const WASM_CDN = 'https://sql.js.org/dist/sql-wasm.js'

// Base en memoria del playground. Vive en SQLite para practicar rápido sin pedirle nada al backend.
export const SEED_SQL = `
PRAGMA foreign_keys = ON;

-- Esquema escolar_admin: tablas pequeñas, pero con suficientes relaciones para practicar JOINs y EXPLAIN.

CREATE TABLE IF NOT EXISTS alumnos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_control TEXT    NOT NULL UNIQUE,
  nombre         TEXT    NOT NULL,
  apellido_p     TEXT    NOT NULL,
  apellido_m     TEXT,
  semestre       INTEGER NOT NULL CHECK(semestre BETWEEN 1 AND 12),
  carrera        TEXT    NOT NULL DEFAULT 'ISC',
  activo         INTEGER NOT NULL DEFAULT 1,
  promedio       REAL    DEFAULT NULL,
  creado_en      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profesores (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre         TEXT NOT NULL,
  departamento   TEXT NOT NULL,
  email          TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS materias (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  clave          TEXT    NOT NULL UNIQUE,
  nombre         TEXT    NOT NULL,
  creditos       INTEGER NOT NULL CHECK(creditos > 0),
  semestre       INTEGER NOT NULL,
  profesor_id    INTEGER REFERENCES profesores(id)
);

CREATE TABLE IF NOT EXISTS inscripciones (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  alumno_id      INTEGER NOT NULL REFERENCES alumnos(id),
  materia_id     INTEGER NOT NULL REFERENCES materias(id),
  periodo        TEXT    NOT NULL,
  calificacion   REAL    CHECK(calificacion BETWEEN 0 AND 100),
  estado         TEXT    NOT NULL DEFAULT 'cursando' CHECK(estado IN ('cursando','aprobada','reprobada')),
  UNIQUE(alumno_id, materia_id, periodo)
);

CREATE TABLE IF NOT EXISTS bitacora_accesos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario        TEXT NOT NULL,
  operacion      TEXT NOT NULL CHECK(operacion IN ('LOGIN','LOGOUT','SELECT','INSERT','UPDATE','DELETE','DDL')),
  tabla_afectada TEXT,
  fecha_hora     TEXT NOT NULL DEFAULT (datetime('now')),
  exitoso        INTEGER NOT NULL DEFAULT 1
);

-- Profesores de ejemplo para cruzar materias con responsables.
INSERT INTO profesores (nombre, departamento, email) VALUES
  ('Dr. Ramírez Torres',   'Sistemas',       'ramirez@itd.edu.mx'),
  ('Ing. López Medina',    'Sistemas',       'lopez@itd.edu.mx'),
  ('Dra. González Ruiz',   'Matemáticas',    'gonzalez@itd.edu.mx'),
  ('M.C. Hernández Cruz',  'Sistemas',       'hernandez@itd.edu.mx'),
  ('Ing. Martínez Ríos',   'Industrial',     'martinez@itd.edu.mx');

-- Materias mezcladas del plan; SCB-1001 queda como ancla del curso.
INSERT INTO materias (clave, nombre, creditos, semestre, profesor_id) VALUES
  ('SCC-1010', 'Fundamentos de Programación',    5, 1, 2),
  ('SCC-1020', 'Cálculo Diferencial',            5, 1, 3),
  ('SCC-1030', 'Taller de Ética',                4, 1, 1),
  ('SCC-2010', 'Programación Orientada a Objetos', 5, 2, 2),
  ('SCC-2020', 'Cálculo Integral',               5, 2, 3),
  ('SCC-3010', 'Estructuras de Datos',           5, 3, 4),
  ('SCC-3020', 'Base de Datos',                  5, 3, 1),
  ('SCC-3030', 'Sistemas Operativos',            4, 3, 4),
  ('SCC-4010', 'Ingeniería de Software',         5, 4, 1),
  ('SCB-1001', 'Administración de Base de Datos', 5, 6, 1),
  ('SCC-5010', 'Redes de Computadoras',          5, 5, 4),
  ('SCC-6010', 'Tópicos Avanzados de BD',        4, 6, 1);

-- Cuarenta alumnos con semestres, carreras y promedios variados para que los filtros no sean de adorno.
INSERT INTO alumnos (numero_control, nombre, apellido_p, apellido_m, semestre, carrera, activo, promedio) VALUES
  ('21100001','Ana Laura',   'García',    'Pérez',    6,'ISC',1, 91.5),
  ('21100002','Carlos',      'Rodríguez', 'Mendoza',  6,'ISC',1, 78.2),
  ('21100003','María Fernanda','López',   'Torres',   6,'ISC',1, 88.0),
  ('21100004','José Luis',   'Martínez',  'Sánchez',  6,'ISC',1, 65.4),
  ('21100005','Sofía',       'Hernández', 'Vega',     6,'ISC',1, 92.1),
  ('21100006','Diego',       'González',  'Ramírez',  5,'ISC',1, 83.7),
  ('21100007','Valeria',     'Moreno',    'Castro',   5,'ISC',1, 71.3),
  ('21100008','Alejandro',   'Jiménez',   'Flores',   5,'ISC',1, 79.9),
  ('21100009','Isabella',    'Díaz',      'Ruiz',     5,'ISC',1, 86.5),
  ('21100010','Sebastián',   'Torres',    'Mendez',   5,'ISC',1, 94.2),
  ('22100011','Valentina',   'Ramírez',   'Ortega',   4,'ISC',1, 77.8),
  ('22100012','Mateo',       'Sánchez',   'Gutiérrez',4,'ISC',1, 69.1),
  ('22100013','Camila',      'Pérez',     'López',    4,'ISC',1, 88.3),
  ('22100014','Lucas',       'Vargas',    'Herrera',  4,'ISC',1, 73.6),
  ('22100015','Natalia',     'Castro',    'Medina',   4,'ISC',1, 82.4),
  ('22100016','Samuel',      'Flores',    'Jiménez',  3,'ISC',1, 90.7),
  ('22100017','Emma',        'Ortega',    'Gómez',    3,'ISC',1, 84.9),
  ('22100018','Daniel',      'Gutiérrez', 'Morales',  3,'ISC',1, 67.2),
  ('22100019','Luciana',     'Morales',   'Vargas',   3,'ISC',1, 91.0),
  ('22100020','Nicolás',     'Gómez',     'Fuentes',  3,'ISC',1, 76.5),
  ('23100021','Mariana',     'Herrera',   'Aguilar',  2,'ISC',1, 85.3),
  ('23100022','Rodrigo',     'Medina',    'Reyes',    2,'ISC',1, 72.8),
  ('23100023','Paula',       'Fuentes',   'Mendoza',  2,'ISC',1, 88.6),
  ('23100024','Tomás',       'Aguilar',   'Torres',   2,'ISC',1, 63.4),
  ('23100025','Sara',        'Reyes',     'Cruz',     2,'ISC',1, 93.7),
  ('23100026','Andrés',      'Cruz',      'Ramírez',  1,'ISC',1, 80.1),
  ('23100027','Gabriela',    'Mendoza',   'Soto',     1,'ISC',1, 74.6),
  ('23100028','Emilio',      'Soto',      'Vargas',   1,'ISC',1, 79.3),
  ('23100029','Renata',      'Vargas',    'Herrera',  1,'ISC',1, 87.2),
  ('23100030','Joaquín',     'Navarro',   'Domínguez',1,'ISC',1, 66.8),
  ('20100031','Patricia',    'Domínguez', 'Rojas',    6,'IIA',1, 81.5),
  ('20100032','Fernando',    'Rojas',     'Leal',     6,'IIA',1, 75.9),
  ('21200033','Adriana',     'Leal',      'Mora',     5,'IIA',1, 89.4),
  ('21200034','Roberto',     'Mora',      'Salas',    4,'IIA',1, 70.2),
  ('22200035','Lorena',      'Salas',     'Peña',     3,'IIA',1, 84.1),
  ('22200036','Miguel',      'Peña',      'Cabrera',  3,'IG',1,  78.7),
  ('23200037','Elena',       'Cabrera',   'Bravo',    2,'IG',1,  82.3),
  ('21100038','Javier',      'Bravo',     'Palma',    6,'ISC',0, 55.0),
  ('22100039','Daniela',     'Palma',     'Rivas',    4,'ISC',0, 48.3),
  ('23100040','Ricardo',     'Rivas',     'Solís',    1,'ISC',1, 71.9);

-- Inscripciones actuales e históricas; los NULL son intencionales para practicar casos reales.
INSERT INTO inscripciones (alumno_id, materia_id, periodo, calificacion, estado) VALUES
  (1,  10, '2026A', NULL,  'cursando'),
  (2,  10, '2026A', NULL,  'cursando'),
  (3,  10, '2026A', NULL,  'cursando'),
  (4,  10, '2026A', NULL,  'cursando'),
  (5,  10, '2026A', NULL,  'cursando'),
  -- Historial semestres anteriores
  (1,   7, '2024B', 95.0,  'aprobada'),
  (1,   6, '2024A', 90.0,  'aprobada'),
  (2,   7, '2024B', 72.5,  'aprobada'),
  (2,   6, '2024A', 68.0,  'aprobada'),
  (3,   7, '2024B', 88.0,  'aprobada'),
  (5,   7, '2024B', 97.0,  'aprobada'),
  (10,  7, '2024B', 99.0,  'aprobada'),
  (10, 10, '2026A', NULL,  'cursando'),
  (6,   9, '2025A', 85.0,  'aprobada'),
  (7,   9, '2025A', 73.0,  'aprobada'),
  (8,   9, '2025A', 80.0,  'aprobada'),
  (6,  11, '2025B', 79.0,  'aprobada'),
  (11,  8, '2025A', 74.0,  'aprobada'),
  (12,  8, '2025A', 61.0,  'aprobada'),
  (13,  8, '2025A', 91.0,  'aprobada'),
  (16,  6, '2024B', 95.0,  'aprobada'),
  (17,  6, '2024B', 88.0,  'aprobada'),
  (4,   9, '2025A', 59.0,  'reprobada'),
  (38,  7, '2024B', 45.0,  'reprobada');

-- Bitácora con accesos buenos y fallidos para misiones de auditoría.
INSERT INTO bitacora_accesos (usuario, operacion, tabla_afectada, fecha_hora, exitoso) VALUES
  ('app_captura', 'LOGIN',  NULL,               '2026-02-10 08:01:00', 1),
  ('app_captura', 'INSERT', 'inscripciones',    '2026-02-10 08:05:22', 1),
  ('app_captura', 'UPDATE', 'alumnos',          '2026-02-10 08:07:41', 1),
  ('app_reader',  'LOGIN',  NULL,               '2026-02-10 09:15:00', 1),
  ('app_reader',  'SELECT', 'alumnos',          '2026-02-10 09:15:30', 1),
  ('root',        'LOGIN',  NULL,               '2026-02-11 11:00:00', 1),
  ('root',        'DDL',    'alumnos',          '2026-02-11 11:02:00', 1),
  ('hacker_user', 'LOGIN',  NULL,               '2026-02-12 03:22:00', 0),
  ('hacker_user', 'LOGIN',  NULL,               '2026-02-12 03:22:01', 0),
  ('hacker_user', 'LOGIN',  NULL,               '2026-02-12 03:22:02', 0),
  ('app_captura', 'DELETE', 'inscripciones',    '2026-02-13 14:30:00', 0),
  ('app_captura', 'LOGIN',  NULL,               '2026-02-14 09:00:00', 1),
  ('app_reader',  'SELECT', 'inscripciones',    '2026-02-14 09:05:00', 1),
  ('root',        'DDL',    'bitacora_accesos', '2026-02-14 23:00:00', 1);

-- Índices de arranque para comparar planes sin crear todo desde cero.
CREATE INDEX idx_alumnos_carrera ON alumnos(carrera);
CREATE INDEX idx_alumnos_semestre ON alumnos(semestre);
`

export type DB = {
  exec: (sql: string) => Array<{ columns: string[]; values: unknown[][] }>
  run: (sql: string) => void
  getRowsModified: () => number
}

let sqlJsPromise: Promise<unknown> | null = null

function loadSqlJs(): Promise<unknown> {
  if (sqlJsPromise) return sqlJsPromise
  // Cargamos sql.js una sola vez; si cada editor lo pidiera de nuevo, el WASM haría speedrun a la pestaña lenta.
  sqlJsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.js'
    script.onload = () => {
      window.initSqlJs({
        locateFile: (f: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${f}`
      }).then(resolve).catch(reject)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
  return sqlJsPromise
}

export function useSQLite() {
  const dbRef    = useRef<DB | null>(null)
  const [ready,  setReady]  = useState(false)
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const SQL = await loadSqlJs() as { Database: new (data?: Uint8Array) => DB }
        if (cancelled) return
        const db = new SQL.Database()
        db.run(SEED_SQL)
        dbRef.current = db
        setReady(true)
      } catch (err) {
        if (!cancelled) setInitError(String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const runQuery = useCallback((sql: string): { results: QueryResult[]; error: SQLError | null } => {
    if (!dbRef.current) return { results: [], error: { message: 'Base de datos no inicializada' } }
    const trimmed = sql.trim()
    if (!trimmed) return { results: [], error: null }

    try {
      const t0      = performance.now()
      const rawResults = dbRef.current.exec(trimmed)
      const elapsed = Math.round(performance.now() - t0)

      const results: QueryResult[] = rawResults.map(r => ({
        columns: r.columns,
        rows: r.values,
        executionTime: elapsed,
      }))

      // DML/DDL no devuelve tabla. Fabricamos una respuesta para que la UI no parezca que ignoró al usuario.
      if (results.length === 0) {
        results.push({
          columns: ['resultado'],
          rows: [['✅ Consulta ejecutada correctamente']],
          rowsAffected: dbRef.current.getRowsModified(),
          executionTime: elapsed,
        })
      }

      return { results, error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return { results: [], error: { message: msg } }
    }
  }, [])

  const resetDB = useCallback(async () => {
    setReady(false)
    setLoading(true)
    try {
      const SQL = await loadSqlJs() as { Database: new (data?: Uint8Array) => DB }
      const db = new SQL.Database()
      db.run(SEED_SQL)
      dbRef.current = db
      setReady(true)
    } catch (err) {
      setInitError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  return { ready, loading, initError, runQuery, resetDB }
}
