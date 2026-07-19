import { cache } from 'react'
import View from './view.jsx'
import { generateTitle } from '@/utils/stringUtils'
import awardsService from '@/services/awardsService'

const getAward = cache(async (id) => awardsService.getById(id))

export async function generateMetadata({ params }) {
  const { id } = await params
  const award = await getAward(id)
  return { title: generateTitle(`Edit ${award?.name ?? 'Award'}`) }
}

export default async function Page({ params }) {
  const { id } = await params
  const award = await getAward(id)
  return <View award={award} />
}
