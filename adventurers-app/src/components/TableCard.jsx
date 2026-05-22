import { TableCell, Card, Table, Skeleton, Button, Spacer, Icon, Text } from '@chakra-ui/react'
import { FaCaretDown, FaCaretUp, FaExternalLinkAlt } from 'react-icons/fa'
import { motion } from 'framer-motion'
import Link from 'next/link'

const MotionRow = motion.create(Table.Row)

function TableCard({
  title,
  description,
  headers,
  data,
  loading,
  sortBy,
  sortDirection,
  handleSort,
  onRowClick,
  href,
  maxH = '320px',
  fullWidth = false,
}) {
  return (
    <Card.Root className="glass-card" style={{ width: fullWidth ? '100%' : undefined }}>
      <Card.Header pb={2}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div>
            <Card.Title className="card-title">{title}</Card.Title>
            {description && <Card.Description className="card-description">{description}</Card.Description>}
          </div>
          {href && (
            <Button asChild size="sm" variant="outline" colorPalette="brand">
              <Link href={href}>View all</Link>
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Body pt={0}>
        <Table.ScrollArea lob rounded="xl" className="glass-scrollarea" height={maxH}>
          <Table.Root size="sm" stickyHeader className="glass-table">
            <Table.Header className="glass-table-header">
              <Table.Row bg="transparent">
                {headers.map((header) => (
                  <Table.ColumnHeader
                    key={header.key}
                    onClick={() => (header.sortable && handleSort ? handleSort(header.key) : null)}
                    style={{ cursor: header.sortable ? 'pointer' : 'default' }}
                  >
                    {header.sortable ? (
                      <Button size="sm" variant="plain">
                        {header.label}
                        <Spacer />
                        {sortBy === header.key ? (
                          <Icon size="xs">{sortDirection === 'asc' ? <FaCaretUp /> : <FaCaretDown />}</Icon>
                        ) : null}
                      </Button>
                    ) : (
                      <Text>{header.label}</Text>
                    )}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loading ? (
                [0, 1, 2].map((i) => (
                  <Table.Row key={i} bg="transparent">
                    <Table.Cell colSpan={headers.length}>
                      <Skeleton height="5" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : !data || data.length === 0 ? (
                <Table.Row bg="transparent" style={{ borderColor: 'transparent' }}>
                  <Table.Cell colSpan={headers.length}>
                    <Text textAlign="center" py={4} fontSize="sm">
                      No records found
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : (
                data.map((item, index) => (
                  <MotionRow
                    key={`${item.id ?? ''}-${index}`}
                    bg="transparent"
                    className={onRowClick ? 'clickable-row' : ''}
                    onClick={() => onRowClick && onRowClick(item)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.18 }}
                  >
                    {headers.map((header) => (
                      <TableCell key={header.key} color="rgba(255,255,255,0.9)" fontSize="sm">
                        {header.hrefKey && item[header.hrefKey] ? (
                          <Link
                            href={item[header.hrefKey]}
                            onClick={(e) => e.stopPropagation()}
                            target={header.hrefExternal ? '_blank' : undefined}
                            rel={header.hrefExternal ? 'noopener noreferrer' : undefined}
                            style={{
                              textDecoration: 'underline',
                              color: 'inherit',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            {item[header.key]}
                            {header.hrefExternal && <FaExternalLinkAlt style={{ fontSize: '0.7em', opacity: 0.8 }} />}
                          </Link>
                        ) : (
                          item[header.key]
                        )}
                      </TableCell>
                    ))}
                  </MotionRow>
                ))
              )}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Card.Body>
    </Card.Root>
  )
}

export default TableCard
