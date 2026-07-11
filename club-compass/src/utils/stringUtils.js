// Converts snake_case classes to Title Case class string
function fromSnakeCaseToTitleCase(string) {
  string = string.replace(/_/g, ' ')
  return string.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

// Generates a page title. If clubYearLabel is provided, formats as "[clubYearLabel] [pageName] | Club Compass"
function generateTitle(pageName, clubYearLabel) {
  if (clubYearLabel) return `${clubYearLabel} ${pageName} | Club Compass`
  return `${pageName} | Club Compass`
}

export { fromSnakeCaseToTitleCase, generateTitle }
