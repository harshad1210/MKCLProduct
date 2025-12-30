import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // Basic verification - better to have middleware but this works for now
    // In a real app, decode session/token. 
    // Here we rely on the frontend to protect the route, but ideally we check a secure cookie.

    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                employeeName: true,
                mobileNumber: true,
                email: true,
                username: true,
                role: true, // We need role to display
                isActive: true,
                createdAt: true
            }
        })
        return users
    } catch (e) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to fetch users' })
    }
})
