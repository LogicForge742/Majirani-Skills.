import { Module } from '@nestjs/common';
import { ArtisansService } from './artisans.service';
import { ArtisansController } from './artisans.controller';
import { TrustService } from './trust.service';
import { ProfileViewService } from './profile-view.service';

@Module({
  providers: [ArtisansService, TrustService, ProfileViewService],
  controllers: [ArtisansController],
  exports: [ArtisansService, TrustService, ProfileViewService],
})
export class ArtisansModule {}
