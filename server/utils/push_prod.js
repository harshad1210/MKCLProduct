import dotenv from 'dotenv'
import path from 'path'
import { execSync } from 'child_process'

const envPath = path.resolve(process.cwd(), '.env.production.local')
const config = dotenv.config({ path: envPath, override: true })

if (!config.parsed) {
    console.error("Could not load .env.production.local")
    process.exit(1)
}

// Ensure critical vars are set
if (!process.env.DATABASE_URL && config.parsed.DATABASE_URL) {
    process.env.DATABASE_URL = config.parsed.DATABASE_URL
}
if (!process.env.DIRECT_URL) {
    process.env.DIRECT_URL = config.parsed.DIRECT_URL || config.parsed.DATABASE_URL
}

console.log("Pushing Schema to Prod DB...")
console.log("Using Database:", process.env.DATABASE_URL.split('@')[1]) // Safe log

try {
    execSync('npx.cmd prisma db push --schema=prisma/schema.prisma', { stdio: 'inherit', env: process.env })
} catch (e) {
    console.error("Schema Push Failed")
    process.exit(1)
}
