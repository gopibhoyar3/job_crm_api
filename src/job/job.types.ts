import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { CompanyGQL } from '../company/company.types';

@ObjectType()
export class JobGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  location?: string | null;

  @Field(() => CompanyGQL)
  company!: CompanyGQL;

  @Field(() => Date)
  createdAt!: Date;
}

@InputType()
export class CreateJobInput {
  @Field(() => ID)
  companyId!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  location?: string;
}
