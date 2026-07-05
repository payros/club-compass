/**
 * DEV ONLY — GET /api/dev/pdf-grid
 *
 * Returns the registration form PDF with a coordinate grid overlaid every
 * STEP points. Each intersection is labelled "x,y" so you can identify exact
 * positions for field placement in pdfUtils.js.
 *
 * Remove or gate this route behind an env check before deploying to production.
 */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const TEMPLATE_PATH = path.join(process.cwd(), 'src', 'resources', 'Adventurer_Registration_Form.pdf')
const STEP = 50 // grid spacing in points

export async function GET() {
  const templateBytes = fs.readFileSync(TEMPLATE_PATH)
  const doc = await PDFDocument.load(templateBytes)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const page = doc.getPage(0)
  const { width, height } = page.getSize()

  for (let x = 0; x <= width; x += STEP) {
    // Vertical guide line
    page.drawLine({
      start: { x, y: 0 },
      end: { x, y: height },
      thickness: 0.3,
      color: rgb(0.75, 0.75, 0.75),
      opacity: 0.6,
    })
    for (let y = 0; y <= height; y += STEP) {
      if (x === 0) {
        // Horizontal guide line (draw once per y row)
        page.drawLine({
          start: { x: 0, y },
          end: { x: width, y },
          thickness: 0.3,
          color: rgb(0.75, 0.75, 0.75),
          opacity: 0.6,
        })
      }
      // Label at each intersection
      page.drawText(`${x},${y}`, {
        x: x + 1,
        y: y + 1,
        size: 5,
        font,
        color: rgb(0.8, 0, 0),
        opacity: 0.8,
      })
    }
  }

  const pdfBytes = await doc.save()
  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="registration-form-grid.pdf"',
    },
  })
}
