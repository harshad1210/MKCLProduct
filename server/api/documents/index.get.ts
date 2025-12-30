import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // Return all documents with product info
    const docs = await prisma.document.findMany({
        include: { product: true },
        orderBy: { createdAt: 'desc' }
    })
    return docs
})
