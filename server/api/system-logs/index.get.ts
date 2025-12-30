import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // Default: Last 5 days
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)

    try {
        const logs = await prisma.auditLog.findMany({
            where: {
                timestamp: {
                    gte: fiveDaysAgo
                }
            },
            orderBy: {
                timestamp: 'desc'
            }
        })
        return logs
    } catch (e) {
        console.error("Logs Fetch Error:", e)
        throw createError({ statusCode: 500, statusMessage: 'Failed to fetch logs' })
    }
})
