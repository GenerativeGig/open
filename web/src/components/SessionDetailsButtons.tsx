import {
  NoSymbolIcon,
  PencilIcon,
  SpeakerWaveIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { DISCORD_CLIENT_ID } from "../constants";
import {
  Session,
  useCancelSessionMutation,
  useDeleteSessionMutation,
  useJoinSessionVoiceChannelMutation,
} from "../generated/graphql";
import { useIsAuthenticated } from "../utils/useIsAuthenticated";
import { JoinOrLeaveSession } from "./JoinOrLeaveSession";

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

  const { id, isRemote, isCancelled, actorIsPartOfSession, voiceChannelUrl } =
    session;

  return (
    <>
      {isCreator ? (
        <div>
          {!isCancelled && (
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
          <Link to={`/session/${id}/edit`}>
            <button className="bg-yellow-500 hover:bg-yellow-400">
              <PencilIcon className="h-5 w-5 inline" />
              Edit
            </button>
          </Link>
        </div>
      ) : (
        <JoinOrLeaveSession session={session} />
      )}
      {actorIsPartOfSession && isRemote && (
        <button
          onClick={async () => {
            const response = await joinVoiceChannel({ id });
            if (!response.data?.joinSessionVoiceChannel) {
              if (DISCORD_CLIENT_ID === "undefined") {
                console.error("DISCORD_CLIENT_ID is undefined");
                return;
              }

              window.location.replace(
                `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fdiscord-authorization&response_type=code&scope=identify`
              );
            }
            if (!voiceChannelUrl) {
              console.error("voiceChannelUrl is undefined");
              return;
            }
            window.location.replace(voiceChannelUrl);
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
// Add this logic to backend, how to not have to implement same logic in frontend and backend?
