import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ActorSession } from "./actorSession.entity";
import { Session } from "./session.entity";
import { SessionComment } from "./sessionComment.entity";

@ObjectType()
@Entity()
export class Actor extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  lowerCaseName: string;

  @Field(() => String)
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Session, (session) => session.creator)
  createdSessions: Session[];

  @OneToMany(() => ActorSession, (actorSession) => actorSession.actor)
  sessionConnection: ActorSession[];

  @OneToMany(() => SessionComment, (sessionComment) => sessionComment.creator)
  createdComments: SessionComment[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
