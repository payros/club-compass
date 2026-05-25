import { Suspense } from 'react'
import View from './view.jsx'

export const metadata = {
  title: 'Enroll Staff',
  description: 'Enroll staff members in a club year',
}

const Page = () => {
  return (
    <Suspense>
      <View />
    </Suspense>
  )
}

export default Page
