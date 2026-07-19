import { cache } from 'react'
import View from './view.jsx'
import { generateTitle } from '@/utils/stringUtils'
import staffService from '@/services/staffService'

const getStaffMember = cache(async (id) => staffService.getById(id))

export async function generateMetadata({ params }) {
  const { id } = await params
  const staffMember = await getStaffMember(id)
  const name = staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : 'Staff Member'
  return { title: generateTitle(name) }
}

export default async function Page({ params }) {
  const { id } = await params
  const staffMember = await getStaffMember(id)
  return <View staffMember={staffMember} />
}
