import { PrismaClient } from '@prisma/client'
import { logAudit, ACTION, ENTITY } from '~/server/utils/audit'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { username, password } = body

        if (!username || !password) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Username and password are required',
            })
        }

        const user = await prisma.user.findUnique({
            where: { username },
        })

        // In a real app, verify hash. Here we compare plain text as per user instructions.
        // Verify password
        if (!user || user.password !== password) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Invalid credentials',
            })
        }

        // Check Status
        if (user.isActive === false) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Account is inactive. Please contact administrator.',
            })
        }

        // Log Login
        await logAudit(ACTION.LOGIN, ENTITY.USER, user.id, { username: user.username }, user.username)

        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                name: user.employeeName,
                role: user.role
            }
        }
    } catch (error: any) {
        console.error("LOGIN API CRASH:", error)
        // Rethrow known errors
        if (error.statusCode) throw error

        // Expose unknown errors for debugging (Temporary)
        throw createError({
            statusCode: 500,
            statusMessage: `Server Error: ${error.message}`
        })
    }
})
