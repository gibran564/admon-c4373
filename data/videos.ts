// Catálogo manual de videos por unidad. Guarda solo el ID de YouTube; si pegas la URL completa,
// el iframe arma un link maldito y el reproductor decide no cooperar.

import type { VideoResource } from '@/types'

export const videosByUnit: Record<number, VideoResource[]> = {

  // Unidad 1: perspectiva del DBA.
  1: [
  ],

  // Unidad 2: arquitectura e instalación.
  2: [
  ],

  // Unidad 3: espacio en disco.
  3: [
  ],

  // Unidad 4: operación y mantenimiento.
  4: [
  ],

  // Unidad 5: seguridad.
  5: [
  ],

  // Unidad 6: monitoreo y auditoría.
  6: [
  ],
}
