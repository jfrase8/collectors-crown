import {
  MAX_NAME_LENGTH,
  type LobbyJoinResult,
  type LobbySummary,
} from "@collectors-crown/shared"
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

export function JoinLobbyDialog({
  lobby,
  disabled,
}: {
  lobby: LobbySummary
  disabled: boolean
}) {
  const navigate = useNavigate()
  const setJoined = useLobbyStore((s) => s.setJoined)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>, close: () => void) {
    e.preventDefault()
    const playerName = String(new FormData(e.currentTarget).get("playerName") ?? "")
    setPending(true)
    setError(null)
    socket.emit("lobby:join", lobby.id, playerName, (res: LobbyJoinResult) => {
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
      <Button isDisabled={disabled}>Join</Button>
      <Modal>
        {({ close }) => (
          <form className={dialogForm()} onSubmit={(e) => onSubmit(e, close)}>
            <Heading slot="title" className={dialogTitle()}>
              Join “{lobby.name}”
            </Heading>
            <TextField
              name="playerName"
              label="Your name"
              isRequired
              maxLength={MAX_NAME_LENGTH}
              autoFocus
            />
            {error && <p className={dialogError()}>{error}</p>}
            <div className={dialogActions()}>
              <Button variant="secondary" onPress={close}>
                Cancel
              </Button>
              <Button type="submit" isDisabled={pending}>
                {pending ? "Joining…" : "Join"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </DialogTrigger>
  )
}
