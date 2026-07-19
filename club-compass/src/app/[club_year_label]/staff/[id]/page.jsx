import { cache } from 'react'
import View from './view.jsx'
import { generateTitle } from '@/utils/stringUtils'
import staffService from '@/services/staffService'

const getStaffMember = cache(async (id, clubYearLabel) => staffService.getByIdForClubYear(id, clubYearLabel))

export async function generateMetadata({ params }) {
  const { club_year_label: clubYearLabel, id } = await params
  const staffMember = await getStaffMember(id, clubYearLabel)
  const name = staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : 'Staff Member'
  return { title: generateTitle(name, clubYearLabel) }
}

export default async function Page({ params }) {
  const { club_year_label: clubYearLabel, id } = await params
  const staffMember = await getStaffMember(id, clubYearLabel)
  return <View staffMember={staffMember} />
}
