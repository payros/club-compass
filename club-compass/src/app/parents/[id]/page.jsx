import { cache } from 'react'
import View from './view.jsx'
import { generateTitle } from '@/utils/stringUtils'
import parentsService from '@/services/parentsService'

const getParent = cache(async (id) => parentsService.getById(id))

export async function generateMetadata({ params }) {
  const { id } = await params
  const parent = await getParent(id)
  const name = parent ? `${parent.firstName} ${parent.lastName}` : 'Parent'
  return { title: generateTitle(name) }
}

export default async function Page({ params }) {
  const { id } = await params
  const parent = await getParent(id)
  return <View parent={parent} />
}
