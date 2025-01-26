import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

/**
 * @swagger
 * components:
 *   schemas:
 *     Gadget:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         codename:
 *           type: string
 *         status:
 *           type: string
 *           enum: [AVAILABLE, DEPLOYED, DESTROYED, DECOMMISSIONED]
 *         decommissionedAt:
 *           type: string
 *           format: date-time
 *         missionSuccessProbability:
 *           type: number
 *     GadgetInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 */

const prisma = new PrismaClient();
const router = Router();

type Status = 'AVAILABLE' | 'DEPLOYED' | 'DESTROYED' | 'DECOMMISSIONED';
const Status = {
  AVAILABLE: 'AVAILABLE' as Status,
  DEPLOYED: 'DEPLOYED' as Status,
  DESTROYED: 'DESTROYED' as Status,
  DECOMMISSIONED: 'DECOMMISSIONED' as Status,
};

interface Gadget {
  id: string;
  name: string;
  codename: string;
  status: Status;
  decommissionedAt?: Date;
}

interface GadgetWithProbability extends Gadget {
  missionSuccessProbability: number;
}

const gadgetSchema = z.object({
  name: z.string().min(1),
});

const generateCodename = () => {
  const prefixes = ['The', 'Project', 'Operation'];
  const nouns = ['Nightingale', 'Kraken', 'Phoenix', 'Shadow', 'Ghost', 'Specter'];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}-${Math.floor(Math.random() * 1000)}`;
};

const generateMissionSuccessProbability = () => {
  return Math.floor(Math.random() * 41) + 60;
};

/**
 * @swagger
 * /gadgets:
 *   get:
 *     summary: Retrieve all gadgets
 *     tags: [Gadgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, DEPLOYED, DESTROYED, DECOMMISSIONED]
 *     responses:
 *       200:
 *         description: List of gadgets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Gadget'
 */
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const where: { status?: Status } = {};

    if (status && typeof status === 'string' && Object.values(Status).includes(status as Status)) {
      where.status = status as Status;
    }

    const gadgets = await prisma.gadget.findMany({ where });
    const gadgetsWithProbability: GadgetWithProbability[] = gadgets.map((gadget: Gadget) => ({
      ...gadget,
      missionSuccessProbability: generateMissionSuccessProbability(),
    }));

    res.json(gadgetsWithProbability);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve gadgets' });
  }
});

/**
 * @swagger
 * /gadgets:
 *   post:
 *     summary: Create a new gadget
 *     tags: [Gadgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GadgetInput'
 *     responses:
 *       201:
 *         description: Gadget created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gadget'
 */
router.post('/', async (req, res) => {
  try {
    const { name } = gadgetSchema.parse(req.body);
    const codename = generateCodename();

    const gadget = await prisma.gadget.create({
      data: {
        name,
        codename,
        status: Status.AVAILABLE,
      },
    });

    res.status(201).json(gadget);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create gadget' });
  }
});

/**
 * @swagger
 * /gadgets/{id}:
 *   patch:
 *     summary: Update a gadget
 *     tags: [Gadgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GadgetInput'
 *     responses:
 *       200:
 *         description: Gadget updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gadget'
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = gadgetSchema.partial().parse(req.body);

    const existingGadget = await prisma.gadget.findUnique({
      where: { id },
    });

    if (!existingGadget) {
      return res.status(404).json({ error: 'Gadget not found' });
    }

    const gadget = await prisma.gadget.update({
      where: { id },
      data: { name },
    });

    res.json(gadget);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update gadget' });
  }
});

/**
 * @swagger
 * /gadgets/{id}:
 *   delete:
 *     summary: Decommission a gadget
 *     tags: [Gadgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gadget decommissioned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gadget'
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingGadget = await prisma.gadget.findUnique({
      where: { id },
    });

    if (!existingGadget) {
      return res.status(404).json({ error: 'Gadget not found' });
    }

    const gadget = await prisma.gadget.update({
      where: { id },
      data: {
        status: Status.DECOMMISSIONED,
        decommissionedAt: new Date(),
      },
    });

    res.json(gadget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to decommission gadget' });
  }
});

/**
 * @swagger
 * /gadgets/{id}/self-destruct:
 *   post:
 *     summary: Trigger self-destruct sequence
 *     tags: [Gadgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - confirmationCode
 *             properties:
 *               confirmationCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Self-destruct sequence completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gadget'
 */
router.post('/:id/self-destruct', async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmationCode } = req.body;

    const existingGadget = await prisma.gadget.findUnique({
      where: { id },
    });

    if (!existingGadget) {
      return res.status(404).json({ error: 'Gadget not found' });
    }

    if (existingGadget.status === Status.DESTROYED) {
      return res.status(400).json({ error: 'Gadget is already destroyed' });
    }

    if (!confirmationCode) {
      const expectedCode = uuidv4().slice(0, 6);
      return res.json({ expectedCode });
    }

    if (!/^[0-9a-f]{6}$/.test(confirmationCode)) {
      return res.status(400).json({
        error: 'Invalid confirmation code format',
      });
    }

    const gadget = await prisma.gadget.update({
      where: { id },
      data: {
        status: Status.DESTROYED,
      },
    });

    res.json({
      message: 'Gadget self-destruct sequence completed',
      gadget,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute self-destruct sequence' });
  }
});

export const gadgetRoutes = router;
