import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Prisma keys:', Object.keys(prisma))
    // console.log('Prisma dmmf:', (prisma as any)._dmmf.datamodel)

    // Try accessing it safely
    if ('siteAsset' in prisma) {
        console.log('siteAsset exists on prisma')
    } else {
        console.log('siteAsset DOES NOT exist on prisma')
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
