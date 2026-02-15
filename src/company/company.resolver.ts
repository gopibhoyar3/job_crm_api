import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { CurrentUserPayload } from '../auth/current-user.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CompanyService } from './company.service';
import { CompanyGQL, CreateCompanyInput } from './company.types';

@Resolver(() => CompanyGQL)
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @Query(() => [CompanyGQL])
  @UseGuards(GqlAuthGuard)
  companies(@CurrentUser() user: CurrentUserPayload) {
    return this.companyService.companies(user.userId);
  }

  @Mutation(() => CompanyGQL)
  @UseGuards(GqlAuthGuard)
  createCompany(
    @CurrentUser() user: CurrentUserPayload,
    @Args('input') input: CreateCompanyInput,
  ) {
    return this.companyService.createCompany(user.userId, input.name, input.website);
  }
}
