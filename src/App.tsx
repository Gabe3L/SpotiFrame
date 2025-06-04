import { Art } from './components/Art/Art'
import { Text } from './components/Text/Text'
import { ControlMenu } from './components/ControlMenu/ControlMenu'
import { PlaybackBar } from './components/PlaybackBar/PlaybackBar'

export default function App() {
  return (
    <>
      <Art />
      <Text />
      <ControlMenu />
      <PlaybackBar />
    </>
  );
}