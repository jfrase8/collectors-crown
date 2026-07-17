import { MAX_NAME_LENGTH, type LobbyJoinResult } from "@collectors-crown/shared"
import { useNavigate } from "@tanstack/react-router"
import { useState, type FormEvent } from "react"
import { DialogTrigger, Heading } from "react-aria-components"
import { socket } from "../lib/socket"
import { useLobbyStore } from "../stores/lobby-store"
import { Button } from "./button"
import {
  dialogActions,
  dialogError,
  dialogForm,
  dialogTitle,
} from "./dialog.styles"
import { Modal } from "./modal"
import { TextField } from "./text-field"

export function CreateLobbyDialog() {
  const navigate = useNavigate()
  const setJoined = useLobbyStore((s) => s.setJoined)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>, close: () => void) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const lobbyName = String(form.get("lobbyName") ?? "")
    const playerName = String(form.get("playerName") ?? "")
    setPending(true)
    setError(null)
    socket.emit("lobby:create", lobbyName, playerName, (res: LobbyJoinResult) => {
      setPending(false)
      if (res.ok) {
        setJoined(res.lobby, res.playerId)
        close()
        void navigate({
          to: "/lobby/$lobbyId",
          params: { lobbyId: res.lobby.id },
        })
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <DialogTrigger onOpenChange={() => setError(null)}>
      <Button>Create Lobby</Button>
      <Modal>
        {({ close }) => (
          <form className={dialogForm()} onSubmit={(e) => onSubmit(e, close)}>
            <Heading slot="title" className={dialogTitle()}>
              Create a lobby
            </Heading>
            <TextField
              name="lobbyName"
              label="Lobby name"
              isRequired
              maxLength={MAX_NAME_LENGTH}
              autoFocus
            />
            <TextField
              name="playerName"
              label="Your name"
              isRequired
              maxLength={MAX_NAME_LENGTH}
            />
            {error && <p className={dialogError()}>{error}</p>}
            <div className={dialogActions()}>
              <Button variant="secondary" onPress={close}>
                Cancel
              </Button>
              <Button type="submit" isDisabled={pending}>
                {pending ? "Creating…" : "Create"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </DialogTrigger>
  )
}
