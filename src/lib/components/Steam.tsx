import { fetchSteamStats } from "@/lib/steam-stats";

function formatPlaytime(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  return `${(minutes/60).toFixed(1)}h`
}

export default async function Steam() {
  const stats = await fetchSteamStats();
  if (!stats) return null;

  return (
    <div className="mt-6 rounded-xl border border-rose/25 bg-background/40 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-rose">
          Steam 
        </p>

        <a
          href={stats.profileUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-subtle transition-colors hover:text-rose"
        >
          Profile
        </a>
      </div>

      <div className="mt-3 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3">
        <dl className="flex flex-col justify-between gap-2">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-subtle">
              Games
            </dt>
            <dd className="text-lg font-bold text-foam">
              {stats.totalGames.toLocaleString()}
            </dd>
          </div>

          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-subtle">
              Hours
            </dt>
            <dd className="text-lg font-bold text-iris">
              {stats.totalHours.toLocaleString()}
            </dd>
          </div>

          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-subtle">
              Perfect 
            </dt>
            <dd className="text-lg font-bold text-gold">
              {stats.perfectGames.toLocaleString()}
            </dd>
          </div>
        </dl>

        <div className="mx-auto w-full max-w-80">
          <p className="text-[10px] uppercase tracking-[0.14em] text-rose">
            Recently Played
          </p>

          {stats.games.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {stats.games.map((game) => (
                <li key={game.appid} className="flex items-center gap-2">
                  {game.iconUrl && (
                    <img
                      src={game.iconUrl}
                      alt=""
                      width={20}
                      height={20}
                      className="size-5 shrink-0 rounded"
                    />
                  )}

                  <span className="min-w-0 flex-1 truncate text-xs" title={game.name}>{game.name}</span>
                  <span className="shrink-0 text-[10px] text-subtle">
                    {formatPlaytime(game.playtimeTwoWeeks)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-subtle">No recent playtime.</p>
          )}
        </div>
      </div>
    </div>
  );
}