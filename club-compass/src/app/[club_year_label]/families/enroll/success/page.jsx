import { Suspense } from 'react'
import View from './view.jsx'

export const metadata = { title: 'Enrollment Complete' }

const Page = () => {
  return (
    <Suspense>
      <View />
    </Suspense>
  )
}

export default Page
