import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { StorageModule } from '../storage/storage.module';
import { VerificationModule } from '../verification/verification.module';

@Module({
  imports: [StorageModule, VerificationModule],
  providers: [PortfolioService],
  controllers: [PortfolioController],
  exports: [PortfolioService],
})
export class PortfolioModule {}
