import { SessionCard } from "../components/SessionCard";
import { useSessionsQuery } from "../generated/graphql";

export function Sessions() {
  const [{ data }] = useSessionsQuery({ variables: { limit: 10 } });
  return (
    <ol className="flex flex-col">
      {!data ? (
        <div>Loading...</div>
      ) : (
        data?.sessions.map((session) => (
          <li
            key={session.id}
            className="m-1 p-4 first:mt-2 last:mb-2 w-full rounded-md bg-slate-800"
          >
            <SessionCard session={session} />
          </li>
        ))
      )}
    </ol>
  );
}
