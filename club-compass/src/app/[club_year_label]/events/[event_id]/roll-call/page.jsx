import { cache } from 'react'
import View from './view.jsx'
import { generateTitle } from '@/utils/stringUtils'
import eventsService from '@/services/eventsService'
import clubYearsService from '@/services/clubYearsService'

const getEvent = cache(async (eventId) => eventsService.getById(eventId))
const getClubYear = cache(async (label) => clubYearsService.getByLabel(label))

export async function generateMetadata({ params }) {
  const { club_year_label: clubYearLabel, event_id: eventId } = await params
  const event = await getEvent(eventId)
  const name = event?.title ?? 'Event'
  return { title: generateTitle(`${name} Roll-Call`, clubYearLabel) }
}

export default async function Page({ params }) {
  const { club_year_label: clubYearLabel, event_id: eventId } = await params
  const [event, clubYear] = await Promise.all([getEvent(eventId), getClubYear(clubYearLabel)])
  return <View event={event} clubYear={clubYear} />
}
