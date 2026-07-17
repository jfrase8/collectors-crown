import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { socket } from "../lib/socket";
import { useGameStore } from "../stores/game-store";
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
    const { setGame } = useGameStore.getState();
    socket.on("lobby:list", setLobbies);
    socket.on("lobby:state", setLobby);
    socket.on("game:state", setGame);
    socket.connect();
    return () => {
      socket.off("lobby:list", setLobbies);
      socket.off("lobby:state", setLobby);
      socket.off("game:state", setGame);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-primary">
      <Outlet />
    </div>
  );
}
