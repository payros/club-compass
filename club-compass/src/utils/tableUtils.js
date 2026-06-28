// Sort table column in alphabetical order
function sortRecordsInAlphabeticalOrder(columnKey, direction, tableData) {
  const sortedData = [...tableData].sort((a, b) => {
    const valueA = a[columnKey] ? a[columnKey].toString().toLowerCase() : ''
    const valueB = b[columnKey] ? b[columnKey].toString().toLowerCase() : ''

    if (valueA < valueB) return direction === 'asc' ? -1 : 1
    if (valueA > valueB) return direction === 'asc' ? 1 : -1
    return 0
  })
  return sortedData
}

function handleSorting(by, tableKey, setter) {
  setter((sortBy) => {
    let newBy = by
    let newDirection = 'asc'

    // Toggle sort direction
    if (sortBy[tableKey].by === by) {
      newDirection = sortBy[tableKey].direction === 'asc' ? 'desc' : 'asc'
    }

    return {
      ...sortBy,
      [tableKey]: {
        by: newBy,
        direction: newDirection,
      },
    }
  })
}

export { sortRecordsInAlphabeticalOrder, handleSorting }
