import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const ACTION = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    UPLOAD: 'UPLOAD',
    DOWNLOAD: 'DOWNLOAD',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT'
}

export const ENTITY = {
    PRODUCT: 'PRODUCT',
    DOCUMENT: 'DOCUMENT',
    USER: 'USER'
}

import { appendFile } from 'fs/promises'
import { join } from 'path'

export async function logAudit(
    action: string,
    entity: string,
    entityId: string | number | undefined,
    details: string | object | null,
    performedBy: string = 'admin'
) {
    try {
        const detailsStr = typeof details === 'object' && details !== null
            ? JSON.stringify(details)
            : String(details || '')

        // 1. DB Log
        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId: String(entityId),
                details: detailsStr,
                performedBy
            }
        })

        // 2. File Log
        const logEntry = `[${new Date().toISOString()}] [${action}] [${entity}] [${performedBy}] ID:${entityId} Details:${detailsStr}\n`
        const logPath = join(process.cwd(), 'server', 'logs', 'app.log')

        try {
            await appendFile(logPath, logEntry)
        } catch (fsError) {
            console.error('File Log Failed:', fsError)
            // Fallback or ignore if filesystem is read-only (e.g. some serverless envs)
        }

    } catch (e) {
        console.error('Audit Log Failed:', e)
    }
}
