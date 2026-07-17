import {
  skeletonBlock,
  skeletonList,
  skeletonRow,
} from "./lobby-list-skeleton.styles"

export function LobbyListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className={skeletonList()} aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className={skeletonRow()}>
          <div className="flex min-w-0 flex-col gap-2">
            <div className={skeletonBlock({ size: "name" })} />
            <div className={skeletonBlock({ size: "meta" })} />
          </div>
          <div className={skeletonBlock({ size: "button" })} />
        </li>
      ))}
    </ul>
  )
}
