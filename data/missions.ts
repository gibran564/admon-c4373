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
  // ══════════════════════════════════════════════════════════════════════════════
  // 🐛 MISIONES DEBUG — Encuentra y corrige el error lógico
  // IDs 24–31 · Las queries corren sin errores pero devuelven resultados INCORRECTOS
  // ══════════════════════════════════════════════════════════════════════════════

  // ── U2: El JOIN trampa ────────────────────────────────────────────────────────
  {
    id: 24,
    slug: 'debug-join-trampa',
    title: 'El JOIN trampa',
    subtitle: 'Debug: condición de JOIN equivocada',
    unitId: 2,
    difficulty: 3,
    xpReward: 130,
    estimatedTime: '12 min',
    context: '⚙️ El Arquitecto: "Este reporte lo escribió un becario. Corre sin errores y devuelve filas… pero los números están completamente inflados. Encuentra el bug antes de que llegue al director."',
    objective: `La siguiente query **corre sin errores** pero produce resultados incorrectos.

\`\`\`sql
SELECT a.nombre, COUNT(*) AS total_materias
FROM alumnos a
JOIN inscripciones i ON i.alumno_id = a.id
JOIN materias m ON m.id = a.id        -- 🐛 BUG aquí
GROUP BY a.id
ORDER BY total_materias DESC;
\`\`\`

**¿Qué está mal?** La condición del segundo JOIN es incorrecta.  
**Corrígela** para que muestre el número real de materias por alumno.  
El resultado correcto tiene máximo ~4 materias por alumno, no decenas.`,
    starterSQL:
      'SELECT a.nombre, COUNT(*) AS total_materias\n' +
      'FROM alumnos a\n' +
      'JOIN inscripciones i ON i.alumno_id = a.id\n' +
      'JOIN materias m ON m.id = a.id        -- 🐛 BUG: corrige esta condición\n' +
      'GROUP BY a.id\n' +
      'ORDER BY total_materias DESC;',
    tags: ['JOIN', 'debug', 'condición incorrecta', 'lógica'],
    hints: [
      { text: 'El bug está en la condición del JOIN con materias. ¿Qué columna relaciona inscripciones con materias?', xpCost: 0 },
      { text: 'inscripciones tiene columna materia_id que apunta a materias.id', xpCost: 10 },
      { text: 'Corrección: JOIN materias m ON m.id = i.materia_id', xpCost: 20 },
    ],
    validator: (results) => {
      const r = results[0]
      if (!r) return { passed: false, feedback: 'Sin resultados. Ejecuta la consulta corregida.' }
      if (!hasColumn(r, 'total_materias')) return { passed: false, feedback: 'Incluye COUNT(*) AS total_materias.' }
      const maxMaterias = Math.max(...r.rows.map(row => {
        const idx = r.columns.findIndex(c => c.toLowerCase() === 'total_materias')
        return Number(row[idx] ?? 0)
      }))
      if (maxMaterias > 10) {
        return { passed: false, feedback: `Aún hay alumnos con ${maxMaterias} "materias". El JOIN sigue mal — un alumno no puede tener tantas. Revisa la condición.` }
      }
      if (r.rows.length === 0) return { passed: false, feedback: 'Sin resultados tras el JOIN. Revisa las condiciones.' }
      return { passed: true, feedback: `✅ JOIN corregido. Máximo ${maxMaterias} materias por alumno — valores reales y coherentes.` }
    },
  },

  // ── U2: NULL no se compara con = ─────────────────────────────────────────────
  {
    id: 25,
    slug: 'debug-null-trampa',
    title: 'El misterio del NULL',
    subtitle: 'Debug: comparación incorrecta con NULL',
    unitId: 2,
    difficulty: 2,
    xpReward: 110,
    estimatedTime: '10 min',
    context: '⚙️ El Arquitecto: "El becario quería encontrar todos los alumnos sin calificación registrada. La query corre, no da error, pero siempre devuelve 0 filas. ¿Por qué?"',
    objective: `Esta query **nunca devuelve resultados**, aunque existen inscripciones sin calificación:

\`\`\`sql
SELECT a.nombre, i.periodo
FROM inscripciones i
JOIN alumnos a ON a.id = i.alumno_id
WHERE i.calificacion = NULL;    -- 🐛 BUG aquí
\`\`\`

**¿Por qué?** En SQL, NULL no es un valor comparable con \`=\` ni con \`!=\`.  
**Corrígela** para que muestre los alumnos cursando (sin calificación). Debe devolver al menos 5 filas.`,
    starterSQL:
      'SELECT a.nombre, i.periodo\n' +
      'FROM inscripciones i\n' +
      'JOIN alumnos a ON a.id = i.alumno_id\n' +
      'WHERE i.calificacion = NULL;    -- 🐛 BUG: NULL no se compara así',
    tags: ['NULL', 'IS NULL', 'debug', 'comparación'],
    hints: [
      { text: 'En SQL, NULL = NULL siempre devuelve NULL (no TRUE). Nunca uses = NULL.', xpCost: 0 },
      { text: 'Para verificar si algo es NULL usa: IS NULL', xpCost: 5 },
      { text: 'WHERE i.calificacion IS NULL', xpCost: 10 },
    ],
    validator: (results) => {
      const r = results[0]
      if (!r) return { passed: false, feedback: 'Sin resultados. Ejecuta la consulta.' }
      if (r.rows.length === 0) return { passed: false, feedback: 'Sigue devolviendo 0 filas. NULL no se compara con = ni con !=. Usa IS NULL.' }
      if (r.rows.length < 5) return { passed: false, feedback: `Solo ${r.rows.length} filas. ¿Usaste IS NULL correctamente?` }
      return { passed: true, feedback: `✅ Correcto. IS NULL encontró ${r.rows.length} inscripciones sin calificación. Con "= NULL" habrías obtenido siempre 0.` }
    },
  },

  // ── U3: COUNT(columna) vs COUNT(*) ───────────────────────────────────────────
  {
    id: 26,
    slug: 'debug-count-null',
    title: 'COUNT miente',
    subtitle: 'Debug: COUNT(col) ignora NULLs',
    unitId: 3,
    difficulty: 3,
    xpReward: 140,
    estimatedTime: '13 min',
    context: '🗄️ El Tesorero: "Este reporte de asistencia dice que solo hay 20 inscripciones. Pero en la tabla hay muchas más. El director quiere saber cuántas inscripciones existen en total, incluyendo las que están cursando."',
    objective: `El reporte subestima el total real de inscripciones:

\`\`\`sql
SELECT COUNT(calificacion) AS total_inscripciones
FROM inscripciones;    -- 🐛 BUG: solo cuenta filas donde calificacion NO es NULL
\`\`\`

**¿Por qué?** \`COUNT(columna)\` **ignora las filas donde esa columna es NULL**.  
**Corrígela** para contar **todas** las inscripciones. El total real es mayor a 20.`,
    starterSQL:
      'SELECT COUNT(calificacion) AS total_inscripciones\n' +
      'FROM inscripciones;    -- 🐛 BUG: no cuenta los que están cursando (calificacion NULL)',
    tags: ['COUNT', 'NULL', 'debug', 'agregaciones'],
    hints: [
      { text: 'COUNT(columna) salta filas NULL. COUNT(*) cuenta absolutamente todas las filas.', xpCost: 0 },
      { text: 'Cambia COUNT(calificacion) por COUNT(*)', xpCost: 5 },
    ],
    validator: (results) => {
      const r = results[0]
      if (!r) return { passed: false, feedback: 'Sin resultados.' }
      const total = Number(r.rows[0]?.[0])
      if (total <= 20) {
        return { passed: false, feedback: `Sigue dando ${total}. Eso es COUNT(calificacion) — solo filas no-NULL. Usa COUNT(*) para contar todas.` }
      }
      return { passed: true, feedback: `✅ Total real: ${total} inscripciones. COUNT(*) incluye las que están cursando (calificacion = NULL). COUNT(calificacion) te habría dado solo ${total - 6} aprox.` }
    },
  },

  // ── U3: WHERE sobre resultado de agregación ───────────────────────────────────
  {
    id: 27,
    slug: 'debug-where-having',
    title: 'WHERE en el lugar equivocado',
    subtitle: 'Debug: WHERE no filtra agregaciones',
    unitId: 3,
    difficulty: 3,
    xpReward: 130,
    estimatedTime: '12 min',
    context: '🗄️ El Tesorero: "La query falla con un error de SQL. El becario jura que la lógica es correcta. Está filtrando los semestres con más de 5 alumnos, ¿o eso cree él?"',
    objective: `Esta query **lanza un error** de SQL:

\`\`\`sql
SELECT semestre, COUNT(*) AS total
FROM alumnos
WHERE activo = 1
  AND COUNT(*) > 5      -- 🐛 BUG: no puedes usar COUNT() dentro de WHERE
GROUP BY semestre;
\`\`\`

**¿Por qué?** \`WHERE\` se evalúa **antes** de que existan los grupos — no puede ver resultados de funciones de agregación.  
**Corrígela** moviendo la condición al lugar correcto. Debe devolver los semestres con más de 5 alumnos activos.`,
    starterSQL:
      'SELECT semestre, COUNT(*) AS total\n' +
      'FROM alumnos\n' +
      'WHERE activo = 1\n' +
      '  AND COUNT(*) > 5      -- 🐛 BUG: mueve esta condición al lugar correcto\n' +
      'GROUP BY semestre;',
    tags: ['HAVING', 'WHERE', 'debug', 'GROUP BY', 'orden de evaluación'],
    hints: [
      { text: 'El orden de evaluación en SQL: WHERE → GROUP BY → HAVING → SELECT → ORDER BY', xpCost: 0 },
      { text: 'HAVING filtra después de agrupar. WHERE filtra antes.', xpCost: 5 },
      { text: 'Quita COUNT(*) > 5 del WHERE y ponlo como: HAVING COUNT(*) > 5', xpCost: 15 },
    ],
    validator: (results) => {
      const r = results[0]
      if (!r) return { passed: false, feedback: 'Sin resultados. ¿Corregiste el error?' }
      if (r.rows.length === 0) return { passed: false, feedback: 'Sin filas. Verifica la condición HAVING.' }
      const allOver5 = r.rows.every(row => {
        const idx = r.columns.findIndex(c => c.toLowerCase() === 'total')
        return idx >= 0 && Number(row[idx]) > 5
      })
      if (!allOver5) return { passed: false, feedback: 'Hay semestres con ≤5 alumnos en el resultado. El HAVING no está bien.' }
      return { passed: true, feedback: `✅ Correcto. HAVING filtra después del GROUP BY. WHERE nunca puede usar funciones agregadas — ${r.rows.length} semestres con más de 5 alumnos.` }
    },
  },

  // ── U4: ORDER BY en subconsulta no garantiza nada ────────────────────────────
  {
    id: 28,
    slug: 'debug-subquery-order',
    title: 'El ORDER BY inútil',
    subtitle: 'Debug: ORDER BY dentro de subconsulta',
    unitId: 4,
    difficulty: 4,
    xpReward: 160,
    estimatedTime: '15 min',
    context: '🔧 El Mecánico: "El becario quería el alumno con mayor promedio. Escribió esto y juró que funciona. Funciona… a veces. En producción con miles de registros, devuelve un alumno aleatorio."',
    objective: `Esta query es **no determinista** — puede devolver cualquier alumno dependiendo del motor:

\`\`\`sql
SELECT nombre, promedio
FROM (
  SELECT nombre, promedio
  FROM alumnos
  WHERE activo = 1 AND promedio IS NOT NULL
  ORDER BY promedio DESC    -- 🐛 BUG: ORDER BY en subconsulta no garantiza orden externo
)
LIMIT 1;
\`\`\`

**¿Por qué?** El estándar SQL **no garantiza** que un ORDER BY dentro de una subconsulta se preserve en la consulta externa.  
**Corrígela** para obtener **de forma determinista** el alumno con mayor promedio.`,
    starterSQL:
      'SELECT nombre, promedio\n' +
      'FROM (\n' +
      '  SELECT nombre, promedio\n' +
      '  FROM alumnos\n' +
      '  WHERE activo = 1 AND promedio IS NOT NULL\n' +
      '  ORDER BY promedio DESC    -- 🐛 BUG: mueve el ORDER BY afuera\n' +
      ')\n' +
      'LIMIT 1;',
    tags: ['ORDER BY', 'subconsulta', 'debug', 'determinismo', 'LIMIT'],
    hints: [
      { text: 'El ORDER BY debe estar en la consulta EXTERNA, no en la subconsulta.', xpCost: 0 },
      { text: 'O simplemente: SELECT nombre, promedio FROM alumnos WHERE activo=1 AND promedio IS NOT NULL ORDER BY promedio DESC LIMIT 1', xpCost: 15 },
    ],
    validator: (results) => {
      const r = results[0]
      if (!r) return { passed: false, feedback: 'Sin resultados.' }
      if (r.rows.length !== 1) return { passed: false, feedback: 'Debe devolver exactamente 1 fila (el alumno con mayor promedio).' }
      if (!hasColumn(r, 'promedio')) return { passed: false, feedback: 'Incluye la columna promedio.' }
      const promedioIdx = r.columns.findIndex(c => c.toLowerCase() === 'promedio')
      const topPromedio = Number(r.rows[0][promedioIdx])
      if (topPromedio < 90) {
        return { passed: false, feedback: `El alumno devuelto tiene promedio ${topPromedio}. El mayor debería estar por encima de 90. El ORDER BY aún no está aplicado correctamente en la consulta externa.` }
      }
      return { passed: true, feedback: `✅ Correcto. Promedio más alto: ${topPromedio}. El ORDER BY en la consulta externa garantiza el resultado. El ORDER BY interno era decorativo y peligroso.` }
    },
  },

  // ── U5: DELETE sin WHERE — la consulta más temida ────────────────────────────
  {
    id: 29,
    slug: 'debug-delete-sin-where',
    title: 'El DELETE sin paracaídas',
    subtitle: 'Debug: operación destructiva sin condición',
    unitId: 5,
    difficulty: 4,
    xpReward: 170,
    estimatedTime: '15 min',
    context: '🛡️ El Guardián: "El becario tenía que borrar solo los accesos fallidos de un usuario sospechoso. Escribió el DELETE, lo ejecutó en producción… y borró toda la bitácora. Aquí está su query original. Corrígela."',
    objective: `Esta query **borra TODOS los registros** de la bitácora, no solo los del usuario sospechoso:

\`\`\`sql
DELETE FROM bitacora_accesos
-- WHERE usuario = 'hacker_user';    -- 🐛 BUG: WHERE comentado accidentalmente
\`\`\`

**Para demostrar el problema de forma segura:**
1. Crea primero una tabla de prueba copiando solo los registros de \`hacker_user\`
2. Escribe el DELETE correcto con WHERE sobre esa copia
3. Verifica con SELECT que solo quedan los registros del usuario legítimo

El objetivo es escribir y ejecutar un DELETE con WHERE correcto que deje **0 filas de hacker_user** pero conserve el resto.`,
    starterSQL:
      '-- Paso 1: tabla de prueba para no tocar la original\n' +
      'CREATE TABLE IF NOT EXISTS bitacora_prueba AS\n' +
      'SELECT * FROM bitacora_accesos;\n\n' +
      '-- Paso 2: el DELETE del becario (borra TODO):\n' +
      '-- DELETE FROM bitacora_prueba\n' +
      '-- WHERE usuario = \'hacker_user\';    -- 🐛 estaba comentado en el original\n\n' +
      '-- Corrige: escribe el DELETE con WHERE correcto sobre bitacora_prueba\n' +
      'DELETE FROM bitacora_prueba\n' +
      'WHERE /* completa aquí */ 1=0;\n\n' +
      '-- Paso 3: verifica el resultado\n' +
      'SELECT usuario, COUNT(*) as registros\n' +
      'FROM bitacora_prueba\n' +
      'GROUP BY usuario;',
    tags: ['DELETE', 'WHERE', 'debug', 'destructivo', 'bitácora'],
    hints: [
      { text: 'El DELETE debe tener: WHERE usuario = \'hacker_user\'', xpCost: 0 },
      { text: 'Cambia WHERE 1=0 por WHERE usuario = \'hacker_user\'', xpCost: 5 },
      { text: 'Después del DELETE, el SELECT debe mostrar app_captura y app_reader — pero no hacker_user', xpCost: 10 },
    ],
    validator: (results) => {
      const r = results[results.length - 1]
      if (!r) return { passed: false, feedback: 'Sin resultados. Ejecuta los 3 pasos.' }
      if (r.rows.length === 0) return { passed: false, feedback: 'La tabla está vacía — el DELETE borró todo. Agrega WHERE usuario = \'hacker_user\'.' }
      const usuarioIdx = r.columns.findIndex(c => c.toLowerCase() === 'usuario')
      const usuarios = r.rows.map(row => String(row[usuarioIdx] ?? '').toLowerCase())
      if (usuarios.includes('hacker_user')) {
        return { passed: false, feedback: 'hacker_user sigue en la tabla. El WHERE no está funcionando.' }
      }
      if (r.rows.length < 2) {
        return { passed: false, feedback: 'Solo quedó 1 usuario. El DELETE fue demasiado agresivo — debería conservar app_captura y app_reader.' }
      }
      return { passed: true, feedback: `✅ DELETE quirúrgico. hacker_user eliminado. ${r.rows.length} usuarios legítimos intactos. Regla de oro: nunca ejecutes un DELETE sin probar primero el WHERE con un SELECT.` }
    },
  },

  // ── U5: COMMIT olvidado — transacción que nunca termina ─────────────────────
  {
    id: 30,
    slug: 'debug-commit-olvidado',
    title: 'La transacción fantasma',
    subtitle: 'Debug: BEGIN sin COMMIT bloquea todo',
    unitId: 5,
    difficulty: 4,
    xpReward: 175,
    estimatedTime: '16 min',
    context: '🛡️ El Guardián: "El sistema de captura lleva 3 horas colgado. Nadie puede escribir en la base de datos. El DBA de turno te llama. Al revisar el log encuentras que alguien abrió una transacción y nunca la cerró. Aquí está el código."',
    objective: `Esta secuencia **deja la transacción abierta para siempre**, bloqueando otras operaciones:

\`\`\`sql
BEGIN TRANSACTION;
  UPDATE alumnos SET activo = 0 WHERE id = 999;
  -- ¿Todo bien?
  SELECT COUNT(*) FROM alumnos WHERE activo = 1;
-- 🐛 BUG: falta COMMIT o ROLLBACK — la transacción nunca termina
\`\`\`

**Corrígela:** La transacción debe:
1. Iniciar con BEGIN
2. Ejecutar el UPDATE
3. Verificar con SELECT que el cambio es correcto
4. Confirmar con **COMMIT** (o deshacer con ROLLBACK si algo falla)

Demuestra el flujo completo con COMMIT al final y verifica que el SELECT final muestra el estado esperado.`,
    starterSQL:
      '-- Flujo correcto de una transacción\n' +
      'BEGIN TRANSACTION;\n\n' +
      '  -- Operación de negocio\n' +
      '  UPDATE alumnos SET activo = 0 WHERE id = 999;  -- alumno inexistente, seguro\n\n' +
      '  -- Verificación DENTRO de la transacción\n' +
      '  SELECT COUNT(*) AS activos_en_transaccion FROM alumnos WHERE activo = 1;\n\n' +
      '-- 🐛 BUG: agrega COMMIT aquí para cerrar la transacción\n\n' +
      '-- Verificación DESPUÉS de cerrar\n' +
      'SELECT COUNT(*) AS activos_final FROM alumnos WHERE activo = 1;',
    tags: ['COMMIT', 'BEGIN', 'transacciones', 'debug', 'bloqueos', 'ACID'],
    hints: [
      { text: 'Toda transacción debe cerrar con COMMIT (confirmar) o ROLLBACK (deshacer).', xpCost: 0 },
      { text: 'Agrega COMMIT; después del SELECT interno y antes de la verificación final.', xpCost: 5 },
      { text: 'El SELECT final debe ejecutarse FUERA de la transacción para confirmar que el estado persistió.', xpCost: 10 },
    ],
    validator: (results) => {
      if (results.length < 2) return { passed: false, feedback: 'Ejecuta los dos SELECT: uno dentro y uno después de la transacción.' }
      const last = results[results.length - 1]
      if (!last) return { passed: false, feedback: 'Sin resultado final.' }
      const count = Number(last.rows[0]?.[0])
      if (isNaN(count)) return { passed: false, feedback: 'El SELECT final debe devolver un número.' }
      if (count <= 0) return { passed: false, feedback: 'El SELECT final no devuelve alumnos activos. ¿El COMMIT se ejecutó correctamente?' }
      return { passed: true, feedback: `✅ Transacción completa. ${count} alumnos activos confirmados después del COMMIT. En producción, una transacción abierta sin COMMIT puede bloquear tablas por horas.` }
    },
  },

  // ── U6: Índice en columna de baja cardinalidad ────────────────────────────────
  {
    id: 31,
    slug: 'debug-indice-inutil',
    title: 'El índice que no sirve',
    subtitle: 'Debug: índice en columna booleana',
    unitId: 6,
    difficulty: 5,
    xpReward: 200,
    estimatedTime: '18 min',
    context: '🔮 El Oráculo: "Un DBA junior creó este índice para \'optimizar\' las consultas de alumnos activos. El motor de base de datos lo ignora completamente. ¿Por qué? ¿Y qué debería haber creado en su lugar?"',
    objective: `Este índice **existe pero el motor lo ignora** en la mayoría de consultas:

\`\`\`sql
CREATE INDEX idx_activo ON alumnos(activo);
-- 🐛 BUG: activo solo tiene 2 valores posibles (0 y 1) — baja cardinalidad
-- El motor prefiere FULL SCAN porque el índice no filtra suficiente
\`\`\`

**Tarea en 3 partes:**

1. **Verifica** el problema con EXPLAIN QUERY PLAN en una query que filtre por activo
2. **Comprende** por qué falla: calcula la cardinalidad de la columna activo
3. **Propón la solución correcta**: crea un índice compuesto útil (ej: activo + semestre + carrera) y verifica con EXPLAIN que ahora sí se usa

El índice correcto debe aparecer en el EXPLAIN QUERY PLAN de la consulta de prueba.`,
    starterSQL:
      '-- Paso 1: crea el índice de baja cardinalidad (el del becario)\n' +
      'CREATE INDEX IF NOT EXISTS idx_activo ON alumnos(activo);\n\n' +
      '-- Paso 2: ¿cuántos valores distintos tiene activo? (cardinalidad)\n' +
      'SELECT activo, COUNT(*) as frecuencia\n' +
      'FROM alumnos\n' +
      'GROUP BY activo;\n\n' +
      '-- Paso 3: EXPLAIN con índice simple — ¿lo usa?\n' +
      'EXPLAIN QUERY PLAN\n' +
      'SELECT * FROM alumnos WHERE activo = 1 AND carrera = \'ISC\';\n\n' +
      '-- Paso 4: crea el índice correcto (compuesto, alta utilidad)\n' +
      '-- 🐛 Completa aquí: CREATE INDEX idx_activo_carrera_sem ON alumnos(?, ?, ?);\n\n' +
      '-- Paso 5: EXPLAIN con el nuevo índice\n' +
      'EXPLAIN QUERY PLAN\n' +
      'SELECT * FROM alumnos WHERE activo = 1 AND carrera = \'ISC\' AND semestre = 6;',
    tags: ['índices', 'cardinalidad', 'EXPLAIN', 'debug', 'optimización', 'DBA'],
    hints: [
      { text: 'Cardinalidad = cantidad de valores distintos. activo solo tiene 2 (0 y 1) → índice inútil para tablas grandes.', xpCost: 0 },
      { text: 'Un índice es útil cuando filtra al menos el 80% de las filas. Si la mitad de la tabla tiene activo=1, el índice no ayuda.', xpCost: 10 },
      { text: 'Crea: CREATE INDEX idx_activo_carrera_sem ON alumnos(activo, carrera, semestre); — el orden importa: más selectivo primero.', xpCost: 20 },
    ],
    validator: (results) => {
      if (results.length < 3) {
        return { passed: false, feedback: 'Ejecuta todos los pasos: cardinalidad, EXPLAIN antes, crear índice correcto, EXPLAIN después.' }
      }
      // Check last EXPLAIN result mentions a useful index
      const lastExplain = results[results.length - 1]
      if (!lastExplain) return { passed: false, feedback: 'Sin resultado del EXPLAIN final.' }

      const planText = lastExplain.rows
        .map(row => String(row[row.length - 1]).toLowerCase())
        .join(' ')

      // Check for index creation in previous results
      const hasCompositeIndex = results.some(r =>
        r.columns.some(c => c.toLowerCase().includes('name')) &&
        r.rows.some(row => String(row[0]).toLowerCase().includes('idx_activo_carrera'))
      )

      if (planText.includes('scan table') && !planText.includes('index')) {
        return {
          passed: false,
          feedback: 'El EXPLAIN final aún muestra SCAN TABLE — el índice compuesto no existe o no está bien definido. ¿Creaste idx_activo_carrera_sem con las 3 columnas?',
        }
      }

      if (planText.includes('idx_activo_carrera') || planText.includes('using index') || planText.includes('search table')) {
        return {
          passed: true,
          feedback: '✅ Excelente análisis DBA. Comprendiste cardinalidad, diagnosticaste con EXPLAIN y diseñaste un índice compuesto efectivo. En producción esto puede reducir un query de 2 segundos a 2 milisegundos.',
        }
      }

      return {
        passed: true,
        feedback: `✅ Índice compuesto creado. El EXPLAIN muestra mejora. Lección: un índice en columna booleana casi nunca vale — el optimizador prefiere FULL SCAN cuando más del 20-30% de las filas coinciden con el filtro.`,
      }
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
