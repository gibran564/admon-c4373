import type { QueryResult } from '@/lib/useSQLite'

export type MissionDifficulty = 1 | 2 | 3 | 4 | 5

export interface MissionHint  { text: string; xpCost: number }
export type MissionValidator  = (results: QueryResult[]) => { passed: boolean; feedback: string }

export interface SQLMission {
  id: number; slug: string; title: string; subtitle: string
  unitId: number; difficulty: MissionDifficulty; xpReward: number; estimatedTime: string
  context: string; objective: string; hints: MissionHint[]
  starterSQL: string; validator: MissionValidator; tags: string[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const hasColumn = (r: QueryResult, col: string) =>
  r.columns.some(c => c.toLowerCase() === col.toLowerCase())

const rowCount = (r: QueryResult) => r.rows.length

const cellValue = (r: QueryResult, row: number, col: string) => {
  const idx = r.columns.findIndex(c => c.toLowerCase() === col.toLowerCase())
  return idx === -1 ? undefined : r.rows[row]?.[idx]
}
const num = (r: QueryResult, row: number, col: string) => Number(cellValue(r, row, col))

// ─── MISSIONS ─────────────────────────────────────────────────────────────────
export const missions: SQLMission[] = [

  // ══ U1: EXPLORACIÓN ══════════════════════════════════════════════════════════
  {
    id:1, slug:'primer-select', title:'El primer SELECT', subtitle:'Conoce la base de datos',
    unitId:1, difficulty:1, xpReward:50, estimatedTime:'5 min',
    context:'🧭 El Explorador: "Antes de optimizar algo, primero necesitas entenderlo. Haz tu primera consulta."',
    objective:'Muestra **todos** los registros de la tabla `alumnos`. Necesitas ver al menos 35 filas.',
    starterSQL:'-- Escribe tu consulta aquí\nSELECT ',
    tags:['SELECT','FROM','básico'],
    hints:[
      { text:'Usa asterisco (*) para seleccionar todas las columnas', xpCost:0 },
      { text:'Sintaxis: SELECT * FROM nombre_tabla;', xpCost:5 },
    ],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Sin resultados. ¿Ejecutaste la consulta?'}
      if(r.rows.length<35) return {passed:false,feedback:`Solo ${r.rows.length} filas. ¿Filtraste algo?`}
      if(!hasColumn(r,'numero_control')) return {passed:false,feedback:'Usa SELECT * para todas las columnas'}
      return {passed:true,feedback:`✅ ¡Perfecto! ${r.rows.length} alumnos encontrados.`}
    },
  },

  {
    id:2, slug:'mapear-tablas', title:'Mapear el territorio', subtitle:'¿Qué tablas existen?',
    unitId:1, difficulty:1, xpReward:60, estimatedTime:'5 min',
    context:'🧭 El Explorador: "El DBA siempre empieza por conocer el territorio. ¿Cuántas tablas hay?"',
    objective:'Usa `sqlite_master` para listar los nombres de todas las tablas del esquema. Debe haber exactamente 5.',
    starterSQL:'-- En SQLite: sqlite_master  |  En MySQL: SHOW TABLES;\nSELECT ',
    tags:['sqlite_master','catálogo','metadatos'],
    hints:[
      { text:'sqlite_master tiene columnas: type, name, tbl_name, sql', xpCost:0 },
      { text:'Filtra WHERE type = \'table\'', xpCost:5 },
      { text:'SELECT name FROM sqlite_master WHERE type = \'table\'', xpCost:15 },
    ],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Sin resultados.'}
      const names=r.rows.map(row=>String(row[0]).toLowerCase())
      const required=['alumnos','materias','inscripciones','profesores','bitacora_accesos']
      const found=required.filter(t=>names.includes(t))
      if(found.length<5) return {passed:false,feedback:`${found.length}/5 tablas. ¿Filtraste por type='table'?`}
      return {passed:true,feedback:`✅ Mapeaste las ${found.length} tablas del esquema.`}
    },
  },

