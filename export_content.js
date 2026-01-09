import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load Production Env
const envPath = path.resolve(process.cwd(), '.env.production.local')
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true })
    console.log("Loaded production environment.")
} else {
    console.warn("No .env.production.local found. falling back to default env.")
}

// Use standard client (we're running properly now)
const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Fetching data from database...")

        const assetsList = await prisma.siteAsset.findMany()
        const products = await prisma.product.findMany({
            where: { isActive: true },
            orderBy: [
                { displayOrder: 'asc' },
                { name: 'asc' }
            ]
        })

        // Convert assets array to object for easier access
        const assets = assetsList.reduce((acc, curr) => {
            acc[curr.key] = curr.value
            return acc
        }, {})

        const content = {
            generatedAt: new Date().toISOString(),
            note: "This file is a static export of the MKCL Product database.",
            assets,
            products
        }

        const outputPath = path.resolve(process.cwd(), 'content.json')
        fs.writeFileSync(outputPath, JSON.stringify(content, null, 2))

        console.log(`✅ content.json exported successfully to ${outputPath}`)
        console.log(`Contains ${products.length} products and ${assetsList.length} assets.`)

    } catch (e) {
        console.error("Export failed:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
