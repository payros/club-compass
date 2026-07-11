import { Suspense } from 'react'
import View from './view.jsx'
import { generateTitle } from '@/utils/stringUtils'

export const metadata = { title: generateTitle('New Club Year') }

const Page = () => {
  return (
    <Suspense>
      <View />
    </Suspense>
  )
}

export default Page
