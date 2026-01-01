import { PrismaClient } from '@prisma/client'
import { logAudit, ACTION, ENTITY } from '~/server/utils/audit'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { items, username } = body

    if (!items || !Array.isArray(items)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid Items' })
    }

    // We can update them in a transaction or loop. 
    // Transaction is safer but SQLite has limitations with many updates in transaction if not careful?
    // Actually $transaction is fine.

    try {
        const updates = items.map((item: any) =>
            prisma.product.update({
                where: { id: item.id },
                data: { displayOrder: item.displayOrder }
            })
        )

        await prisma.$transaction(updates)

        if (username) {
            await logAudit(ACTION.UPDATE, ENTITY.PRODUCT, 0, { type: 'REORDER', count: items.length }, username)
        }

        return { success: true }
    } catch (e) {
        console.error(e)
        throw createError({ statusCode: 500, statusMessage: 'Failed to reorder products' })
    }
})
