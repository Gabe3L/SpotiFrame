import { BrowserRouter as HashRouter, Routes, Route } from 'react-router-dom';

import Home from "./pages/Home";
import Library from "./pages/Library";
import Settings from "./pages/Settings";
import Speech from "./pages/Speech";

import globalStyles from "./App.module.css";

export default function App() {
  return (
    <div className={globalStyles.container}>
      <div className={globalStyles.content}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/speech" element={<Speech />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </HashRouter>
      </div>
    </div>
  );
}
