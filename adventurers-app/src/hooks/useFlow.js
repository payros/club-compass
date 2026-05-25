'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { match, compile } from 'path-to-regexp'

const flowMapping = {
  setup: [
    '/club-years/new',
    '/[club_year_label]/staff/enroll',
    '/[club_year_label]/classes/new',
    '/[club_year_label]/dashboard',
  ],
}

function toExpressPattern(nextPattern) {
  return nextPattern.replace(/\[([^\]]+)\]/g, ':$1')
}

function matchNextPattern(pathname, nextPattern) {
  const result = match(toExpressPattern(nextPattern), { decode: decodeURIComponent })(pathname)
  return result ? result.params : null
}

function resolveNextPattern(nextPattern, params) {
  return compile(toExpressPattern(nextPattern), { encode: encodeURIComponent })(params)
}

export function useFlow() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const flowName = searchParams.get('flow')

  if (!flowName || !flowMapping[flowName]) return { getNextPath: undefined }

  const steps = flowMapping[flowName]
  for (let i = 0; i < steps.length; i++) {
    const matchedParams = matchNextPattern(pathname, steps[i])
    if (matchedParams !== null) {
      const isLastStep = i === steps.length - 1
      return {
        current: i + 1,
        total: steps.length - 1,
        getNextPath: isLastStep
          ? undefined
          : (extraParams = {}) => {
              const allParams = { ...matchedParams, ...extraParams }
              const path = resolveNextPattern(steps[i + 1], allParams)
              return `${path}${isLastStep ? '' : `?flow=${flowName}`}`
            },
      }
    }
  }

  return { current: undefined, total: undefined, getNextPath: undefined }
}
