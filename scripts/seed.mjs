import prisma from '../lib/prisma.mjs'
import bcrypt from 'bcryptjs'

async function seed() {
  const email = 'admin@billing.com'
  const existing = await prisma.user.findUnique({ where: { email } })
  if (!existing) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email,
        password: await bcrypt.hash('admin', 10),
      },
    })
    console.log('Admin user created:', email)
  } else {
    console.log('Admin user already exists')
  }
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
