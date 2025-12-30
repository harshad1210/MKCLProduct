import { PrismaClient } from '@prisma/client'
import { logAudit, ACTION, ENTITY } from '~/server/utils/audit'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { employeeName, mobileNumber, email, username, password, role, performedBy } = body

    // Validation
    if (!employeeName || !username || !password || !role || !mobileNumber || !email) {
        throw createError({ statusCode: 400, statusMessage: 'All fields are mandatory' })
    }

    // Strict Validation
    if (!/^[a-zA-Z\s]{5,}$/.test(employeeName)) throw createError({ statusCode: 400, statusMessage: 'Name must be min 5 alphabets' })
    if (username.length < 5) throw createError({ statusCode: 400, statusMessage: 'Username must be min 5 chars' })
    if (!/^[0-9]{10}$/.test(mobileNumber)) throw createError({ statusCode: 400, statusMessage: 'Mobile must be 10 digits' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw createError({ statusCode: 400, statusMessage: 'Invalid email format' })

    try {
        const user = await prisma.user.create({
            data: {
                employeeName,
                mobileNumber: mobileNumber || '',
                email: email || '',
                username,
                password, // Note: Should be hashed in prod
                role,
                updatedBy: performedBy || 'admin'
            }
        })

        // Audit Log
        await logAudit(ACTION.CREATE, ENTITY.USER, user.id, { username: user.username, role: user.role }, performedBy || 'admin')

        return user
    } catch (e: any) {
        if (e.code === 'P2002') {
            throw createError({ statusCode: 409, statusMessage: 'Username or Email already exists' })
        }
        throw createError({ statusCode: 500, statusMessage: 'Failed to create user' })
    }
})
