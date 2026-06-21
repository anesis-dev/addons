import { Route, Routes } from 'react-router';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
// anesis:page-imports

function App() {
  return (
    <Routes>
      {/* anesis:routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
