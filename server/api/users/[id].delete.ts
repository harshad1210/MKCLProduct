import { PrismaClient } from '@prisma/client'
import { logAudit, ACTION, ENTITY } from '~/server/utils/audit'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    throw createError({ statusCode: 405, statusMessage: 'Hard deletion is disabled. Please deactivate the user instead.' })
})
