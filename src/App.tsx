import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import useAuth from "./hooks/use-auth";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export interface RouterContext {
  checkAuth: () => Promise<boolean>;
  isLoading: boolean;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
  interface RouterContext {
    checkAuth: () => Promise<boolean>;
    isLoading: boolean;
    user: any;
    device: any;
  }
}

const router = createRouter({ routeTree });

const App = () => {
  const { checkAuth, isLoading } = useAuth();
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <RouterProvider router={router} context={{ isLoading, checkAuth }} />
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
};

export default App;