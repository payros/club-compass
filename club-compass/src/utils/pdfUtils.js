import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import { fromDateOfBirthToAge } from '@/utils/dateUtils'

const FONT_SIZE = {
  extraSmall: 8,
  small: 10,
  medium: 13,
  large: 20,
}

/**
 * Generates a multi-page PDF with one page per child, prefilled with
 * the given parent and child data.
 *
 * @param {object} parent  - Parent record (camelCase keys from postgres.camel)
 * @param {object[]} children - Children records
 * @returns {Promise<Uint8Array>} PDF bytes
 */
export async function generateRegistrationPdf(parent, children, clubYear, clubDirector) {
  const templatePath = path.join(process.cwd(), 'src', 'resources', 'Adventurer_Registration_Form.pdf')
  // ---------------------------------------------------------------------------
  // Field coordinate map (x, y in pdf-lib points; origin = bottom-left corner)
  //
  // Run GET /api/dev/pdf-grid to generate a labelled grid overlay over the blank
  // template. Use those coordinates to fill in the values below.
  // ---------------------------------------------------------------------------
  const fields = {
    todaysDate: { x: 260, y: 737, size: FONT_SIZE.large },
    clubName: { x: 90, y: 673, size: FONT_SIZE.medium },
    directorName: { x: 350, y: 673, size: FONT_SIZE.medium },
    churchName: { x: 100, y: 650, size: FONT_SIZE.medium },
    childName: { x: 108, y: 627, size: FONT_SIZE.medium },
    dateOfBirth: { x: 350, y: 627, size: FONT_SIZE.medium },
    age: { x: 470, y: 627, size: FONT_SIZE.medium },
    grade: { x: 534, y: 627, size: FONT_SIZE.medium },
    parentAddress: { x: 107, y: 605, size: FONT_SIZE.medium },
    parentPhone: { x: 95, y: 582, size: FONT_SIZE.medium },
    emergencyContact: { x: 400, y: 582, size: FONT_SIZE.extraSmall },
    childName2: { x: 50, y: 491.5, size: FONT_SIZE.medium },
    clubName2: { x: 378, y: 491.5, size: FONT_SIZE.medium },
    allergies: { x: 366, y: 340, size: FONT_SIZE.extraSmall },
    physicalRestrictions: { x: 471, y: 321, size: FONT_SIZE.extraSmall - 1 },
    medicalConditions: { x: 351, y: 302.5, size: FONT_SIZE.extraSmall },
    parentName: { x: 90, y: 143, size: FONT_SIZE.medium },
    parentPhone2: { x: 384, y: 143, size: FONT_SIZE.medium },
    parentAddress2: { x: 100, y: 119, size: FONT_SIZE.medium },
    parentEmail: { x: 97, y: 96, size: FONT_SIZE.medium },
  }

  const circles = {
    littleLamb: { x: 125, y: 519.5, xScale: 31, yScale: 8 },
    eagerBeaver: { x: 196, y: 519.5, xScale: 34, yScale: 8 },
    busyBee: { x: 262, y: 519.5, xScale: 27, yScale: 8 },
    sunbeam: { x: 325, y: 519.5, xScale: 26, yScale: 8 },
    builder: { x: 385, y: 519.5, xScale: 24, yScale: 8 },
    helpingHand: { x: 454, y: 519.5, xScale: 35, yScale: 8 },
    allergiesYes: { x: 45.5, y: 344, xScale: 12, yScale: 8 },
    allergiesNo: { x: 75, y: 344, xScale: 9, yScale: 8 },
    physicalRestrictionsYes: { x: 45.5, y: 325, xScale: 12, yScale: 8 },
    physicalRestrictionsNo: { x: 75, y: 325, xScale: 9, yScale: 8 },
    medicalConditionsYes: { x: 45.5, y: 306.5, xScale: 12, yScale: 8 },
    medicalConditionsNo: { x: 72, y: 306.5, xScale: 9, yScale: 8 },
  }

  const templateBytes = fs.readFileSync(templatePath)
  const mergedDoc = await PDFDocument.create()

  const parentName = `${parent.firstName ?? ''} ${parent.lastName ?? ''}`.trim()
  console.log('children', children)
  for (const child of children) {
    const childDoc = await PDFDocument.load(templateBytes)
    const page = childDoc.getPage(0)
    const font = await childDoc.embedFont(StandardFonts.Helvetica)

    const drawText = (field, value) => {
      if (!value) return
      const { x, y, size } = fields[field]
      page.drawText(String(value), { x, y, size, font, color: rgb(0, 0, 0) })
    }

    const drawCircle = (circle) => {
      const { x, y, xScale, yScale } = circle
      page.drawEllipse({
        x,
        y,
        xScale,
        yScale,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      })
    }

    const todaysDateFormatted = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const dobFormatted = child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString('en-US') : ''
    const clubName = clubYear?.clubName ?? process.env.NEXT_PUBLIC_CLUB_NAME ?? 'Adventurers Club'
    const directorName = `${clubDirector?.firstName ?? ''} ${clubDirector?.lastName ?? ''}`.trim()
    const childName = `${child.firstName ?? ''} ${child.lastName ?? ''}`.trim()
    const age = fromDateOfBirthToAge(child.dateOfBirth, clubYear?.endDate)
    const emergencyContact =
      `${child.emergencyContact?.firstName ?? ''} ${child.emergencyContact?.lastName ?? ''} - ${child.emergencyContact?.phone ?? ''}`.trim()

    // Basic information
    drawText('todaysDate', todaysDateFormatted)
    drawText('clubName', clubName)
    drawText('directorName', directorName)
    drawText('churchName', clubYear.churchName ?? '')
    drawText('childName', childName)
    drawText('dateOfBirth', dobFormatted)
    drawText('age', age)
    drawText('grade', child.grade ?? '')
    drawText('parentAddress', parent.address ?? '')
    drawText('parentPhone', parent.phone ?? '')
    drawText('emergencyContact', emergencyContact)

    // Applicant information — circle a level only if the child has a pin for it
    const hasPinForLevel = (level) => child.awards?.some((a) => a.type === 'pin' && a.level === level)
    if (hasPinForLevel('little_lambs')) drawCircle(circles.littleLamb)
    if (hasPinForLevel('eager_beavers')) drawCircle(circles.eagerBeaver)
    if (hasPinForLevel('busy_bees')) drawCircle(circles.busyBee)
    if (hasPinForLevel('sunbeams')) drawCircle(circles.sunbeam)
    if (hasPinForLevel('builders')) drawCircle(circles.builder)
    if (hasPinForLevel('helping_hands')) drawCircle(circles.helpingHand)

    drawText('childName2', childName)
    drawText('clubName2', clubName)

    // Health information
    child.allergies && child.allergies.trim().length > 0
      ? drawCircle(circles.allergiesYes)
      : drawCircle(circles.allergiesNo)
    drawText('allergies', child.allergies ?? '')
    child.physicalRestrictions && child.physicalRestrictions.trim().length > 0
      ? drawCircle(circles.physicalRestrictionsYes)
      : drawCircle(circles.physicalRestrictionsNo)
    drawText('physicalRestrictions', child.physicalRestrictions ?? '')
    child.medicalConditions && child.medicalConditions.trim().length > 0
      ? drawCircle(circles.medicalConditionsYes)
      : drawCircle(circles.medicalConditionsNo)
    drawText('medicalConditions', child.medicalConditions ?? '')

    // Parent information
    drawText('parentName', parentName)
    drawText('parentPhone2', parent.phone ?? '')
    drawText('parentAddress2', parent.address ?? '')
    drawText('parentEmail', parent.email ?? '')

    const [copiedPage] = await mergedDoc.copyPages(childDoc, [0])
    mergedDoc.addPage(copiedPage)
  }

  return mergedDoc.save()
}
