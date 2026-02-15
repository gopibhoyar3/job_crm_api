import { ApplicationStatus } from '@prisma/client';
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { JobGQL } from '../job/job.types';

registerEnumType(ApplicationStatus, { name: 'ApplicationStatus' });

@ObjectType()
export class NoteGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  body!: string;

  @Field(() => Date)
  createdAt!: Date;
}

@ObjectType()
export class ApplicationGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => ApplicationStatus)
  status!: ApplicationStatus;

  @Field(() => String, { nullable: true })
  sourceUrl?: string | null;

  @Field(() => Date)
  appliedAt!: Date;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => JobGQL)
  job!: JobGQL;

  @Field(() => [NoteGQL])
  notes!: NoteGQL[];
}

@InputType()
export class CreateApplicationInput {
  @Field(() => ID)
  jobId!: string;

  @Field(() => String, { nullable: true })
  sourceUrl?: string;
}

@InputType()
export class MoveStatusInput {
  @Field(() => ID)
  applicationId!: string;

  @Field(() => ApplicationStatus)
  status!: ApplicationStatus;
}

@InputType()
export class AddNoteInput {
  @Field(() => ID)
  applicationId!: string;

  @Field(() => String)
  body!: string;
}

@InputType()
export class ApplicationsFilterInput {
  @Field(() => [ApplicationStatus], { nullable: true })
  statuses?: ApplicationStatus[];

  @Field(() => ID, { nullable: true })
  companyId?: string;

  @Field(() => ID, { nullable: true })
  jobId?: string;

  @Field(() => String, { nullable: true })
  search?: string;
}

@ObjectType()
export class PageInfo {
  @Field(() => String, { nullable: true })
  endCursor?: string;

  @Field(() => Boolean)
  hasNextPage!: boolean;
}

@ObjectType()
export class ApplicationEdge {
  @Field(() => String)
  cursor!: string;

  @Field(() => ApplicationGQL)
  node!: ApplicationGQL;
}

@ObjectType()
export class ApplicationConnection {
  @Field(() => [ApplicationEdge])
  edges!: ApplicationEdge[];

  @Field(() => PageInfo)
  pageInfo!: PageInfo;
}

@InputType()
export class ApplicationsConnectionInput {
  @Field(() => Int)
  first!: number;

  @Field(() => String, { nullable: true })
  after?: string;

  @Field(() => ApplicationsFilterInput, { nullable: true })
  filter?: ApplicationsFilterInput;
}
