import { Test, TestingModule } from '@nestjs/testing';
import { ProfileViewService } from './profile-view.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ProfileViewService', () => {
  let service: ProfileViewService;
  let prisma: any;

  const mockPrismaService = {
    artisan: {
      findUnique: jest.fn(),
    },
    profileView: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileViewService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProfileViewService>(ProfileViewService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('recordView', () => {
    it('should throw NotFoundException if artisan does not exist', async () => {
      prisma.artisan.findUnique.mockResolvedValue(null);

      await expect(
        service.recordView('non-existent', null, '127.0.0.1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should record unique view if no view within 24h exists', async () => {
      prisma.artisan.findUnique.mockResolvedValue({ id: 'artisan-1' });
      prisma.profileView.findFirst.mockResolvedValue(null);
      prisma.profileView.create.mockResolvedValue({ id: 'view-1' });

      const result = await service.recordView(
        'artisan-1',
        'user-123',
        '192.168.1.1',
      );

      expect(result.recorded).toBe(true);
      expect(prisma.profileView.create).toHaveBeenCalledWith({
        data: {
          artisanId: 'artisan-1',
          viewerId: 'user-123',
          viewerIp: '192.168.1.1',
        },
      });
    });

    it('should deduplicate view if same viewer/IP already viewed within 24h', async () => {
      prisma.artisan.findUnique.mockResolvedValue({ id: 'artisan-1' });
      prisma.profileView.findFirst.mockResolvedValue({ id: 'existing-view' });

      const result = await service.recordView(
        'artisan-1',
        'user-123',
        '192.168.1.1',
      );

      expect(result.recorded).toBe(false);
      expect(result.reason).toContain('Deduplicated');
      expect(prisma.profileView.create).not.toHaveBeenCalled();
    });
  });

  describe('getStats30Days', () => {
    it('should throw NotFoundException if artisan does not exist', async () => {
      prisma.artisan.findUnique.mockResolvedValue(null);

      await expect(service.getStats30Days('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should aggregate daily counts correctly for the last 30 days', async () => {
      prisma.artisan.findUnique.mockResolvedValue({ id: 'artisan-1' });

      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      prisma.profileView.findMany.mockResolvedValue([
        { viewedAt: today },
        { viewedAt: today },
        { viewedAt: yesterday },
      ]);

      const stats = await service.getStats30Days('artisan-1');

      expect(stats.totalViews).toBe(3);

      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const todayStat = stats.dailyViews.find((v) => v.date === todayStr);
      const yesterdayStat = stats.dailyViews.find(
        (v) => v.date === yesterdayStr,
      );

      expect(todayStat?.count).toBe(2);
      expect(yesterdayStat?.count).toBe(1);
      expect(stats.dailyViews.length).toBe(30);
    });
  });
});
