import { useWidgetStore } from "../../stores/widget.store";

export function SessionSummary() {
  const { session, requestSnapshot } = useWidgetStore();

  const minutes = session
    ? Math.round(session.durationMs / 60_000)
    : 0;

  return (
    <div className="px-4 py-2">
      <p className="text-[11px] font-medium text-indigo-300 uppercase tracking-wider mb-1">
        Working on
      </p>
      {session ? (
        <>
          <p className="text-sm text-white font-medium leading-snug">
            {session.topic}
            <span className="text-white/40 font-normal"> · {minutes}m</span>
          </p>
          <p className="text-[12px] text-white/60 mt-1 leading-relaxed line-clamp-2">
            {session.summary}
          </p>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-[12px] text-white/40">Watching your tabs silently…</p>
          <button
            onClick={requestSnapshot}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            Analyze now
          </button>
        </div>
      )}
    </div>
  );
}
