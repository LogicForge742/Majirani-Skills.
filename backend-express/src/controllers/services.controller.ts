import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const serviceSchema = z.object({
  artisanId: z.string(),
  title: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
});

export const list = async (req: Request, res: Response) => {
  const { category } = req.query;
  const services = await prisma.service.findMany({
    where: category ? { category: String(category) } : undefined,
    include: { artisan: { include: { user: { select: { name: true } } } } },
  });
  res.json(services);
};

export const getById = async (req: Request, res: Response) => {
  const service = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!service) return res.status(404).json({ error: "Not found" });
  res.json(service);
};

export const create = async (req: Request, res: Response) => {
  const data = serviceSchema.parse(req.body);
  const service = await prisma.service.create({ data });
  res.status(201).json(service);
};

export const update = async (req: Request, res: Response) => {
  const data = serviceSchema.partial().parse(req.body);
  const service = await prisma.service.update({ where: { id: req.params.id }, data });
  res.json(service);
};

export const remove = async (req: Request, res: Response) => {
  await prisma.service.delete({ where: { id: req.params.id } });
  res.status(204).send();
};
