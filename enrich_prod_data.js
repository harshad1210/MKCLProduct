// import { PrismaClient } from '@prisma/client'
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

const { PrismaClient } = await import('./prod-client/index.js')
const prisma = new PrismaClient()

async function fetchAndExtract(url) {
    try {
        console.log(`Fetching ${url}...`)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })
        clearTimeout(timeoutId)

        if (!res.ok) throw new Error(`Status ${res.status}`)

        const html = await res.text()

        // 1. Try Meta Description
        let description = ''
        const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i) ||
            html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i)

        if (metaMatch && metaMatch[1]) {
            description = metaMatch[1]
        }

        // 2. If short, try grabbing paragraphs
        if (!description || description.length < 100) {
            // Try to find main content areas first
            let textSource = html;
            const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
            if (mainMatch) textSource = mainMatch[1];

            const pMatches = [...textSource.matchAll(/<(p|div|li)[^>]*>([^<]+?)<\/\1>/gis)]
            let bodyText = pMatches.map(m => m[2].replace(/<[^>]+>/g, '').trim()) // Strip tags
                .filter(t => t.length > 60 && t.length < 500) // Filter short junk and huge blocks
                .join('. ')

            if (bodyText.length > description.length) {
                description = bodyText
            }
        }

        // Clean up entities (basic)
        description = description.replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ')
            .trim()

        return description.substring(0, 2000) // Limit to 2000 chars

    } catch (e) {
        console.error(`Failed to fetch ${url}:`, e.message)
        return null
    }
}

async function main() {
    const products = await prisma.product.findMany()

    console.log(`Found ${products.length} products to check.`)

    for (const p of products) {
        if (!p.url || p.url.length < 5) {
            console.log(`Skipping ${p.name} (No URL)`)
            continue
        }

        // Skip if description is already long (assume manual or already enriched)
        // Exception: the generic one "Innovative solution..."
        if (p.description.length > 150 && !p.description.startsWith("Innovative solution")) {
            console.log(`Skipping ${p.name} (Already has description)`)
            continue
        }

        const newDesc = await fetchAndExtract(p.url)

        if (newDesc && newDesc.length > 50) {
            await prisma.product.update({
                where: { id: p.id },
                data: { description: newDesc }
            })
            console.log(`✅ Updated ${p.name}: ${newDesc.substring(0, 50)}...`)
        } else {
            console.log(`⚠️ Could not find good description for ${p.name}, keeping existing.`)
        }

        // Be nice to servers
        await new Promise(r => setTimeout(r, 500))
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
