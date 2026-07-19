// Calculates age from date of birth
function fromDateOfBirthToAge(dateOfBirth) {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
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
