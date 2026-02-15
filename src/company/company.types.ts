import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

@ObjectType()
export class CompanyGQL {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  website?: string | null;

  @Field(() => Date)
  createdAt!: Date;
}

@InputType()
export class CreateCompanyInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  website?: string;
}