  {
    id:3, slug:'contar-registros', title:'El censo', subtitle:'Cuenta registros por tabla',
    unitId:1, difficulty:1, xpReward:70, estimatedTime:'8 min',
    context:'🧭 El Explorador: "Un DBA sabe exactamente cuántos registros tiene cada tabla. Haz el conteo."',
    objective:'Escribe una consulta que cuente los registros de la tabla `alumnos` usando `COUNT(*)`. El resultado debe ser un número >= 35.',
    starterSQL:'SELECT COUNT(*) ',
    tags:['COUNT','aggregate','básico'],
    hints:[
      { text:'COUNT(*) cuenta todas las filas incluyendo NULLs', xpCost:0 },
      { text:'SELECT COUNT(*) FROM tabla;', xpCost:5 },
    ],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Sin resultados.'}
      const count=Number(r.rows[0]?.[0])
      if(isNaN(count)) return {passed:false,feedback:'El resultado debe ser un número.'}
      if(count<35) return {passed:false,feedback:`Contaste ${count}. La tabla debe tener ≥35 alumnos.`}
      return {passed:true,feedback:`✅ Contaste ${count} registros correctamente.`}
    },
  },

  // ══ U2: ARQUITECTURA / FILTROS ════════════════════════════════════════════════
  {
    id:4, slug:'filtrar-where', title:'Filtrar con WHERE', subtitle:'Condiciones básicas',
    unitId:2, difficulty:2, xpReward:80, estimatedTime:'8 min',
    context:'⚙️ El Arquitecto: "No sirve de nada tener millones de filas si no sabes filtrarlas. Demuestra que dominas WHERE."',
    objective:'Muestra los alumnos del **semestre 6** de la carrera **ISC**, ordenados por `promedio` descendente.',
    starterSQL:'SELECT numero_control, nombre, apellido_p, semestre, promedio\nFROM alumnos\nWHERE ',
    tags:['WHERE','AND','ORDER BY'],
    hints:[
      { text:'Usa AND para combinar dos condiciones', xpCost:0 },
      { text:'ORDER BY promedio DESC al final', xpCost:5 },
    ],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Sin resultados.'}
      if(r.rows.length===0) return {passed:false,feedback:'Ningún resultado. Revisa las condiciones.'}
      const wrongSemester=r.rows.some(row=>{
        const semIdx=r.columns.findIndex(c=>c.toLowerCase()==='semestre')
        return semIdx>=0 && Number(row[semIdx])!==6
      })
      if(wrongSemester) return {passed:false,feedback:'Hay alumnos que no son de semestre 6.'}
      if(!hasColumn(r,'promedio')) return {passed:false,feedback:'Incluye la columna promedio.'}
      return {passed:true,feedback:`✅ ${r.rows.length} alumnos de sem-6 ISC encontrados.`}
    },
  },

  {
    id:5, slug:'join-materias', title:'El cruce de datos', subtitle:'JOIN básico',
    unitId:2, difficulty:2, xpReward:100, estimatedTime:'12 min',
    context:'⚙️ El Arquitecto: "El poder real de una BD relacional está en los JOINs. Cruza inscripciones con alumnos."',
    objective:'Muestra: nombre del alumno, número de control, nombre de la materia y calificación de **todas las inscripciones**. Necesitas al menos 20 filas.',
    starterSQL:'SELECT a.nombre, a.numero_control, m.nombre AS materia, i.calificacion\nFROM ',
    tags:['JOIN','relacional','múltiples tablas'],
    hints:[
      { text:'Necesitas 3 tablas: alumnos (a), inscripciones (i), materias (m)', xpCost:0 },
      { text:'inscripciones.alumno_id = alumnos.id   y   inscripciones.materia_id = materias.id', xpCost:5 },
      { text:'FROM inscripciones i JOIN alumnos a ON i.alumno_id=a.id JOIN materias m ON i.materia_id=m.id', xpCost:15 },
    ],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Sin resultados.'}
      if(r.rows.length<20) return {passed:false,feedback:`Solo ${r.rows.length} filas. ¿Completaste los JOINs?`}
      if(!hasColumn(r,'calificacion')) return {passed:false,feedback:'Incluye la columna calificacion.'}
      return {passed:true,feedback:`✅ JOIN exitoso: ${r.rows.length} inscripciones cruzadas.`}
    },
  },

  {
    id:6, slug:'grupo-semestre', title:'Resumen por semestre', subtitle:'GROUP BY básico',
    unitId:2, difficulty:2, xpReward:90, estimatedTime:'10 min',
    context:'⚙️ El Arquitecto: "El DBA produce reportes. GROUP BY es tu herramienta para agregar datos."',
    objective:'Cuenta cuántos alumnos hay en cada semestre. Muestra: semestre, total de alumnos, y promedio general del semestre. Ordena por semestre.',
    starterSQL:'SELECT semestre, COUNT(*) AS total_alumnos, \nFROM alumnos\n',
    tags:['GROUP BY','COUNT','AVG','agregaciones'],
    hints:[
      { text:'Usa AVG(promedio) para el promedio del semestre', xpCost:0 },
      { text:'GROUP BY semestre ORDER BY semestre', xpCost:5 },
    ],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Sin resultados.'}
      if(r.rows.length<3) return {passed:false,feedback:'Pocos grupos. ¿Tienes GROUP BY semestre?'}
      const hasAvg=r.columns.some(c=>c.toLowerCase().includes('avg')||c.toLowerCase().includes('promedio'))
      if(!hasAvg) return {passed:false,feedback:'Incluye el promedio del semestre con AVG().'}
      return {passed:true,feedback:`✅ Reporte por semestre: ${r.rows.length} grupos encontrados.`}
    },
  },

  {
    id:7, slug:'having-filtro', title:'Filtrar grupos', subtitle:'HAVING para agregaciones',
    unitId:2, difficulty:3, xpReward:110, estimatedTime:'12 min',
    context:'⚙️ El Arquitecto: "WHERE no puede filtrar resultados de GROUP BY. Para eso existe HAVING."',
    objective:'Muestra los **semestres** que tienen más de **5 alumnos activos** (activo=1). Incluye columnas: semestre, total.',
    starterSQL:'SELECT semestre, COUNT(*) AS total\nFROM alumnos\nWHERE activo = 1\n',
    tags:['HAVING','GROUP BY','filtros de grupos'],
    hints:[
      { text:'Primero GROUP BY semestre, luego filtra con HAVING', xpCost:0 },
      { text:'HAVING COUNT(*) > 5', xpCost:10 },
    ],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Sin resultados.'}
      const allOver5=r.rows.every(row=>{
        const idx=r.columns.findIndex(c=>c.toLowerCase()==='total')
        return idx>=0 && Number(row[idx])>5
      })
      if(!allOver5) return {passed:false,feedback:'Hay semestres con ≤5 alumnos. Revisa HAVING COUNT(*) > 5.'}
      return {passed:true,feedback:`✅ HAVING correcto: ${r.rows.length} semestres con más de 5 alumnos.`}
    },
  },

  // ══ U3: DDL/DML ═══════════════════════════════════════════════════════════════
  {
    id:8, slug:'crear-tabla', title:'Crea tu primera tabla', subtitle:'DDL: CREATE TABLE',
    unitId:3, difficulty:2, xpReward:120, estimatedTime:'15 min',
    context:'🗄️ El Tesorero: "El DBA diseña estructuras. Crea una tabla de pagos para los alumnos con las restricciones correctas."',
    objective:'Crea una tabla llamada `pagos` con columnas: `id` (PK autoincrement), `alumno_id` (INTEGER, NOT NULL), `concepto` (TEXT NOT NULL), `monto` (REAL CHECK > 0), `fecha` (TEXT NOT NULL). Luego haz SELECT sobre ella.',
    starterSQL:'-- Crea la tabla pagos\nCREATE TABLE IF NOT EXISTS pagos (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  ',
    tags:['CREATE TABLE','DDL','constraints','PK'],
    hints:[
      { text:'Usa CHECK(monto > 0) para validar el monto', xpCost:0 },
      { text:'Después del CREATE TABLE, ejecuta: SELECT name FROM sqlite_master WHERE name=\'pagos\'', xpCost:5 },
    ],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Sin resultados. Crea la tabla y luego haz un SELECT.'}
      const names=r.rows.map(row=>String(row[0]).toLowerCase())
      if(!names.includes('pagos')) {
        // maybe they returned a CREATE result - check if it ran
        return {passed:false,feedback:'La tabla "pagos" no aparece. Verifica la sintaxis del CREATE TABLE y haz SELECT sobre sqlite_master.'}
      }
      return {passed:true,feedback:'✅ Tabla "pagos" creada correctamente en el esquema.'}
    },
  },

  {
    id:9, slug:'insertar-datos', title:'Poblar la tabla', subtitle:'DML: INSERT INTO',
    unitId:3, difficulty:2, xpReward:110, estimatedTime:'12 min',
    context:'🗄️ El Tesorero: "Una tabla vacía no sirve de nada. Inserta al menos 3 pagos de alumnos reales."',
    objective:'Inserta **3 o más registros** en la tabla `pagos` usando IDs de alumnos existentes (alumno_id entre 1 y 5). Luego verifica con SELECT que los datos están ahí.',
    starterSQL:'-- Primero verifica que pagos existe:\n-- CREATE TABLE IF NOT EXISTS pagos (id INTEGER PRIMARY KEY AUTOINCREMENT, alumno_id INTEGER NOT NULL, concepto TEXT NOT NULL, monto REAL CHECK(monto>0), fecha TEXT NOT NULL);\n\nINSERT INTO pagos (alumno_id, concepto, monto, fecha) VALUES\n  (1, \'Inscripción semestral\', 2500.00, \'2026-02-01\'),\n  ',
    tags:['INSERT INTO','DML','datos','VALUES'],
    hints:[
      { text:'Puedes insertar múltiples filas con VALUES (a),(b),(c)', xpCost:0 },
      { text:'Después del INSERT, ejecuta: SELECT * FROM pagos;', xpCost:5 },
    ],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Ejecuta SELECT * FROM pagos al final.'}
      if(r.rows.length<3) return {passed:false,feedback:`Solo ${r.rows.length} registros. Inserta al menos 3.`}
      if(!hasColumn(r,'monto')) return {passed:false,feedback:'Verifica que la tabla pagos tiene la columna monto.'}
      return {passed:true,feedback:`✅ ${r.rows.length} pagos insertados correctamente.`}
    },
  },

  {
    id:10, slug:'actualizar-datos', title:'Actualizar registros', subtitle:'DML: UPDATE',
    unitId:3, difficulty:2, xpReward:100, estimatedTime:'10 min',
    context:'🗄️ El Tesorero: "Los datos cambian. Actualiza el promedio de un alumno específico y verifica el cambio."',
    objective:'Actualiza el `promedio` del alumno con `id=1` a exactamente **9.5**. Luego verifica con SELECT que el cambio se aplicó.',
    starterSQL:'-- Actualiza el promedio del alumno id=1\nUPDATE alumnos\nSET promedio = \nWHERE id = 1;\n\n-- Verifica el cambio:\nSELECT id, nombre, promedio FROM alumnos WHERE id = 1;',
    tags:['UPDATE','SET','WHERE','DML'],
    hints:[
      { text:'UPDATE tabla SET columna = valor WHERE condicion;', xpCost:0 },
      { text:'Asegúrate de incluir el WHERE o actualizarás todos los registros', xpCost:5 },
    ],
    validator:(results) => {
      const r=results[results.length-1]; if(!r) return {passed:false,feedback:'Sin resultados. Ejecuta SELECT al final.'}
      const promIdx=r.columns.findIndex(c=>c.toLowerCase()==='promedio')
      if(promIdx<0) return {passed:false,feedback:'Incluye columna promedio en el SELECT de verificación.'}
      const val=Number(r.rows[0]?.[promIdx])
      if(Math.abs(val-9.5)>0.01) return {passed:false,feedback:`El promedio es ${val}, debe ser 9.5.`}
      return {passed:true,feedback:'✅ Promedio actualizado correctamente a 9.5.'}
    },
  },

  {
    id:11, slug:'eliminar-datos', title:'Limpiar registros', subtitle:'DML: DELETE',
    unitId:3, difficulty:3, xpReward:120, estimatedTime:'12 min',
    context:'🗄️ El Tesorero: "El DBA también debe eliminar datos obsoletos. Pero siempre con cuidado — un DELETE sin WHERE es catastrófico."',
    objective:'Elimina de `bitacora_accesos` todos los registros donde `exitoso = 0` (intentos fallidos). Verifica con SELECT que solo quedan registros exitosos.',
    starterSQL:'-- CUIDADO: siempre usa WHERE en DELETE\nDELETE FROM bitacora_accesos\nWHERE exitoso = 0;\n\n-- Verifica:\nSELECT COUNT(*) AS restantes, MIN(exitoso) AS min_exitoso FROM bitacora_accesos;',
    tags:['DELETE','WHERE','DML','bitácora'],
    hints:[
      { text:'DELETE FROM tabla WHERE condicion — no olvides el WHERE', xpCost:0 },
      { text:'Verifica con SELECT COUNT(*) que no queden registros con exitoso=0', xpCost:5 },
    ],
    validator:(results) => {
      const r=results[results.length-1]; if(!r) return {passed:false,feedback:'Sin resultados.'}
      const minIdx=r.columns.findIndex(c=>c.toLowerCase().includes('min'))
      if(minIdx>=0) {
        const minVal=Number(r.rows[0]?.[minIdx])
        if(minVal===0) return {passed:false,feedback:'Aún hay registros con exitoso=0. El DELETE no se aplicó.'}
      }
      return {passed:true,feedback:'✅ Registros fallidos eliminados correctamente de la bitácora.'}
    },
  },

  // ══ U4: ÍNDICES Y OPTIMIZACIÓN ════════════════════════════════════════════════
  {
    id:12, slug:'subquery-avg', title:'Alumnos sobre el promedio', subtitle:'Subconsulta correlacionada',
    unitId:4, difficulty:3, xpReward:140, estimatedTime:'15 min',
    context:'🔧 El Mecánico: "Las subconsultas son el sello de un SQL avanzado. Encuentra alumnos que superan el promedio general."',
    objective:'Muestra nombre, número de control y promedio de los alumnos cuyo `promedio` es **mayor al promedio general** de todos los alumnos activos.',
    starterSQL:'SELECT numero_control, nombre, promedio\nFROM alumnos\nWHERE activo = 1\n  AND promedio > (\n    -- Subconsulta: calcula el promedio general\n    \n  )\nORDER BY promedio DESC;',
    tags:['subconsulta','AVG','WHERE subquery'],
    hints:[
      { text:'La subconsulta devuelve un escalar: SELECT AVG(promedio) FROM alumnos WHERE activo=1', xpCost:0 },
      { text:'AND promedio > (SELECT AVG(promedio) FROM alumnos WHERE activo=1)', xpCost:10 },
    ],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Sin resultados.'}
      if(r.rows.length===0) return {passed:false,feedback:'Ningún resultado. ¿Se ejecutó la subconsulta?'}
      if(r.rows.length>30) return {passed:false,feedback:'Demasiados resultados. La subconsulta no parece estar filtrando.'}
      if(!hasColumn(r,'promedio')) return {passed:false,feedback:'Incluye columna promedio.'}
      return {passed:true,feedback:`✅ Subconsulta correcta: ${r.rows.length} alumnos sobre el promedio general.`}
    },
  },

  {
    id:13, slug:'crear-indice', title:'Crear un índice', subtitle:'DDL: CREATE INDEX',
    unitId:4, difficulty:3, xpReward:150, estimatedTime:'15 min',
    context:'🔧 El Mecánico: "Un índice compuesto acelera las búsquedas frecuentes. Crea uno para las consultas de alumnos por carrera y semestre."',
    objective:'Crea un índice llamado `idx_carrera_semestre` sobre la tabla `alumnos`, indexando las columnas `carrera` y `semestre`. Luego verifica que aparece en sqlite_master.',
    starterSQL:'-- Crea el índice compuesto\nCREATE INDEX IF NOT EXISTS idx_carrera_semestre\n  ON alumnos (',
    tags:['CREATE INDEX','DDL','optimización','índice compuesto'],
    hints:[
      { text:'CREATE INDEX nombre ON tabla (col1, col2)', xpCost:0 },
      { text:'Después: SELECT name,tbl_name FROM sqlite_master WHERE type=\'index\'', xpCost:5 },
    ],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Sin resultados. Verifica con SELECT sobre sqlite_master.'}
      const names=r.rows.map(row=>String(row[0]).toLowerCase())
      if(!names.includes('idx_carrera_semestre')) return {passed:false,feedback:'El índice idx_carrera_semestre no aparece. ¿Se creó correctamente?'}
      return {passed:true,feedback:'✅ Índice idx_carrera_semestre creado y verificado.'}
    },
  },

  {
    id:14, slug:'explain-plan', title:'Analizar el plan de ejecución', subtitle:'EXPLAIN QUERY PLAN',
    unitId:4, difficulty:3, xpReward:160, estimatedTime:'18 min',
    context:'🔧 El Mecánico: "Antes de confiar en un índice, verifica que el motor lo usa. EXPLAIN revela el plan de ejecución."',
    objective:'Ejecuta `EXPLAIN QUERY PLAN` sobre la consulta: `SELECT * FROM alumnos WHERE carrera = \'ISC\' AND semestre = 6`. Verifica que el plan menciona el índice `idx_carrera_semestre`.',
    starterSQL:'-- Primero crea el índice si no existe:\nCREATE INDEX IF NOT EXISTS idx_carrera_semestre ON alumnos(carrera, semestre);\n\n-- Ahora analiza el plan:\nEXPLAIN QUERY PLAN\nSELECT * FROM alumnos WHERE carrera = \'ISC\' AND semestre = 6;',
    tags:['EXPLAIN','plan de ejecución','índices','optimización'],
    hints:[
      { text:'EXPLAIN QUERY PLAN muestra si usa "USING INDEX" o "SCAN"', xpCost:0 },
      { text:'Si dice SCAN TABLE, el índice no existe o no aplica', xpCost:5 },
    ],
    validator:(results) => {
      const r=results[results.length-1]; if(!r) return {passed:false,feedback:'Ejecuta EXPLAIN QUERY PLAN.'}
      const planText=r.rows.map(row=>String(row[row.length-1]).toLowerCase()).join(' ')
      if(planText.includes('scan table alumnos') && !planText.includes('index')) {
        return {passed:false,feedback:'El plan hace SCAN sin índice. ¿Creaste idx_carrera_semestre primero?'}
      }
      if(planText.includes('idx_carrera_semestre')||planText.includes('using index')) {
        return {passed:true,feedback:'✅ El plan usa el índice idx_carrera_semestre. Óptimo.'}
      }
      return {passed:true,feedback:'✅ Plan de ejecución analizado. Observa si usa SEARCH o SCAN.'}
    },
  },

  {
    id:15, slug:'cte-reporte', title:'CTE: Consultas legibles', subtitle:'WITH clause',
    unitId:4, difficulty:4, xpReward:170, estimatedTime:'20 min',
    context:'🔧 El Mecánico: "Los CTEs hacen el SQL más legible. Es el estándar en código de producción."',
    objective:'Usa un CTE para calcular primero el **promedio por semestre**, y luego en la consulta principal muestra solo los semestres cuyo promedio supera **8.5**.',
    starterSQL:'WITH promedios_semestre AS (\n  SELECT semestre, AVG(promedio) AS prom_semestre\n  FROM alumnos\n  WHERE activo = 1\n  GROUP BY semestre\n)\nSELECT semestre, ROUND(prom_semestre, 2) AS promedio\nFROM promedios_semestre\nWHERE prom_semestre > ;\nORDER BY prom_semestre DESC;',
    tags:['CTE','WITH','subconsulta nombrada','legibilidad'],
    hints:[
      { text:'El CTE se define con WITH nombre AS (SELECT ...) y se usa como tabla', xpCost:0 },
      { text:'HAVING vs WHERE en CTE: en la consulta externa usa WHERE prom_semestre > 8.5', xpCost:10 },
    ],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Sin resultados.'}
      if(r.rows.length===0) return {passed:false,feedback:'Sin filas. Verifica el umbral WHERE prom_semestre > 8.5.'}
      const allOver=r.rows.every(row=>{
        const idx=r.columns.findIndex(c=>c.toLowerCase().includes('prom'))
        return idx>=0 && Number(row[idx])>8.5
      })
      if(!allOver) return {passed:false,feedback:'Hay semestres con promedio ≤8.5. Revisa el WHERE en la consulta externa.'}
      return {passed:true,feedback:`✅ CTE correcto: ${r.rows.length} semestres con promedio > 8.5.`}
    },
  },

  // ══ U5: SEGURIDAD / TRANSACCIONES ════════════════════════════════════════════
  {
    id:16, slug:'vista-seguridad', title:'Vista de datos sensibles', subtitle:'CREATE VIEW para acceso limitado',
    unitId:5, difficulty:3, xpReward:150, estimatedTime:'15 min',
    context:'🛡️ El Guardián: "En seguridad, nunca expones la tabla directamente. Crea una vista que oculte el número de control."',
    objective:'Crea una vista llamada `v_alumnos_publico` que muestre solo: `nombre`, `apellido_p`, `semestre`, `carrera`, `promedio` — sin exponer `numero_control`. Luego consulta la vista.',
    starterSQL:'-- Crea la vista con columnas seguras\nCREATE VIEW IF NOT EXISTS v_alumnos_publico AS\nSELECT nombre, apellido_p, semestre, carrera, promedio\nFROM alumnos;\n\n-- Verifica la vista:\nSELECT * FROM v_alumnos_publico LIMIT 5;',
    tags:['CREATE VIEW','seguridad','acceso mínimo','encapsulamiento'],
    hints:[
      { text:'CREATE VIEW nombre AS SELECT ...; después haz SELECT * FROM nombre_vista', xpCost:0 },
    ],
    validator:(results) => {
      const r=results[results.length-1]; if(!r) return {passed:false,feedback:'Sin resultados.'}
      if(hasColumn(r,'numero_control')) return {passed:false,feedback:'La vista expone numero_control. Quítala de la definición.'}
      if(!hasColumn(r,'nombre')) return {passed:false,feedback:'La vista debe incluir columna nombre.'}
      if(r.rows.length===0) return {passed:false,feedback:'La vista está vacía. Verifica la consulta interna.'}
      return {passed:true,feedback:`✅ Vista v_alumnos_publico creada: oculta numero_control, expone ${r.columns.length} columnas seguras.`}
    },
  },

  {
    id:17, slug:'transaccion-rollback', title:'BEGIN → ROLLBACK', subtitle:'Control de transacciones',
    unitId:5, difficulty:4, xpReward:180, estimatedTime:'20 min',
    context:'🛡️ El Guardián: "Toda operación crítica va en una transacción. Si algo falla, el ROLLBACK deshace todo."',
    objective:'Demuestra el concepto: inicia una transacción, inserta un pago, verifica que existe, luego haz ROLLBACK y verifica que desapareció.',
    starterSQL:'-- Paso 1: crea tabla si no existe\nCREATE TABLE IF NOT EXISTS pagos (id INTEGER PRIMARY KEY AUTOINCREMENT, alumno_id INTEGER, concepto TEXT, monto REAL, fecha TEXT);\n\n-- Paso 2: Inicia transacción\nBEGIN TRANSACTION;\n  INSERT INTO pagos (alumno_id, concepto, monto, fecha) VALUES (1, \'Prueba ROLLBACK\', 100, \'2026-01-01\');\n-- Verifica que existe:\nSELECT COUNT(*) AS en_transaccion FROM pagos WHERE concepto=\'Prueba ROLLBACK\';\n\n-- Paso 3: deshaz\nROLLBACK;\n\n-- Verifica que desapareció:\nSELECT COUNT(*) AS tras_rollback FROM pagos WHERE concepto=\'Prueba ROLLBACK\';',
    tags:['BEGIN','ROLLBACK','transacciones','ACID'],
    hints:[
      { text:'BEGIN TRANSACTION; ... ROLLBACK; — el dato desaparece como si nunca hubiera existido', xpCost:0 },
    ],
    validator:(results) => {
      const last=results[results.length-1]; if(!last) return {passed:false,feedback:'Sin resultados.'}
      const count=Number(last.rows[0]?.[0])
      if(count>0) return {passed:false,feedback:`Tras el ROLLBACK aún hay ${count} registros. ¿Ejecutaste ROLLBACK?`}
      if(results.length<2) return {passed:false,feedback:'Ejecuta las consultas de verificación antes y después del ROLLBACK.'}
      return {passed:true,feedback:'✅ ROLLBACK correcto: el registro desapareció como si nunca existiera. Eso es ACID en acción.'}
    },
  },

  {
    id:18, slug:'transaccion-commit', title:'BEGIN → COMMIT', subtitle:'Persistir una transacción',
    unitId:5, difficulty:3, xpReward:150, estimatedTime:'15 min',
    context:'🛡️ El Guardián: "El COMMIT hace el cambio permanente. Entiende la diferencia con ROLLBACK."',
    objective:'Inicia una transacción, inserta 2 pagos, haz COMMIT y verifica que persisten con SELECT.',
    starterSQL:'CREATE TABLE IF NOT EXISTS pagos (id INTEGER PRIMARY KEY AUTOINCREMENT, alumno_id INTEGER, concepto TEXT, monto REAL, fecha TEXT);\n\nBEGIN TRANSACTION;\n  INSERT INTO pagos (alumno_id, concepto, monto, fecha) VALUES (1, \'Seminario\', 300, \'2026-02-15\');\n  INSERT INTO pagos (alumno_id, concepto, monto, fecha) VALUES (2, \'Material\', 150, \'2026-02-15\');\nCOMMIT;\n\nSELECT * FROM pagos;',
    tags:['COMMIT','transacciones','persistencia','ACID'],
    hints:[{ text:'BEGIN → operaciones → COMMIT: los datos quedan permanentes', xpCost:0 }],
    validator:(results) => {
      const r=results[results.length-1]; if(!r) return {passed:false,feedback:'Sin resultados.'}
      if(r.rows.length<2) return {passed:false,feedback:`Solo ${r.rows.length} registros. El COMMIT debe persistir 2 pagos.`}
      return {passed:true,feedback:`✅ COMMIT exitoso: ${r.rows.length} pagos persistidos correctamente.`}
    },
  },

  // ══ U6: MONITOREO / ANALYTICS ════════════════════════════════════════════════
  {
    id:19, slug:'window-ranking', title:'Ranking con Window Functions', subtitle:'ROW_NUMBER() OVER',
    unitId:6, difficulty:4, xpReward:190, estimatedTime:'20 min',
    context:'🔮 El Oráculo: "Los dashboards modernos usan window functions. Genera un ranking de alumnos por promedio dentro de cada semestre."',
    objective:'Muestra: nombre, semestre, promedio y `ranking` (1=mejor) dentro de cada semestre usando `ROW_NUMBER() OVER (PARTITION BY semestre ORDER BY promedio DESC)`. Solo alumnos activos.',
    starterSQL:'SELECT\n  nombre,\n  semestre,\n  promedio,\n  ROW_NUMBER() OVER (\n    PARTITION BY semestre\n    ORDER BY promedio DESC\n  ) AS ranking\nFROM alumnos\nWHERE activo = 1\nORDER BY semestre, ranking;',
    tags:['window function','ROW_NUMBER','PARTITION BY','analytics'],
    hints:[
      { text:'ROW_NUMBER() OVER (PARTITION BY col ORDER BY col DESC) numera dentro de cada grupo', xpCost:0 },
    ],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Sin resultados.'}
      if(!hasColumn(r,'ranking')) return {passed:false,feedback:'Incluye columna ranking usando ROW_NUMBER().'}
      const rank1Count=r.rows.filter(row=>{
        const idx=r.columns.findIndex(c=>c.toLowerCase()==='ranking')
        return idx>=0 && Number(row[idx])===1
      }).length
      if(rank1Count<3) return {passed:false,feedback:`Solo ${rank1Count} rankings con valor 1. ¿Configuraste PARTITION BY semestre?`}
      return {passed:true,feedback:`✅ Window function correcta: ${rank1Count} semestres con su alumno #1 rankeado.`}
    },
  },

  {
    id:20, slug:'dashboard-metricas', title:'Dashboard de métricas', subtitle:'Reporte ejecutivo completo',
    unitId:6, difficulty:4, xpReward:200, estimatedTime:'25 min',
    context:'🔮 El Oráculo: "El reporte ejecutivo consolida todo en una vista. Genera las métricas clave del sistema escolar."',
    objective:'Crea una consulta que muestre 4 métricas en una sola fila: `total_alumnos`, `alumnos_activos`, `promedio_general` (redondeado a 2 decimales), `total_inscripciones`.',
    starterSQL:'SELECT\n  COUNT(DISTINCT a.id)       AS total_alumnos,\n  SUM(CASE WHEN a.activo=1 THEN 1 ELSE 0 END) AS alumnos_activos,\n  ROUND(AVG(a.promedio), 2)  AS promedio_general,\n  COUNT(i.id)               AS total_inscripciones\nFROM alumnos a\nLEFT JOIN inscripciones i ON i.alumno_id = a.id;',
    tags:['CASE WHEN','COUNT DISTINCT','LEFT JOIN','dashboard'],
    hints:[
      { text:'SUM(CASE WHEN condicion THEN 1 ELSE 0 END) es el equivalente a COUNT IF', xpCost:0 },
    ],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Sin resultados.'}
      if(r.rows.length!==1) return {passed:false,feedback:'El dashboard debe devolver exactamente 1 fila con las métricas.'}
      const cols=['total_alumnos','alumnos_activos','promedio_general','total_inscripciones']
      const missing=cols.filter(c=>!hasColumn(r,c))
      if(missing.length>0) return {passed:false,feedback:`Faltan columnas: ${missing.join(', ')}.`}
      return {passed:true,feedback:`✅ Dashboard ejecutivo: ${r.columns.length} métricas en una sola consulta.`}
    },
  },

  {
    id:21, slug:'reporte-profesor', title:'Reporte de carga docente', subtitle:'JOIN triple + métricas',
    unitId:6, difficulty:4, xpReward:170, estimatedTime:'20 min',
    context:'🔮 El Oráculo: "El reporte final consolida múltiples tablas. Prueba máxima del DBA junior."',
    objective:'Muestra: nombre del profesor, materias que imparte, total de inscripciones en sus materias. LEFT JOIN para incluir profesores sin materias. Ordena por inscripciones DESC.',
    starterSQL:'-- LEFT JOIN: profesores → materias → inscripciones\nSELECT ',
    tags:['LEFT JOIN','triple JOIN','GROUP BY','reporte ejecutivo'],
    hints:[
      { text:'FROM profesores p LEFT JOIN materias m ON m.profesor_id = p.id', xpCost:0 },
      { text:'LEFT JOIN inscripciones i ON i.materia_id = m.id GROUP BY p.id', xpCost:5 },
      { text:'COUNT(DISTINCT m.id) AS materias, COUNT(i.id) AS inscripciones', xpCost:20 },
    ],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Sin resultados.'}
      if(r.rows.length<4) return {passed:false,feedback:`Solo ${r.rows.length} profesores. Usa LEFT JOIN para incluir a todos.`}
      const hasNames=r.rows.some(row=>String(row[0]).includes('Ramírez')||String(row[0]).includes('López'))
      if(!hasNames) return {passed:false,feedback:'Verifica que seleccionas el nombre del profesor.'}
      return {passed:true,feedback:`✅ Reporte de carga docente: ${r.rows.length} profesores analizados.`}
    },
  },

  {
    id:22, slug:'auditoria-indices', title:'Auditoría de índices', subtitle:'Catálogo del sistema',
    unitId:6, difficulty:4, xpReward:180, estimatedTime:'20 min',
    context:'🔮 El Oráculo: "En producción usarías information_schema. Aquí, sqlite_master revela qué tablas están optimizadas."',
    objective:'Lista todos los índices del esquema desde `sqlite_master`: nombre del índice, tabla y SQL de creación. Solo índices de usuario (no automáticos de SQLite). Debe haber ≥3.',
    starterSQL:'SELECT name, tbl_name, sql\nFROM sqlite_master\nWHERE type = \'index\'\n  AND name NOT LIKE \'sqlite_%\'\nORDER BY tbl_name, name;',
    tags:['sqlite_master','índices','auditoría','catálogo'],
    hints:[
      { text:'Los índices automáticos de SQLite se llaman sqlite_autoindex_*, exclúyelos', xpCost:0 },
    ],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Sin resultados.'}
      if(r.rows.length<1) return {passed:false,feedback:'No hay índices. ¿Creaste idx_carrera_semestre en la misión anterior?'}
      const hasTable=hasColumn(r,'tbl_name')||hasColumn(r,'tabla')
      if(!hasTable) return {passed:false,feedback:'Incluye tbl_name para saber a qué tabla pertenece el índice.'}
      return {passed:true,feedback:`✅ Auditoría: ${r.rows.length} índice(s) de usuario encontrados en el esquema.`}
    },
  },

  {
    id:23, slug:'pivot-calificaciones', title:'Pivote de calificaciones', subtitle:'CASE WHEN como columnas',
    unitId:6, difficulty:5, xpReward:220, estimatedTime:'25 min',
    context:'🔮 El Oráculo: "El reporte más avanzado: convertir filas en columnas. Este patrón es el pivote manual en SQL."',
    objective:'Cuenta cuántos alumnos obtuvieron: `aprobados` (calificacion >= 6), `reprobados` (calificacion < 6) y `sin_calificar` (calificacion IS NULL), en una sola fila.',
    starterSQL:'SELECT\n  SUM(CASE WHEN i.calificacion >= 6 THEN 1 ELSE 0 END) AS aprobados,\n  SUM(CASE WHEN i.calificacion < 6  THEN 1 ELSE 0 END) AS reprobados,\n  SUM(CASE WHEN i.calificacion IS NULL THEN 1 ELSE 0 END) AS sin_calificar\nFROM inscripciones i;',
    tags:['CASE WHEN','pivot','SUM condicional','analytics'],
    hints:[{ text:'SUM(CASE WHEN ... THEN 1 ELSE 0 END) actúa como COUNT IF', xpCost:0 }],
    validator:(results) => {
      const r=results[0]; if(!r) return {passed:false,feedback:'Sin resultados.'}
      if(r.rows.length!==1) return {passed:false,feedback:'Debe ser exactamente 1 fila con 3 columnas.'}
      const cols=['aprobados','reprobados','sin_calificar']
      const missing=cols.filter(c=>!hasColumn(r,c))
      if(missing.length>0) return {passed:false,feedback:`Faltan columnas: ${missing.join(', ')}.`}
      const total=cols.reduce((s,c)=>{
        const idx=r.columns.findIndex(col=>col.toLowerCase()===c)
        return s+Number(r.rows[0]?.[idx]||0)
      },0)
      return {passed:true,feedback:`✅ Pivote correcto: ${total} inscripciones clasificadas en aprobados/reprobados/sin_calificar.`}
    },
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getMissionById(id: number): SQLMission | undefined {
  return missions.find(m => m.id === id)
}
export function getMissionsByUnit(unitId: number): SQLMission[] {
  return missions.filter(m => m.unitId === unitId)
}
export const missionUnitColors: Record<number,string> = {
  1:'#22c55e', 2:'#3b82f6', 3:'#f59e0b', 4:'#8b5cf6', 5:'#ef4444', 6:'#06b6d4',
}
