import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            orderBy: [
                { displayOrder: 'asc' },
                { name: 'asc' }
            ],
            include: { documents: true }
        })
        return products
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch products',
        })
    }
})
