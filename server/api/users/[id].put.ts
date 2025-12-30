import { PrismaClient } from '@prisma/client'
import { logAudit, ACTION, ENTITY } from '~/server/utils/audit'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = parseInt(event.context.params?.id as string)
    const body = await readBody(event)
    const { employeeName, mobileNumber, email, username, password, role, performedBy } = body

    try {
        const updateData: any = {
            employeeName,
            mobileNumber,
            email,
            username,
            role,
            updatedBy: performedBy || 'admin'
        }

        // Handle Status Toggle specifically
        if (typeof body.isActive === 'boolean') {
            // Protection: Cannot deactivate 'admin'
            if (username?.toLowerCase() === 'admin' && body.isActive === false) {
                throw createError({ statusCode: 403, statusMessage: 'The default admin user cannot be deactivated.' })
            }
            updateData.isActive = body.isActive
        }

        if (password) {
            updateData.password = password
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        })

        // Audit Log
        await logAudit(ACTION.UPDATE, ENTITY.USER, user.id, { username: user.username }, performedBy || 'admin')

        return user
    } catch (e) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to update user' })
    }
})
