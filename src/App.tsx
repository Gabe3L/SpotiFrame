import Art from "./components/Art/Art";
import Text from "./components/Text/Text";
import ControlMenu from "./components/ControlMenu/ControlMenu";
import PlaybackBar from "./components/PlaybackBar/PlaybackBar";

import globalStyles from "./App.module.css";

export default function App() {
  return (
    <div className={globalStyles.location}>
      <div className={globalStyles.container}>
        <Art />
        <Text />
        <ControlMenu />
        <PlaybackBar />
      </div>
    </div>
  );
}
