// eslint-disable-next-line @typescript-eslint/no-unused-vars
import expressSession from "express-session";

declare module "express-session" {
  interface SessionData {
    actorId?: number;
  }
}
