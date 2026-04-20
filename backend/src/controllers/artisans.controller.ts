import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const artisanSchema = z.object({
  userId: z.string(),
  skill: z.string().min(1),
  bio: z.string().optional(),
  location: z.string().min(1),
  experience: z.string().min(1),
  verified: z.boolean().optional(),
});

export const list = async (req: Request, res: Response) => {
  const { q, location } = req.query;
  const artisans = await prisma.artisan.findMany({
    where: {
      AND: [
        q ? { OR: [
          { skill: { contains: String(q), mode: "insensitive" } },
          { user: { name: { contains: String(q), mode: "insensitive" } } },
        ]} : {},
        location ? { location: { contains: String(location), mode: "insensitive" } } : {},
      ],
    },
    include: { user: { select: { name: true, email: true } }, _count: { select: { reviews: true } } },
  });
  res.json(artisans);
};

export const getById = async (req: Request, res: Response) => {
  const artisan = await prisma.artisan.findUnique({
    where: { id: req.params.id },
    include: { user: true, services: true, reviews: { include: { author: { select: { name: true } } } } },
  });
  if (!artisan) return res.status(404).json({ error: "Not found" });
  res.json(artisan);
};

export const create = async (req: Request, res: Response) => {
  const data = artisanSchema.parse(req.body);
  const artisan = await prisma.artisan.create({ data });
  res.status(201).json(artisan);
};

export const update = async (req: Request, res: Response) => {
  const data = artisanSchema.partial().parse(req.body);
  const artisan = await prisma.artisan.update({ where: { id: req.params.id }, data });
  res.json(artisan);
};

export const remove = async (req: Request, res: Response) => {
  await prisma.artisan.delete({ where: { id: req.params.id } });
  res.status(204).send();
};
