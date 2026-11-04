import { AgentsContainer } from '@/containers/agents.container'
import { HeroContainer } from '@/containers/hero.container'
import { HomeStageContainer } from '@/containers/home-stage.container'
import { LimitsContainer } from '@/containers/limits.container'
import { MenuContainer } from '@/containers/menu.container'
import { NavContainer } from '@/containers/nav.container'
import { OkContainer } from '@/containers/ok.container'
import { OptionContainer } from '@/containers/option.container'
import { PipeContainer } from '@/containers/pipe.container'
import { QueueContainer } from '@/containers/queue.container'
import { RailwayContainer } from '@/containers/railway.container'
import { StoryContainer } from '@/containers/story.container'
import { ValidationContainer } from '@/containers/validation.container'
import { ZoomContainer } from '@/containers/zoom.container'

/** The home page, top to bottom: the same order as the pipe in the hero. */
export const HomeScreen = () => (
  <>
    {/* navigation */}
    <NavContainer />

    {/* the page */}
    <HomeStageContainer>
      <HeroContainer />
      <QueueContainer />
      <StoryContainer />
      <RailwayContainer />
      <OptionContainer />
      <ValidationContainer />
      <PipeContainer />
      <MenuContainer />
      <ZoomContainer />
      <AgentsContainer />
      <LimitsContainer />
      <OkContainer />
    </HomeStageContainer>
  </>
)
