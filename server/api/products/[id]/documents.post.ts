import { PrismaClient } from '@prisma/client'
import { logAudit, ACTION, ENTITY } from '~/server/utils/audit'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const productId = parseInt(event.context.params?.id as string)
    const body = await readBody(event)

    if (!body) throw createError({ statusCode: 400, statusMessage: 'No data' })

    const { type, name, url, performedBy } = body

    // --- Validation Logic ---
    if (!type) throw createError({ statusCode: 400, statusMessage: 'Document type is required' })
    if (!url) throw createError({ statusCode: 400, statusMessage: 'URL is required' })

    const isUrlType = ['Product website', 'Product Demo'].includes(type)

    // Note: detailed mime-type validation is now handled during the Auth phase (auth.post.ts)
    // or by the client. The server receives the final signed URL.

    try {
        const uploader = performedBy || 'Admin'

        const doc = await prisma.document.create({
            data: {
                productId,
                type,
                name: name || 'Untitled',
                url: url,
                uploadedBy: uploader
            }
        })

        // Audit Log
        if (doc) {
            await logAudit(ACTION.UPLOAD, ENTITY.DOCUMENT, doc.id, { name: doc.name, productId }, uploader)
        }

        return doc
    } catch (e: any) {
        console.error('Doc Save Error:', e)
        throw createError({ statusCode: 500, statusMessage: `Failed to save document metadata: ${e.message}` })
    }
})
