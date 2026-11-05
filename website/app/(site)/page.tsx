import { StructuredData } from '@/components/primitives/structured-data'
import { landingPageSchema } from '@/lib/seo/structured-data'
import { HomeScreen } from '@/screens/home.screen'

const HomePage = () => (
  <>
    {/* what search engines read about the library */}
    <StructuredData data={landingPageSchema} />
    {/* the page */}
    <HomeScreen />
  </>
)

export default HomePage
