import { Route, Routes } from 'react-router';

/**
 * The app's route table.
 *
 * `install` wrapped the app root in a `<BrowserRouter>`, so rendering
 * `<AppRoutes />` anywhere inside the tree is enough to start routing.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function Home() {
  return <h1>Home</h1>;
}

function NotFound() {
  return <h1>Not found</h1>;
}
