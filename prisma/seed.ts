import { PrismaClient, Status } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding Gadgets...');

  const gadgets = Array.from({ length: 100 }, () => ({
    name: faker.commerce.productName(),
    codename: faker.string.alphanumeric(8).toUpperCase(),
    status: faker.helpers.arrayElement(Object.values(Status)),
    decommissionedAt: Math.random() > 0.7 ? faker.date.past() : null,
  }));

  for (const gadget of gadgets) {
    const result = await prisma.gadget.create({
      data: gadget,
    });
    console.log(`Created gadget with ID: ${result.id}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
