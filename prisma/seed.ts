import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create users
  await prisma.user.createMany({
    data: [
      { name: 'Nick Fury', email: 'nick@shield.com', password: 'password123', role: 'ADMIN', country: 'America' },
      { name: 'Captain Marvel', email: 'marvel@shield.com', password: 'password123', role: 'MANAGER', country: 'India' },
      { name: 'Captain America', email: 'america@shield.com', password: 'password123', role: 'MANAGER', country: 'America' },
      { name: 'Thanos', email: 'thanos@shield.com', password: 'password123', role: 'MEMBER', country: 'India' },
      { name: 'Thor', email: 'thor@shield.com', password: 'password123', role: 'MEMBER', country: 'India' },
      { name: 'Travis', email: 'travis@shield.com', password: 'password123', role: 'MEMBER', country: 'America' },
    ]
  })

  // Create restaurants
  const r1 = await prisma.restaurant.create({
    data: { name: 'Burger Palace', cuisine: 'American', country: 'America' }
  })
  const r2 = await prisma.restaurant.create({
    data: { name: 'Pizza Hub', cuisine: 'Italian', country: 'America' }
  })
  const r3 = await prisma.restaurant.create({
    data: { name: 'Spice Garden', cuisine: 'Indian', country: 'India' }
  })
  const r4 = await prisma.restaurant.create({
    data: { name: 'Curry House', cuisine: 'Indian', country: 'India' }
  })

  // Create menu items
  await prisma.menuItem.createMany({
    data: [
      { name: 'Classic Burger', price: 9.99, description: 'Juicy beef burger', restaurantId: r1.id },
      { name: 'Cheese Burger', price: 11.99, description: 'With extra cheese', restaurantId: r1.id },
      { name: 'Margherita Pizza', price: 12.99, description: 'Classic tomato & cheese', restaurantId: r2.id },
      { name: 'Pepperoni Pizza', price: 14.99, description: 'With pepperoni', restaurantId: r2.id },
      { name: 'Butter Chicken', price: 13.99, description: 'Creamy tomato sauce', restaurantId: r3.id },
      { name: 'Paneer Tikka', price: 11.99, description: 'Grilled cottage cheese', restaurantId: r3.id },
      { name: 'Biryani', price: 12.99, description: 'Fragrant rice dish', restaurantId: r4.id },
      { name: 'Dal Makhani', price: 9.99, description: 'Creamy lentils', restaurantId: r4.id },
    ]
  })

  console.log('✅ Database seeded successfully!')
}

main().catch(console.error).finally(() => prisma.$disconnect())