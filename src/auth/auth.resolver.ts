import { UseGuards } from '@nestjs/common';
import { Args, Field, InputType, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { IsEmail, IsOptional, MinLength } from 'class-validator';
import type { CurrentUserPayload } from './current-user.decorator';
import { CurrentUser } from './current-user.decorator';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from './gql-auth.guard';

@ObjectType()
class AuthPayload {
  @Field(() => String)
  accessToken!: string;
}

@InputType()
class SignupInput {
  @Field(() => String)
  @IsEmail()
  email!: string;

  @Field(() => String)
  @MinLength(8)
  password!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  name?: string;
}

@InputType()
class LoginInput {
  @Field(() => String)
  @IsEmail()
  email!: string;

  @Field(() => String)
  password!: string;
}

@ObjectType()
class Me {
  @Field(() => String)
  userId!: string;

  @Field(() => String)
  email!: string;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => AuthPayload)
  signup(@Args('input') input: SignupInput): Promise<AuthPayload> {
    return this.auth.signup(input.email, input.password, input.name);
  }

  @Mutation(() => AuthPayload)
  login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.auth.login(input.email, input.password);
  }

  @Query(() => Me)
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: CurrentUserPayload): Me {
    return user;
  }
}
