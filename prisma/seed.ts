import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Settings
  await prisma.settings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      companyName: 'Made Products',
      companyPhone: '+91 98765 43210',
      companyWhatsapp: '+919876543210',
      companyAddress: '123, Industrial Area, Phase 2\nCoimbatore, Tamil Nadu - 641001',
      shareFooter: 'For bulk orders & custom printing, contact us!\nMinimum order quantities apply.',
    },
  });

  // Categories
  const categories = [
    'Kraft Paper Bags',
    'White Kraft Paper Bags',
    'Twisted Handle Bags',
    'Flat Handle Bags',
    'Food Delivery Bags',
    'Shopping Bags',
    'Pharmacy Bags',
    'Garment Bags',
    'Custom Printed Bags',
    'Luxury Paper Bags',
  ];

  const createdCategories: Record<string, string> = {};
  for (const name of categories) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    createdCategories[name] = cat.id;
  }

  // Products
  const products = [
    {
      name: 'Classic Kraft Shopping Bag - Medium',
      category: 'Kraft Paper Bags',
      description: 'Sturdy natural kraft paper bag perfect for retail and grocery stores. Made from 100% recycled kraft paper.',
      width: 10, height: 12, gusset: 4,
      gsm: 100, material: 'Natural Kraft Paper',
      handleType: 'Twisted Handle', printingType: 'No Print',
      color: 'Natural Brown', moq: 500,
      priceSlabs: [
        { quantity: 500, price: 8.50 },
        { quantity: 1000, price: 7.90 },
        { quantity: 5000, price: 7.20 },
        { quantity: 10000, price: 6.80 },
      ]
    },
    {
      name: 'White Kraft Luxury Bag - Large',
      category: 'White Kraft Paper Bags',
      description: 'Premium white kraft paper bag ideal for boutiques and gift shops. Clean, elegant finish.',
      width: 12, height: 15, gusset: 5,
      gsm: 120, material: 'White Kraft Paper',
      handleType: 'Twisted Handle', printingType: 'Single Color',
      color: 'White', moq: 500,
      priceSlabs: [
        { quantity: 500, price: 11.50 },
        { quantity: 1000, price: 10.80 },
        { quantity: 5000, price: 9.90 },
        { quantity: 10000, price: 9.20 },
      ]
    },
    {
      name: 'Food Delivery Brown Bag',
      category: 'Food Delivery Bags',
      description: 'Grease-resistant kraft paper bag designed for food delivery. Keeps food warm and prevents leaks.',
      width: 8, height: 10, gusset: 5,
      gsm: 90, material: 'Grease-Resistant Kraft',
      handleType: 'No Handle', printingType: 'No Print',
      color: 'Natural Brown', moq: 1000,
      priceSlabs: [
        { quantity: 1000, price: 4.20 },
        { quantity: 5000, price: 3.80 },
        { quantity: 10000, price: 3.40 },
        { quantity: 50000, price: 3.00 },
      ]
    },
    {
      name: 'Pharmacy White Bag - Small',
      category: 'Pharmacy Bags',
      description: 'Clean white paper bag for pharmacies and medical stores. Available with custom printing.',
      width: 6, height: 9, gusset: 3,
      gsm: 80, material: 'White Bond Paper',
      handleType: 'No Handle', printingType: 'Single Color',
      color: 'White', moq: 1000,
      priceSlabs: [
        { quantity: 1000, price: 2.80 },
        { quantity: 5000, price: 2.40 },
        { quantity: 10000, price: 2.10 },
        { quantity: 50000, price: 1.85 },
      ]
    },
    {
      name: 'Garment Carry Bag - XL',
      category: 'Garment Bags',
      description: 'Extra large paper bag for garments and clothing stores. Reinforced bottom for heavy loads.',
      width: 14, height: 18, gusset: 6,
      gsm: 150, material: 'Heavy Kraft Paper',
      handleType: 'Flat Handle', printingType: 'Multi Color',
      color: 'White', moq: 300,
      priceSlabs: [
        { quantity: 300, price: 18.50 },
        { quantity: 500, price: 16.80 },
        { quantity: 1000, price: 15.20 },
        { quantity: 5000, price: 13.90 },
      ]
    },
    {
      name: 'Luxury Gift Bag - Premium',
      category: 'Luxury Paper Bags',
      description: 'High-end matte laminated paper bag with ribbon handle. Perfect for luxury retail and gifting.',
      width: 10, height: 13, gusset: 4,
      gsm: 210, material: 'Art Card with Matte Lamination',
      handleType: 'Ribbon Handle', printingType: 'CMYK + Foil',
      color: 'Black', moq: 200,
      priceSlabs: [
        { quantity: 200, price: 32.00 },
        { quantity: 500, price: 28.50 },
        { quantity: 1000, price: 25.80 },
        { quantity: 5000, price: 22.50 },
      ]
    },
    {
      name: 'Custom Printed Shopping Bag',
      category: 'Custom Printed Bags',
      description: 'Fully customizable shopping bag with your brand logo and design. Multiple color printing options.',
      width: 11, height: 14, gusset: 4,
      gsm: 130, material: 'White Kraft Paper',
      handleType: 'Twisted Handle', printingType: 'CMYK',
      color: 'Custom', moq: 500,
      priceSlabs: [
        { quantity: 500, price: 14.50 },
        { quantity: 1000, price: 13.20 },
        { quantity: 5000, price: 11.80 },
        { quantity: 10000, price: 10.50 },
      ]
    },
    {
      name: 'Flat Handle Boutique Bag',
      category: 'Flat Handle Bags',
      description: 'Elegant boutique bag with flat paper handles. Ideal for clothing stores and accessories.',
      width: 9, height: 12, gusset: 3,
      gsm: 140, material: 'Coated White Paper',
      handleType: 'Flat Handle', printingType: 'Two Color',
      color: 'White', moq: 500,
      priceSlabs: [
        { quantity: 500, price: 12.80 },
        { quantity: 1000, price: 11.50 },
        { quantity: 3000, price: 10.20 },
        { quantity: 5000, price: 9.50 },
      ]
    },
  ];

  for (const p of products) {
    const created = await prisma.product.create({
      data: {
        name: p.name,
        categoryId: createdCategories[p.category],
        description: p.description,
        width: p.width,
        height: p.height,
        gusset: p.gusset,
        gsm: p.gsm,
        material: p.material,
        handleType: p.handleType,
        moq: p.moq,
        images: {
          create: [{
            imageUrl: `https://placehold.co/600x600/f5f0e8/8B6914?text=${encodeURIComponent(p.name.split(' ').slice(0,2).join('+'))}`,
            sortOrder: 0
          }]
        },
        priceSlabs: {
          create: p.priceSlabs.map(slab => ({
            ...slab,
            printingType: p.printingType
          }))
        }
      }
    });
    console.log(`Created product: ${created.name}`);
  }

  console.log('Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
