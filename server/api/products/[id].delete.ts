import { PrismaClient } from '@prisma/client'
import { logAudit, ACTION, ENTITY } from '~/server/utils/audit'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = parseInt(event.context.params?.id as string)
    const body = await readBody(event)
    const { password, username } = body

    if (!username) {
        throw createError({ statusCode: 400, statusMessage: 'Username required' })
    }

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user || user.password !== password) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid Password' })
    }

    if (user.role !== 'ADMIN') {
        throw createError({ statusCode: 403, statusMessage: 'Only Admins can delete products' })
    }

    try {
        // Get product to delete assets
        const product = await prisma.product.findUnique({ where: { id }, include: { documents: true } })

        if (product) {
            // Soft Delete: Set isActive to false
            // We DO NOT delete files anymore as per requirement

            await prisma.product.update({
                where: { id },
                data: { isActive: false }
            })

            // Audit Log
            await logAudit(ACTION.DELETE, ENTITY.PRODUCT, id, { name: product.name, type: 'SOFT_DELETE' }, username)
        }

        return { success: true }
    } catch (e) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to delete product' })
    }
})
