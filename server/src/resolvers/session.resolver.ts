import { dataSource } from "../dataSource";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { Session } from "../entities/session.entity";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { ApolloContext } from "../types";

@InputType()
class SessionOptions {
  @Field()
  title: string;
  @Field()
  text: string;
  @Field()
  start: Date;
  @Field()
  end: Date;
  @Field()
  attendeeLimit: number;
}

@ObjectType()
class PaginatedSessions {
  @Field(() => [Session])
  sessions: Session[];
  @Field()
  hasMore: boolean;
}

@Resolver(Session)
export class SessionResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Session) {
    return root.text.slice(0, 50);
  }

  @Query(() => PaginatedSessions)
  async sessions(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedSessions> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const queryBuilder = dataSource
      .getRepository(Session)
      .createQueryBuilder("p")
      .orderBy('"createdAt"', "DESC")
      .take(realLimitPlusOne);

    if (cursor) {
      queryBuilder.where('"createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      });
    }

    const sessions = await queryBuilder.getMany();
    console.log({ sessions });
    return {
      sessions: sessions.slice(0, realLimit),
      hasMore: sessions.length === realLimitPlusOne,
    };
  }

  @Query(() => Session, { nullable: true })
  session(@Arg("id", () => Int) id: number): Promise<Session | null> {
    return Session.findOne({ where: { id } });
  }

  @Mutation(() => Session)
  @UseMiddleware(isAuthenticated)
  async createSession(
    @Arg("options") options: SessionOptions,
    @Ctx() { req }: ApolloContext
  ): Promise<Session> {
    return Session.create({
      ...options,
      creatorId: req.session.actorId,
    }).save();
  }

  @Mutation(() => Session)
  async updateSession(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String) title: string
  ): Promise<Session | null> {
    const session = await Session.findOne({ where: { id } });
    if (!session) {
      return null;
    }
    if (typeof title !== "undefined") {
      await Session.update({ id }, { title });
    }
    return session;
  }

  @Mutation(() => Boolean)
  async deleteSession(@Arg("id", () => Int) id: number): Promise<boolean> {
    await Session.delete(id);
    return true;
  }
}
