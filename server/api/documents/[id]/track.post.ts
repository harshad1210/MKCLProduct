import { PrismaClient } from '@prisma/client'
import { ACTION, ENTITY, logAudit } from '../../../utils/audit'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = parseInt(event.context.params?.id as string)
    const body = await readBody(event)
    const performedBy = body?.performedBy || 'Guest'

    if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

    try {
        const doc = await prisma.document.update({
            where: { id },
            data: {
                downloadCount: { increment: 1 }
            }
        })

        // Log Audit
        await logAudit(ACTION.DOWNLOAD, ENTITY.DOCUMENT, doc.id, { name: doc.name, count: doc.downloadCount }, performedBy)

        return { success: true, count: doc.downloadCount }
    } catch (e: any) {
        console.error('Download Track Error:', e)
        throw createError({ statusCode: 500, statusMessage: 'Failed to track download' })
    }
})
