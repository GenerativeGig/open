import { useNavigate } from "react-router-dom";
import {
  useJoinSessionMutation,
  useLeaveSessionMutation,
} from "../generated/graphql";
import { TimeStatus } from "./TimeStatus";

export interface JoinOrLeaveSessionProps {
  sessionId: number;
  attendeeLimit: number;
  numberOfAttendees: number;
  actorIsPartOfSession: boolean;
  timeStatus: string;
}

export function JoinOrLeaveSession({
  sessionId,
  attendeeLimit,
  numberOfAttendees,
  actorIsPartOfSession,
  timeStatus,
}: JoinOrLeaveSessionProps) {
  const navigate = useNavigate();

  const [, joinSession] = useJoinSessionMutation();
  const [, leaveSession] = useLeaveSessionMutation();

  const allowJoin = () => {
    const sessionHasSpots = numberOfAttendees < attendeeLimit;
    const isPast = timeStatus === TimeStatus.PAST;
    return !actorIsPartOfSession && sessionHasSpots && !isPast;
  };

  if (allowJoin()) {
    return (
      <button
        onClick={async () => {
          const response = await joinSession({ id: sessionId });
          if (response.data?.joinSession) {
            navigate(0);
          }
        }}
        className="bg-green-500 hover:bg-green-400"
      >
        Join
      </button>
    );
  }

  const allowLeave = () => {
    return actorIsPartOfSession;
  };

  if (allowLeave()) {
    return (
      <button
        onClick={async () => {
          const response = await leaveSession({ id: sessionId });
          if (response.data?.leaveSession) {
            navigate(0);
          }
        }}
        className="bg-red-500 hover:bg-red-400"
      >
        Leave
      </button>
    );
  }

  return <></>;
}

// TODO: put the logic from SessionCard/Details about not being the creator into the same
// validation file for checking if I am allowed to do a certain action
// or think about moving it to the backend