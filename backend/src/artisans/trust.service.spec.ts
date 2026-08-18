import { Test, TestingModule } from '@nestjs/testing';
import { TrustService } from './trust.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TrustService', () => {
  let service: TrustService;
  let prisma: any;

  const mockPrismaService = {
    artisan: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    trustEvent: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    artisanRankCache: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrustService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TrustService>(TrustService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('calculateTrustScore', () => {
    it('should throw NotFoundException if artisan does not exist', async () => {
      prisma.artisan.findUnique.mockResolvedValue(null);

      await expect(service.calculateTrustScore('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should calculate base trust score for a minimal unverified artisan', async () => {
      // Minimal artisan: no verification, no avatar, no bio, no location, no phone, no reviews.
      const mockArtisan = {
        id: 'artisan-1',
        profilePhoto: null,
        bio: null,
        county: null,
        town: null,
        phone: null,
        verification: null,
        reviews: [],
      };

      prisma.artisan.findUnique.mockResolvedValue(mockArtisan);
      prisma.artisan.update.mockResolvedValue(mockArtisan);
      prisma.trustEvent.deleteMany.mockResolvedValue({});
      prisma.trustEvent.createMany.mockResolvedValue({});

      const result = await service.calculateTrustScore('artisan-1');

      // Score should be 0 because all inputs are missing
      expect(result.trustScore).toBe(0);
      expect(result.profileCompletion).toBe(0);
      expect(prisma.artisan.update).toHaveBeenCalledWith({
        where: { id: 'artisan-1' },
        data: {
          verificationScore: 0,
          profileCompletion: 0,
        },
      });
    });

    it('should calculate correct score for a fully verified artisan with complete profile and reviews', async () => {
      // Fully complete profile fields (avatar, bio, location, phone) = 20 points
      // ID Verified = 40 points
      // Reviews: 10 reviews with 5.0 stars = 5.0 * 1.0 * 6 = 30 points
      // Experience: 10 completed jobs = 10 points
      // Total = 20 + 40 + 30 + 10 = 100 points
      const mockArtisan = {
        id: 'artisan-1',
        profilePhoto: 'avatar.png',
        bio: 'Expert plumber',
        county: 'Nairobi',
        town: 'Westlands',
        phone: '+254700000000',
        verification: {
          verificationStatus: 'VERIFIED',
        },
        reviews: Array.from({ length: 10 }, () => ({ rating: 5 })),
      };

      prisma.artisan.findUnique.mockResolvedValue(mockArtisan);
      prisma.artisan.update.mockResolvedValue(mockArtisan);
      prisma.trustEvent.deleteMany.mockResolvedValue({});
      prisma.trustEvent.createMany.mockResolvedValue({});

      const result = await service.calculateTrustScore('artisan-1');

      expect(result.trustScore).toBe(100);
      expect(result.profileCompletion).toBe(100);
    });

    it('should scale review points and completed jobs correctly under low volume', async () => {
      // Profile complete fields: 3 out of 4 (Avatar, Bio, Phone) = 15 points
      // Verification pending = 20 points
      // Reviews: 2 reviews with 4.0 stars avg = 4.0 * (2/10) * 6 = 4.8 points
      // Experience: 2 reviews = 2 points
      // Total: 15 + 20 + 4.8 + 2 = 41.8 points -> rounds to 41.8
      const mockArtisan = {
        id: 'artisan-1',
        profilePhoto: 'avatar.png',
        bio: 'Expert plumber',
        county: null,
        town: null,
        phone: '+254700000000',
        verification: {
          verificationStatus: 'PENDING',
        },
        reviews: [{ rating: 5 }, { rating: 3 }],
      };

      prisma.artisan.findUnique.mockResolvedValue(mockArtisan);
      prisma.artisan.update.mockResolvedValue(mockArtisan);
      prisma.trustEvent.deleteMany.mockResolvedValue({});
      prisma.trustEvent.createMany.mockResolvedValue({});

      const result = await service.calculateTrustScore('artisan-1');

      expect(result.trustScore).toBe(41.8);
      expect(result.profileCompletion).toBe(75);
    });
  });

  describe('recalculateRanks', () => {
    it('should assign percentile rank for town bucket size >= 10', async () => {
      // Create a pool of 10 plumbers in Westlands, Nairobi
      const mockArtisans = Array.from({ length: 10 }, (_, i) => ({
        id: `artisan-${i}`,
        skillCategoryId: 'plumber-cat-id',
        skill: 'Plumber',
        town: 'Westlands',
        county: 'Nairobi',
        profilePhoto: null,
        bio: null,
        phone: null,
        verification: null,
        reviews: Array.from({ length: i }, () => ({ rating: 5 })), // different review count to differentiate scores
      }));

      prisma.artisan.findMany.mockResolvedValue(mockArtisans);

      // Stub calculateTrustScore inside trust.service by mock findUnique response for each artisan
      mockArtisans.forEach((artisan, index) => {
        prisma.artisan.findUnique.mockResolvedValueOnce(artisan);
      });

      prisma.artisan.update.mockResolvedValue({});
      prisma.trustEvent.deleteMany.mockResolvedValue({});
      prisma.trustEvent.createMany.mockResolvedValue({});
      prisma.artisanRankCache.upsert.mockResolvedValue({});

      const result = await service.recalculateRanks();

      expect(result.count).toBe(10);

      // Let's verify that the upsert was called with town bucket format
      expect(prisma.artisanRankCache.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            resolvedBucket: 'Plumber-Westlands',
          }),
        }),
      );
    });

    it('should fall back to county bucket if town bucket has < 10 but county has >= 10', async () => {
      // 5 plumbers in Westlands, 5 plumbers in Kilimani (all in Nairobi county = 10 total)
      const mockArtisans = [
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `westlands-${i}`,
          skillCategoryId: 'plumber-cat-id',
          skill: 'Plumber',
          town: 'Westlands',
          county: 'Nairobi',
          profilePhoto: null,
          bio: null,
          phone: null,
          verification: null,
          reviews: [],
        })),
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `kilimani-${i}`,
          skillCategoryId: 'plumber-cat-id',
          skill: 'Plumber',
          town: 'Kilimani',
          county: 'Nairobi',
          profilePhoto: null,
          bio: null,
          phone: null,
          verification: null,
          reviews: [],
        })),
      ];

      prisma.artisan.findMany.mockResolvedValue(mockArtisans);
      mockArtisans.forEach((artisan) => {
        prisma.artisan.findUnique.mockResolvedValueOnce(artisan);
      });

      prisma.artisan.update.mockResolvedValue({});
      prisma.trustEvent.deleteMany.mockResolvedValue({});
      prisma.trustEvent.createMany.mockResolvedValue({});
      prisma.artisanRankCache.upsert.mockResolvedValue({});

      const result = await service.recalculateRanks();

      expect(result.count).toBe(10);

      // Verify it fell back to County
      expect(prisma.artisanRankCache.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            resolvedBucket: 'Plumber-Nairobi',
          }),
        }),
      );
    });

    it('should fall back to null percentile (rising badge) if county bucket also has < 10', async () => {
      // Only 3 plumbers in entire Mombasa county
      const mockArtisans = Array.from({ length: 3 }, (_, i) => ({
        id: `mombasa-${i}`,
        skillCategoryId: 'plumber-cat-id',
        skill: 'Plumber',
        town: 'Nyali',
        county: 'Mombasa',
        profilePhoto: null,
        bio: null,
        phone: null,
        verification: null,
        reviews: [],
      }));

      prisma.artisan.findMany.mockResolvedValue(mockArtisans);
      mockArtisans.forEach((artisan) => {
        prisma.artisan.findUnique.mockResolvedValueOnce(artisan);
      });

      prisma.artisan.update.mockResolvedValue({});
      prisma.trustEvent.deleteMany.mockResolvedValue({});
      prisma.trustEvent.createMany.mockResolvedValue({});
      prisma.artisanRankCache.upsert.mockResolvedValue({});

      const result = await service.recalculateRanks();

      expect(result.count).toBe(3);

      // Verify cachedPercentile is null
      expect(prisma.artisanRankCache.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            cachedPercentile: null,
            resolvedBucket: 'Plumber-Mombasa',
          }),
        }),
      );
    });
  });
});
