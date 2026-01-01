
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load production env vars explicitly with override to ensure they win
const prodEnv = dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local'), override: true })

if (prodEnv.error) {
    console.warn("⚠️ Could not load .env.production.local")
}

// Do NOT load .env if we found prod env, or load it with override: false (default)
// But to be safe, let's just properly check what we have.

const prisma = new PrismaClient()

async function backup() {
    console.log('Starting Production Backup...')
    const dbUrl = process.env.DATABASE_URL || ''
    console.log('Database URL Protocol:', dbUrl.split(':')[0]) // Should be postgres or postgresql

    if (!dbUrl.startsWith('postgres') && !dbUrl.startsWith('prisma+postgres')) {
        console.error('❌ Error: DATABASE_URL does not look like Postgres! (' + dbUrl + ')')
        // Try to manually force it if it's in the parsed object but not in process.env for some reason
        if (prodEnv.parsed && prodEnv.parsed.DATABASE_URL) {
            process.env.DATABASE_URL = prodEnv.parsed.DATABASE_URL
            console.log('🔄 Forced DATABASE_URL from parsed file.')
        } else {
            // If still bad, exit
            process.exit(1)
        }
    }

    // Check Direct URL too
    if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
        process.env.DIRECT_URL = process.env.DATABASE_URL
        console.log('⚠️ DIRECT_URL missing, copied from DATABASE_URL')
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir)
    }

    try {
        const users = await prisma.user.findMany()
        // Explicitly select columns to avoid selecting 'isActive' which doesn't exist in Prod yet
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                url: true,
                logoUrl: true,
                createdAt: true,
                updatedAt: true
            }
        })
        const documents = await prisma.document.findMany()
        const assets = await prisma.siteAsset.findMany()
        let logs = []
        try {
            logs = await prisma.auditLog.findMany()
        } catch (e) {
            console.warn("⚠️ Could not fetch logs (Table likely missing in Prod):", e.message)
        }

        const backupData = {
            timestamp,
            counts: {
                users: users.length,
                products: products.length,
                documents: documents.length,
                assets: assets.length,
                logs: logs.length
            },
            data: {
                users,
                products,
                documents,
                assets,
                logs
            }
        }

        const fileName = `prod_backup_${timestamp}.json`
        const filePath = path.join(backupDir, fileName)

        fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2))
        console.log(`✅ Backup successful! Saved to: ${filePath}`)
        console.log('Summary:', backupData.counts)

    } catch (e) {
        console.error('❌ Backup Failed:', e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

backup()
