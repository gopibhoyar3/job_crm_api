import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ApplicationStatus } from '@prisma/client';
import type { CurrentUserPayload } from '../auth/current-user.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { ApplicationService } from './application.service';
import {
  AddNoteInput,
  ApplicationConnection,
  ApplicationGQL,
  ApplicationsFilterInput,
  CreateApplicationInput,
  MoveStatusInput,
  NoteGQL,
} from './application.types';

@Resolver(() => ApplicationGQL)
export class ApplicationResolver {
  constructor(private readonly appService: ApplicationService) {}

  @Query(() => ApplicationGQL)
  @UseGuards(GqlAuthGuard)
  application(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.appService.getApplication(user.userId, id);
  }

  @Query(() => ApplicationConnection)
  @UseGuards(GqlAuthGuard)
  applicationsConnection(
    @Args('first', { type: () => Int }) first: number,
    @Args('after', { type: () => String, nullable: true }) after: string | undefined,
    @Args('filter', { type: () => ApplicationsFilterInput, nullable: true }) filter: ApplicationsFilterInput | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.appService.applicationsConnection(user.userId, first, after, filter);
  }

  @Mutation(() => ApplicationGQL)
  @UseGuards(GqlAuthGuard)
  createApplication(
    @Args('input') input: CreateApplicationInput,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.appService.createApplication(user.userId, input.jobId, input.sourceUrl);
  }

  @Mutation(() => ApplicationGQL)
  @UseGuards(GqlAuthGuard)
  moveApplicationStatus(@Args('input') input: MoveStatusInput, @CurrentUser() user: CurrentUserPayload) {
    return this.appService.moveStatus(user.userId, input.applicationId, input.status as ApplicationStatus);
  }

  @Mutation(() => NoteGQL)
  @UseGuards(GqlAuthGuard)
  addNote(@Args('input') input: AddNoteInput, @CurrentUser() user: CurrentUserPayload) {
    return this.appService.addNote(user.userId, input.applicationId, input.body);
  }
}
