import { Suspense } from 'react'
import View from './view.jsx'

export const metadata = {
  title: 'New Club Year',
  description: 'Welcome to Next.js',
}

const Page = () => {
  return (
    <Suspense>
      <View />
    </Suspense>
  )
}

export default Page
