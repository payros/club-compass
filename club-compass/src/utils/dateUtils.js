// Calculates age from date of birth.
// If cutoffDate is provided and today is after it, uses cutoffDate as the reference date.
function fromDateOfBirthToAge(dateOfBirth, cutoffDate = null) {
  const today = new Date()
  const refDate = cutoffDate && today > new Date(cutoffDate) ? new Date(cutoffDate) : today
  const birthDate = new Date(dateOfBirth)
  let age = refDate.getFullYear() - birthDate.getFullYear()
  const monthDiff = refDate.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

function fromDateToString(date) {
  return new Date(date).toLocaleDateString()
}

function localDateToISO(dateStr) {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toISOString()
}

export { fromDateOfBirthToAge, fromDateToString, localDateToISO }
