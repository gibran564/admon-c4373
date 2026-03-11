import type { Practice } from '@/types'

export function generateReportTemplate(practice: Practice, studentName?: string, controlNumber?: string): string {
  const now = new Date().toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' })
  const sections = practice.reportSections ?? defaultSections(practice)

  return `# ${practice.title}
## Reporte de práctica — SCB-1001 Administración de Base de Datos

| Campo | Valor |
|-------|-------|
| **Práctica** | P${String(practice.id).padStart(2,'0')} — ${practice.title} |
| **Unidad** | ${practice.unitId} |
| **Alumno** | ${studentName ?? '_(nombre completo)_'} |
| **No. Control** | ${controlNumber ?? '_(número de control)_'} |
| **Fecha** | ${now} |
| **Herramientas** | ${(practice.desktopTools ?? ['MySQL 8.x','Ubuntu Server 22.04']).join(', ')} |

---

## Objetivo

${practice.objectives.map((o, i) => `${i+1}. ${o}`).join('\n')}

---

${sections.map(s => `## ${s}\n\n> _Describe aquí ${s.toLowerCase()}._\n\n`).join('\n')}

## Entregables completados

${practice.deliverables.map(d => `- [ ] ${d}`).join('\n')}

---

## Comandos ejecutados

\`\`\`sql
-- Pega aquí los comandos SQL principales ejecutados durante la práctica
\`\`\`

\`\`\`bash
# Comandos bash / shell ejecutados
\`\`\`

---

## Capturas de pantalla

> Inserta capturas de pantalla como evidencia. Ejemplo:
> \`![Descripción](./capturas/evidencia-01.png)\`

---

## Conclusiones

> Describe en al menos un párrafo qué aprendiste, qué dificultades encontraste y cómo las resolviste.

---

## Referencias

- MySQL 8.x Reference Manual: https://dev.mysql.com/doc/refman/8.0/en/
- Repositorio del curso: https://github.com/TecNM-ISC/SCB-1001
`
}

function defaultSections(p: Practice): string[] {
  if (p.type === 'sql') return ['Procedimiento', 'Configuración aplicada', 'Resultados obtenidos', 'Problemas encontrados']
  if (p.type === 'bash') return ['Procedimiento', 'Scripts utilizados', 'Resultados obtenidos', 'Problemas encontrados']
  if (p.type === 'java') return ['Configuración del proyecto', 'Código implementado', 'Resultados obtenidos', 'Problemas encontrados']
  return ['Procedimiento', 'Análisis realizado', 'Resultados obtenidos', 'Conclusión']
}

export function downloadMarkdown(content: string, filename: string) {
  if (typeof window === 'undefined') return
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
