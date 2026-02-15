import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { CurrentUserPayload } from '../auth/current-user.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { JobService } from './job.service';
import { CreateJobInput, JobGQL } from './job.types';

@Resolver(() => JobGQL)
export class JobResolver {
  constructor(private readonly jobService: JobService) {}

  @Query(() => [JobGQL])
  @UseGuards(GqlAuthGuard)
  jobs(
    @CurrentUser() user: CurrentUserPayload,
    @Args('companyId', { type: () => ID, nullable: true }) companyId?: string,
  ) {
    return this.jobService.jobs(user.userId, companyId);
  }

  @Mutation(() => JobGQL)
  @UseGuards(GqlAuthGuard)
  createJob(@CurrentUser() user: CurrentUserPayload, @Args('input') input: CreateJobInput) {
    return this.jobService.createJob(user.userId, input);
  }
}
