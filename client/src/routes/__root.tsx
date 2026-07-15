import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { socket } from "../lib/socket";
import { useLobbyStore } from "../stores/lobby-store";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  useEffect(() => {
    const { setLobbies, setLobby } = useLobbyStore.getState();
    socket.on("lobby:list", setLobbies);
    socket.on("lobby:state", setLobby);
    socket.connect();
    return () => {
      socket.off("lobby:list", setLobbies);
      socket.off("lobby:state", setLobby);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <Outlet />
    </div>
  );
}
