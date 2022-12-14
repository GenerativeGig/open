import {
  NoSymbolIcon,
  PencilIcon,
  SpeakerWaveIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { DISCORD_AUTH_URL } from "../constants";
import {
  Session,
  useCancelSessionMutation,
  useDeleteSessionMutation,
  useJoinSessionVoiceChannelMutation,
} from "../generated/graphql";
import { useIsAuthenticated } from "../utils/useIsAuthenticated";
import { JoinOrLeaveSession } from "./JoinOrLeaveSession";
import { TimeStatus } from "./TimeStatus";

export interface SessionDetailsButtonsProps {
  session: Session;
  isCreator: boolean;
}

export function SessionDetailsButtons({
  session,
  isCreator,
}: SessionDetailsButtonsProps) {
  useIsAuthenticated();

  const navigate = useNavigate();

  const [, cancelSession] = useCancelSessionMutation();
  const [, deleteSession] = useDeleteSessionMutation();
  const [, joinVoiceChannel] = useJoinSessionVoiceChannelMutation();

  const { id, isCancelled, actorIsPartOfSession, voiceChannelUrl, timeStatus } =
    session;

  const isPast = timeStatus === TimeStatus.PAST;

  return (
    <>
      {isCreator ? (
        <div>
          {!isCancelled && !isPast && (
            <button
              className="bg-rose-400 hover:bg-rose-300"
              onClick={async () => {
                const response = await cancelSession({ id });
                if (response.data?.cancelSession) {
                  navigate(0);
                }
              }}
            >
              <NoSymbolIcon className="h-6 w-6 inline" />
              Cancel
            </button>
          )}
          <button
            className="bg-red-500 hover:bg-red-400"
            onClick={async () => {
              const response = await deleteSession({ id });
              if (response.data?.deleteSession) {
                navigate("/sessions");
              }
            }}
          >
            <TrashIcon className="h-5 w-5 inline" />
            Delete
          </button>
          {!isCancelled && !isPast && (
            <Link to={`/session/${id}/edit`}>
              <button className="bg-yellow-500 hover:bg-yellow-400">
                <PencilIcon className="h-5 w-5 inline" />
                Edit
              </button>
            </Link>
          )}
        </div>
      ) : (
        <JoinOrLeaveSession session={session} />
      )}
      {actorIsPartOfSession && !isPast && voiceChannelUrl && (
        <button
          onClick={async () => {
            const response = await joinVoiceChannel({ id });
            if (!response.data?.joinSessionVoiceChannel) {
              if (DISCORD_AUTH_URL === "undefined") {
                console.error("DISCORD_AUTH_URL is undefined");
                return;
              }

              window.open(DISCORD_AUTH_URL);
            }

            const response2 = await joinVoiceChannel({ id });

            if (!response2.data?.joinSessionVoiceChannel) {
              console.error("Unable to join voice channel");
            }

            window.open(voiceChannelUrl);
          }}
          className="bg-[#5865F2] hover:bg-[#7983f2]"
        >
          <SpeakerWaveIcon className="w-6 h-6 inline" />
          Join Voice Channel
        </button>
      )}
    </>
  );
}

// TODO: What does it mean when it is cancelled? What can still be done?
// Can't join, edit or join voice channel (delete the voice channel) but the session lives on
// Comments can be made
// TODO: Add this logic to backend, how to not have to implement same logic in frontend and backend?

// Add field resolvers for permissions to Session/SessionComment
// List of Action Permissions UPDATE DELETE CANCEL JoinVoice Join Leave Session
// List of Action Permissions UPDATE DELETE SessionComment
// if Permission is not o

// On client only implement logic for when to show using one boolean
// On server return extra booleans if needed to make it easier on the client
