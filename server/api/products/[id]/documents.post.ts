import { PrismaClient } from '@prisma/client'
import { logAudit, ACTION, ENTITY } from '~/server/utils/audit'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const productId = parseInt(event.context.params?.id as string)
    const body = await readMultipartFormData(event)
    if (!body) throw createError({ statusCode: 400, statusMessage: 'No data' })

    const fields: Record<string, string> = {}
    let docFile = null

    for (const part of body) {
        if (part.name === 'documentFile') {
            docFile = part
        } else if (part.name) {
            fields[part.name] = part.data.toString()
        }
    }

    // --- Validation Logic ---
    const type = fields.type
    if (!type) throw createError({ statusCode: 400, statusMessage: 'Document type is required' })

    const isUrlType = ['Product website', 'Product Demo'].includes(type)

    // URL Validation
    if (isUrlType) {
        if (docFile) throw createError({ statusCode: 400, statusMessage: 'File upload not allowed for this document type' })
        if (!fields.url) throw createError({ statusCode: 400, statusMessage: 'URL is required' })
    }
    // File Validation
    else {
        if (!docFile) throw createError({ statusCode: 400, statusMessage: 'File is required' })

        const mime = docFile.type
        let valid = false

        if (type === 'Product Presentation') {
            const allowed = [
                'application/pdf',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/vnd.ms-powerpoint.presentation.macroEnabled.12'
            ]
            if (allowed.includes(mime)) valid = true
        } else if (['Product Proposal', 'Draft Agreement'].includes(type)) {
            const allowed = [
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]
            if (allowed.includes(mime)) valid = true
        }

        if (!valid) {
            throw createError({
                statusCode: 400,
                statusMessage: `Invalid file type for ${type}. Allowed: ${type === 'Product Presentation' ? 'PPT, PPTX' : 'DOC, DOCX'}`
            })
        }

        // No size limit as per requirements
    }

    let fileUrl = fields.url || ''
    if (docFile) {
        fileUrl = await saveFile(docFile, 'documents')
    }

    try {
        const performedBy = fields.performedBy || 'Admin'

        const doc = await prisma.document.create({
            data: {
                productId,
                type: fields.type,
                name: fields.name || (docFile ? docFile.filename : 'Untitled'),
                url: fileUrl,
                uploadedBy: performedBy
            }
        })

        // Audit Log
        if (doc) {
            await logAudit(ACTION.UPLOAD, ENTITY.DOCUMENT, doc.id, { name: doc.name, productId }, performedBy)
        }

        return doc
    } catch (e: any) {
        console.error('Doc Upload Error:', e)
        throw createError({ statusCode: 500, statusMessage: `Failed to add document: ${e.message}` })
    }
})
