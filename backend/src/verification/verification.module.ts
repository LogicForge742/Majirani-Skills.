import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { ProfileCompletionService } from './profile-completion.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [VerificationService, ProfileCompletionService],
  controllers: [VerificationController],
  exports: [VerificationService, ProfileCompletionService],
})
export class VerificationModule {}
