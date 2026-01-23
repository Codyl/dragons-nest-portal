import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { useAuth } from "./hooks/use-auth";
import { useMemo } from "react";


export interface RouterContext {
  checkAuth: () => Promise<boolean>;
  isLoading: boolean;
}


const router = createRouter({ routeTree });

const App = () => {
  const { checkAuth, isLoading } = useAuth();

  return (
    <RouterProvider router={router} context={{ isLoading, checkAuth }} />
  );
};

export default App;