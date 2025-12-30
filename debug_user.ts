
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function checkUser() {
    const user = await prisma.user.findUnique({
        where: { username: 'maahit' }
    })
    console.log('User Details:', user)
}

checkUser()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
