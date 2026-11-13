import { cache } from 'react'
import View from './view.jsx'
import { generateTitle } from '@/utils/stringUtils'
import eventsService from '@/services/eventsService'

const getEvent = cache(async (eventId) => eventsService.getById(eventId))

export async function generateMetadata({ params }) {
  const { club_year_label: clubYearLabel, event_id: eventId } = await params
  const event = await getEvent(eventId)
  const name = event?.title ?? 'Event'
  return { title: generateTitle(`${name} Roll-Call`, clubYearLabel) }
}

export default async function Page({ params }) {
  const { event_id: eventId } = await params
  const event = await getEvent(eventId)
  return <View event={event} />
}
