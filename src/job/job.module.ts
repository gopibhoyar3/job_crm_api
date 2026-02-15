import { Module } from '@nestjs/common';
import { JobResolver } from './job.resolver';
import { JobService } from './job.service';

@Module({
  providers: [JobResolver, JobService],
  exports: [JobService],
})
export class JobModule {}
