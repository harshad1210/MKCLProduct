import { PrismaClient } from '@prisma/client'
import { logAudit, ACTION, ENTITY } from '~/server/utils/audit'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = parseInt(event.context.params?.id as string)
    const body = await readBody(event)
    const { password, username } = body

    // Verify User Password
    if (!username) {
        throw createError({ statusCode: 400, statusMessage: 'Username required' })
    }

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user || user.password !== password) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid Password' })
    }

    // RBAC: If SPC, ensure they can delete? 
    // Requirement says "functionality should run fully". 
    // Assuming SPC can delete docs (it was not explicitly forbidden like User Mgmt).
    // If strict RBAC needed, check user.role here.

    try {
        const doc = await prisma.document.findUnique({ where: { id } })
        if (doc) {
            // Restriction: Only Uploader can delete
            if (doc.uploadedBy && doc.uploadedBy !== username) {
                throw createError({ statusCode: 403, statusMessage: 'Only the user who uploaded this document can delete it.' })
            }

            if (doc.url && !doc.url.startsWith('http')) {
                await deleteFile(doc.url)
            }
            await prisma.document.delete({ where: { id } })

            // Audit Log
            await logAudit(ACTION.DELETE, ENTITY.DOCUMENT, id, { name: doc.name }, username)
        }
        return { success: true }
    } catch (e) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to delete document' })
    }
})
