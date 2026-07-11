import View from './view.jsx'
import { generateTitle } from '@/utils/stringUtils'

export const metadata = { title: generateTitle('Child') }

const Page = () => <View />
export default Page
