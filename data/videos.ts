// ──────────────────────────────────────────────────────────────────────────────
// VIDEOS POR UNIDAD — SCB-1001
//
// Para agregar un video:
//   1. Busca el video en YouTube
//   2. Copia solo el ID (lo que va después de ?v=)
//      Ejemplo: https://youtube.com/watch?v=XxXxXxXxXx → youtubeId: 'XxXxXxXxXx'
//   3. Agrega el objeto al array de la unidad correspondiente
//
// El portal lo embebe automáticamente en la página de la unidad/práctica.
// ──────────────────────────────────────────────────────────────────────────────

import type { VideoResource } from '@/types'

export const videosByUnit: Record<number, VideoResource[]> = {

  // ── Unidad 1 — Perspectiva del DBA ─────────────────────────────────────────
  1: [
    // { title: 'Qué hace un DBA en el mundo real', youtubeId: 'XXXXXXXX', duration: '10:24', subtema: '1.1 Administrador de Base de Datos', lang: 'es' },
    // { title: 'Comparativa MySQL vs PostgreSQL vs Oracle', youtubeId: 'XXXXXXXX', duration: '15:00', subtema: '1.2 Análisis de manejadores', lang: 'es' },
    // { title: 'Tendencias: DBaaS, vectoriales e IA en BD', youtubeId: 'XXXXXXXX', duration: '12:30', subtema: '1.4 Nuevas tecnologías', lang: 'es' },
  ],

  // ── Unidad 2 — Arquitectura e Instalación ──────────────────────────────────
  2: [
    // { title: 'Arquitectura interna de MySQL 8', youtubeId: 'XXXXXXXX', duration: '18:45', subtema: '2.1 Estructura de memoria y procesos', lang: 'es' },
    // { title: 'Instalar MySQL en Ubuntu Server 22.04', youtubeId: 'XXXXXXXX', duration: '22:10', subtema: '2.6 Procedimiento de instalación', lang: 'es' },
    // { title: 'Configurar my.cnf paso a paso', youtubeId: 'XXXXXXXX', duration: '14:00', subtema: '2.7 Configuración del SGBD', lang: 'es' },
  ],

  // ── Unidad 3 — Espacio en Disco ────────────────────────────────────────────
  3: [
    // { title: 'Tablespaces en InnoDB', youtubeId: 'XXXXXXXX', duration: '16:20', subtema: '3.1-3.2 Espacio de almacenamiento', lang: 'es' },
    // { title: 'Usuarios, roles y GRANT en MySQL', youtubeId: 'XXXXXXXX', duration: '20:00', subtema: '3.3-3.4 Cuotas y roles', lang: 'es' },
    // { title: 'Conexión JDBC con Spring Boot', youtubeId: 'XXXXXXXX', duration: '25:00', subtema: '3.4 JDBC puro', lang: 'es' },
  ],

  // ── Unidad 4 — Operación y Mantenimiento ───────────────────────────────────
  4: [
    // { title: 'Slow query log y diagnóstico de rendimiento', youtubeId: 'XXXXXXXX', duration: '19:00', subtema: '4.1 Archivos log', lang: 'es' },
    // { title: 'Modos de operación MySQL: alta, baja, recovery', youtubeId: 'XXXXXXXX', duration: '17:30', subtema: '4.2 Modos de operación', lang: 'es' },
    // { title: 'Índices en MySQL: cuándo y cómo usarlos', youtubeId: 'XXXXXXXX', duration: '23:45', subtema: '4.3 Índices', lang: 'es' },
  ],

  // ── Unidad 5 — Seguridad ───────────────────────────────────────────────────
  5: [
    // { title: 'Replicación MySQL Source-Replica', youtubeId: 'XXXXXXXX', duration: '28:00', subtema: '5.2 Réplica', lang: 'es' },
    // { title: 'mysqldump y estrategias de respaldo', youtubeId: 'XXXXXXXX', duration: '21:15', subtema: '5.3 Métodos de respaldo', lang: 'es' },
    // { title: 'Recovery punto en tiempo con binary logs', youtubeId: 'XXXXXXXX', duration: '24:00', subtema: '5.4 Recuperación', lang: 'es' },
    // { title: 'Migración de base de datos MySQL', youtubeId: 'XXXXXXXX', duration: '18:00', subtema: '5.5 Migración', lang: 'es' },
  ],

  // ── Unidad 6 — Monitoreo y Auditoría ──────────────────────────────────────
  6: [
    // { title: 'Performance Schema en MySQL 8', youtubeId: 'XXXXXXXX', duration: '26:00', subtema: '6.1 Monitoreo', lang: 'es' },
    // { title: 'Auditoría con MySQL Audit Log Plugin', youtubeId: 'XXXXXXXX', duration: '20:30', subtema: '6.2 Auditoría', lang: 'es' },
  ],
}
