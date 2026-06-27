import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { GoogleOAuthProvider } from '@react-oauth/google';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const router = createRouter({
  routeTree,
  context: undefined!, // ponytail: no async context needed; auth is synchronous localStorage check
});

const App = () => {

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <RouterProvider router={router} context={{}} />
    </GoogleOAuthProvider>
  );
};

export default App;
