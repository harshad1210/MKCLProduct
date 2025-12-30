import { PrismaClient } from '@prisma/client'
import { logAudit, ACTION, ENTITY } from '~/server/utils/audit'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readMultipartFormData(event)
    if (!body) throw createError({ statusCode: 400, statusMessage: 'No data' })

    // Parse fields
    const fields: Record<string, string> = {}
    let logoFile = null

    for (const part of body) {
        if (part.name === 'logoFile') {
            logoFile = part
        } else if (part.name) {
            fields[part.name] = part.data.toString()
        }
    }

    // Handle Logo Upload
    let logoUrl = ''
    if (logoFile) {
        logoUrl = await saveFile(logoFile, 'images/logos')
    } else if (fields.url) {
        // Fallback: try to grab favicon or just use a placeholder logic if implemented
    }

    try {
        const product = await prisma.product.create({
            data: {
                name: fields.name,
                description: fields.description,
                url: fields.url,
                logoUrl: logoUrl || null
            }
        })

        // Audit Log
        const performedBy = fields.performedBy || 'admin'
        await logAudit(ACTION.CREATE, ENTITY.PRODUCT, product.id, { name: product.name }, performedBy)

        return product
    } catch (e: any) {
        console.error('Create Product Error:', e)
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to create product: ${e.message}`
        })
    }
})
