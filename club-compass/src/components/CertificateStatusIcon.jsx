import { Icon } from '@chakra-ui/react'
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa'

const STATUS_ICONS = {
  missing: { Component: FaExclamationTriangle, color: 'orange.400', label: 'No certificate uploaded' },
  expiring: { Component: FaTimesCircle, color: 'red.400', label: 'Certificate expires before the club year ends' },
  valid: { Component: FaCheckCircle, color: 'green.400', label: 'Certificate valid through the club year' },
}

/**
 * Status icon for background-check certificates.
 * @param {'missing'|'expiring'|'valid'} status
 */
export default function CertificateStatusIcon({ status }) {
  const config = STATUS_ICONS[status]
  if (!config) return null
  const { Component, color, label } = config
  return (
    <Icon color={color} size="md" title={label} aria-label={label} role="img" style={{ verticalAlign: 'middle' }}>
      <Component />
    </Icon>
  )
}
