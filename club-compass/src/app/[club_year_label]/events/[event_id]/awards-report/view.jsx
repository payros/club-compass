'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Dialog, Portal, CloseButton, Flex, Text } from '@chakra-ui/react'

import DashboardPage from '@/components/pages/DashboardPage'
import { fromSnakeCaseToTitleCase } from '@/utils/stringUtils'

const AWARD_PLACEHOLDER_IMAGE = '/img/award_placeholder.svg'

export default function View({ event, report = [] }) {
  const { club_year_label: clubYearLabel, event_id: eventId } = useParams()

  const breadcrumbs = [
    { label: 'Events', href: `/${clubYearLabel}/events` },
    { label: event?.title ?? 'Event', href: `/${clubYearLabel}/events/${eventId}` },
    { label: 'Awards Report' },
  ]

  const [countOpen, setCountOpen] = useState(false)

  // Same award can be given in several classes, so totals are grouped by award
  const awardCounts = Object.values(
    report
      .flatMap((cls) => cls.awards)
      .reduce((acc, award) => {
        acc[award.id] ??= { id: award.id, name: award.name, patchImageUrl: award.patchImageUrl, count: 0 }
        acc[award.id].count += award.childIds.length
        return acc
      }, {})
  ).sort((a, b) => a.name.localeCompare(b.name))

  const actions = [{ label: 'Award Count', onClick: () => setCountOpen(true) }]

  const cards = report.map((cls) => ({
    title: fromSnakeCaseToTitleCase(cls.class),
    description: `${cls.awards.length} awards · ${cls.children.length} children`,
    width: 'full',
    maxH: '500px',
    headers: [
      { key: 'name', label: 'Award', sortable: false },
      ...cls.children.map((child) => ({
        key: `child-${child.id}`,
        label: `${child.firstName} ${child.lastName}`,
        type: 'image',
        imageHeight: '3.5rem',
        labelFontSize: 'xs',
        sortable: false,
      })),
    ],
    data: cls.awards.map((award) => ({
      id: award.id,
      name: award.name,
      ...Object.fromEntries(
        award.childIds.map((childId) => [`child-${childId}`, award.patchImageUrl ?? AWARD_PLACEHOLDER_IMAGE])
      ),
    })),
  }))

  return (
    <>
      <DashboardPage breadcrumbs={breadcrumbs} actions={actions} cards={cards} />
      <Dialog.Root open={countOpen} onOpenChange={(e) => setCountOpen(e.open)} scrollBehavior="inside">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Award Count</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {awardCounts.length === 0 ? (
                  <Text>No awards to give.</Text>
                ) : (
                  awardCounts.map((award) => (
                    <Flex key={award.id} align="center" gap={3} py={1}>
                      <img
                        src={award.patchImageUrl ?? AWARD_PLACEHOLDER_IMAGE}
                        alt=""
                        style={{ height: '3rem', width: '3rem', objectFit: 'contain' }}
                      />
                      <Text>
                        {award.name} - {award.count}
                      </Text>
                    </Flex>
                  ))
                )}
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}
