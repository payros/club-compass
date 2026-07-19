import { cache } from 'react'
import View from './view'
import { generateTitle } from '@/utils/stringUtils'
import childrenService from '@/services/childrenService'

const getChild = cache(async (id) => childrenService.getById(id))

export async function generateMetadata({ params }) {
  const { id } = await params
  const child = await getChild(id)
  const name = child ? `${child.firstName} ${child.lastName}` : 'Child'
  return { title: generateTitle(`Edit Awards — ${name}`) }
}

export default async function Page({ params }) {
  const { id } = await params
  const child = await getChild(id)
  return <View child={child} />
}
