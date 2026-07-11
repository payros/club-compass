import { Suspense } from 'react'
import View from './view'
import { generateTitle } from '@/utils/stringUtils'

export const metadata = { title: generateTitle('Sign In') }

const LoginPage = () => (
  <Suspense>
    <View />
  </Suspense>
)
export default LoginPage
