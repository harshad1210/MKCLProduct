import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const assetsList = await prisma.siteAsset.findMany()
        const products = await prisma.product.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        })

        // Convert assets array to object for easier access
        const assets = assetsList.reduce((acc, curr) => {
            acc[curr.key] = curr.value
            return acc
        }, {} as Record<string, string>)

        return {
            assets,
            products
        }
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch content',
        })
    }
})
