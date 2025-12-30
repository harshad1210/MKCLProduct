import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgres://5197ce0f2f061b1ded412aeaace8a40f097896a724310abea162dabdc121cb3c:sk_T4_BUJ8Sd8kY0tGHhCqy7@db.prisma.io:5432/postgres?sslmode=require"
        }
    }
})

async function backup() {
    console.log("Backing up Production Data...")
    try {
        const data = {
            products: await prisma.product.findMany({ include: { documents: true } }),
            users: await prisma.user.findMany(),
            auditLogs: await prisma.auditLog.findMany(),
            siteAssets: await prisma.siteAsset.findMany(),
            timestamp: new Date().toISOString()
        }

        fs.writeFileSync('d:/Antigravity/MKCLProduct_Backup_v5/production_data_snapshot.json', JSON.stringify(data, null, 2))
        console.log("Backup saved to d:/Antigravity/MKCLProduct_Backup_v5/production_data_snapshot.json")
    } catch (e) {
        console.error("Backup failed:", e)
    } finally {
        await prisma.$disconnect()
    }
}

backup()
