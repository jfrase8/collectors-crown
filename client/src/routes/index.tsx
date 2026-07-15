import {
  MAX_NAME_LENGTH,
  type LobbyJoinResult,
  type LobbySummary,
} from "@collectors-crown/shared";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Input,
  Label,
  Modal,
  ModalOverlay,
  TextField,
} from "react-aria-components";
import { socket } from "../lib/socket";
import { useLobbyStore } from "../stores/lobby-store";

export const Route = createFileRoute("/")({
  component: LobbyBrowser,
});

const fieldClass = "flex flex-col gap-1.5";
const labelClass = "text-sm font-medium text-neutral-300";
const inputClass =
  "rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus:border-amber-500";
const primaryButtonClass =
  "rounded-md bg-amber-500 px-4 py-2 font-semibold text-neutral-950 outline-none hover:bg-amber-400 focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButtonClass =
  "rounded-md border border-neutral-700 px-4 py-2 text-neutral-300 outline-none hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-500";
const overlayClass =
  "fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm";
const modalClass =
  "w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl";

function LobbyBrowser() {
  const lobbies = useLobbyStore((s) => s.lobbies);
  const setLobbies = useLobbyStore((s) => s.setLobbies);

  useEffect(() => {
    socket.emit("lobby:list", setLobbies);
  }, [setLobbies]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Collectors Crown</h1>
        <p className="text-neutral-400">Join a lobby or create your own.</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lobbies</h2>
        <CreateLobbyDialog />
      </div>

      {lobbies.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-800 p-8 text-center text-neutral-500">
          No lobbies yet. Create one to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {lobbies.map((lobby) => (
            <LobbyRow key={lobby.id} lobby={lobby} />
          ))}
        </ul>
      )}
    </main>
  );
}

function LobbyRow({ lobby }: { lobby: LobbySummary }) {
  const inProgress = lobby.phase === "in_progress";
  const full = lobby.playerCount >= lobby.maxPlayers;
  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{lobby.name}</p>
        <p className="text-sm text-neutral-400">
          {lobby.playerCount}/{lobby.maxPlayers} players
          {inProgress && " · in progress"}
          {!inProgress && full && " · full"}
        </p>
      </div>
      <JoinLobbyDialog lobby={lobby} disabled={inProgress || full} />
    </li>
  );
}

function CreateLobbyDialog() {
  const navigate = useNavigate();
  const setJoined = useLobbyStore((s) => s.setJoined);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>, close: () => void) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const lobbyName = String(form.get("lobbyName") ?? "");
    const playerName = String(form.get("playerName") ?? "");
    setPending(true);
    setError(null);
    socket.emit("lobby:create", lobbyName, playerName, (res: LobbyJoinResult) => {
      setPending(false);
      if (res.ok) {
        setJoined(res.lobby, res.playerId);
        close();
        void navigate({ to: "/lobby/$lobbyId", params: { lobbyId: res.lobby.id } });
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <DialogTrigger onOpenChange={() => setError(null)}>
      <Button className={primaryButtonClass}>Create Lobby</Button>
      <ModalOverlay className={overlayClass} isDismissable>
        <Modal className={modalClass}>
          <Dialog className="outline-none">
            {({ close }) => (
              <form className="flex flex-col gap-4" onSubmit={(e) => onSubmit(e, close)}>
                <Heading slot="title" className="text-lg font-semibold">
                  Create a lobby
                </Heading>
                <TextField
                  name="lobbyName"
                  isRequired
                  maxLength={MAX_NAME_LENGTH}
                  className={fieldClass}
                >
                  <Label className={labelClass}>Lobby name</Label>
                  <Input className={inputClass} autoFocus />
                </TextField>
                <TextField
                  name="playerName"
                  isRequired
                  maxLength={MAX_NAME_LENGTH}
                  className={fieldClass}
                >
                  <Label className={labelClass}>Your name</Label>
                  <Input className={inputClass} />
                </TextField>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex justify-end gap-2">
                  <Button className={secondaryButtonClass} onPress={close}>
                    Cancel
                  </Button>
                  <Button type="submit" className={primaryButtonClass} isDisabled={pending}>
                    {pending ? "Creating…" : "Create"}
                  </Button>
                </div>
              </form>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}

function JoinLobbyDialog({ lobby, disabled }: { lobby: LobbySummary; disabled: boolean }) {
  const navigate = useNavigate();
  const setJoined = useLobbyStore((s) => s.setJoined);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>, close: () => void) {
    e.preventDefault();
    const playerName = String(new FormData(e.currentTarget).get("playerName") ?? "");
    setPending(true);
    setError(null);
    socket.emit("lobby:join", lobby.id, playerName, (res: LobbyJoinResult) => {
      setPending(false);
      if (res.ok) {
        setJoined(res.lobby, res.playerId);
        close();
        void navigate({ to: "/lobby/$lobbyId", params: { lobbyId: res.lobby.id } });
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <DialogTrigger onOpenChange={() => setError(null)}>
      <Button className={primaryButtonClass} isDisabled={disabled}>
        Join
      </Button>
      <ModalOverlay className={overlayClass} isDismissable>
        <Modal className={modalClass}>
          <Dialog className="outline-none">
            {({ close }) => (
              <form className="flex flex-col gap-4" onSubmit={(e) => onSubmit(e, close)}>
                <Heading slot="title" className="text-lg font-semibold">
                  Join “{lobby.name}”
                </Heading>
                <TextField
                  name="playerName"
                  isRequired
                  maxLength={MAX_NAME_LENGTH}
                  className={fieldClass}
                >
                  <Label className={labelClass}>Your name</Label>
                  <Input className={inputClass} autoFocus />
                </TextField>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex justify-end gap-2">
                  <Button className={secondaryButtonClass} onPress={close}>
                    Cancel
                  </Button>
                  <Button type="submit" className={primaryButtonClass} isDisabled={pending}>
                    {pending ? "Joining…" : "Join"}
                  </Button>
                </div>
              </form>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
