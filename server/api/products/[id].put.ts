import { PrismaClient } from '@prisma/client'
import { logAudit, ACTION, ENTITY } from '~/server/utils/audit'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = parseInt(event.context.params.id)
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

    const body = await readMultipartFormData(event)
    if (!body) throw createError({ statusCode: 400, statusMessage: 'No data' })

    const fields: Record<string, string> = {}
    let logoFile = null

    for (const part of body) {
        if (part.name === 'logoFile') {
            logoFile = part
        } else if (part.name) {
            fields[part.name] = part.data.toString()
        }
    }

    const updateData: any = {
        name: fields.name,
        description: fields.description,
        url: fields.url,
    }

    if (logoFile) {
        updateData.logoUrl = await saveFile(logoFile, 'images/logos')
    }

    try {
        const product = await prisma.product.update({
            where: { id },
            data: updateData
        })

        // Audit Log
        await logAudit(ACTION.UPDATE, ENTITY.PRODUCT, product.id, updateData, 'admin')

        return product
    } catch (e) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to update product' })
    }
})
