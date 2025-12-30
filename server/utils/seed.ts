import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // 1. Seed Site Assets (Unchanged)
    const assets = [
        { key: 'hero_bg', value: '/images/hero-bg.png' },
        { key: 'header_logo', value: '/images/mkcl-official.png' },
    ]
    for (const asset of assets) {
        await prisma.siteAsset.upsert({
            where: { key: asset.key },
            update: { value: asset.value },
            create: asset,
        })
    }

    // 2. Seed Products
    // List of 32 Products
    const products = [
        { name: 'MS-CIT Course', url: 'https://mscit.mkcl.org/', logo: '/images/logos/ms_cit.jpg' },
        { name: 'KLiC Courses', url: 'https://klic.mkcl.org/', logo: '/images/logos/klic_courses.jpg' },
        { name: 'MS-ACIT IT For Teachers Course', url: 'https://msacit.mkcl.org/', logo: '/images/logos/ms_acit.jpg' },
        { name: 'MKCL Olympiad Movement', url: 'https://mom.mkcl.org/', logo: '/images/logos/mom.jpg' },
        { name: 'MS-CIT Refresh Course', url: 'https://www.mkcl.org/mscit-refresh', logo: '/images/logos/mscit_refresh.jpg' },
        { name: 'CCTP Offerings', url: 'https://cctp.mkcl.org/', logo: '/images/logos/cctp.png' },
        { name: 'Mastering', url: 'https://mastering.mkcl.org/', logo: '/images/logos/mastering.png' },
        { name: 'Easy', url: 'https://mkcl.org', logo: '/images/logos/easy.png' },
        { name: 'Futurevedh', url: 'https://cit.mkcl.org/', logo: '/images/logos/futurevedh.jpg' },
        { name: 'Mastering Competitive Exams', url: 'https://mastering.mkcl.org/', logo: '/images/logos/mastering.png' },
        { name: 'RecruitLive', url: 'https://recruitlive.mkcl.org/', logo: '/images/logos/recruitlive.png' },
        { name: 'RecruitLive (Centralised Portal)', url: 'https://recruitlive.mkcl.org/', logo: '/images/logos/recruitlive.png' },
        { name: 'AuctionLive', url: 'https://mkcl.org/e-governance/e-auction', logo: '/images/logos/eauction.jpg' },
        { name: 'TenderLive', url: 'http://mkclnew.sets.co.in', logo: '/images/logos/tenderlive.jpg' },
        { name: 'LegisLive', url: 'https://legislive.mkcl.org/', logo: '/images/logos/legislive.png' },
        { name: 'VanMitra', url: 'https://mpvanmitra.mkcl.org', logo: '/images/logos/vanmitra.png' },
        { name: 'Digitalisation', url: 'https://mkcl.org', logo: '/images/logos/default.jpg' },
        { name: 'DEEP', url: 'https://deep.mkcl.org/', logo: '/images/logos/deep.png' },
        // Duplicate DEEP skipped or named differently? User listed it twice. I'll add it twice if they insisted on "these 32".
        { name: 'DEEP (Duplicate)', url: 'https://deep.mkcl.org/', logo: '/images/logos/deep.png' },
        { name: 'SDMMS', url: 'https://skilldevelopment.mkcl.org/', logo: '/images/logos/sdmms.jpg' },
        { name: 'iLike', url: 'https://ilike.mkcl.org/', logo: '/images/logos/ilike_brand.png' },
        { name: 'ExamLive', url: 'https://examlive.org/', logo: '/images/logos/examlive.jpg' },
        { name: 'MKCL’s Tilimili for Students', url: 'https://mkcl.org', logo: '/images/logos/tilimili.jpg' },
        { name: 'MKCL’s Tilimili for Teachers', url: 'https://mkcl.org', logo: '/images/logos/tilimili.jpg' },
        { name: 'SSC and HSC AI based Practice tests', url: 'https://mkcl.org', logo: '/images/logos/default.jpg' },
        { name: 'Vikasghar', url: 'https://mkcl.org', logo: '/images/logos/default.jpg' },
        { name: 'MKCL as a CSR Implementation Agency', url: 'https://mkcl.org/csr', logo: '/images/logos/default.jpg' },
        { name: 'iLike Courses', url: 'https://ilike.mkcl.org/', logo: '/images/logos/ilike.png' },
        { name: 'Digital University', url: 'https://digitalcollege.mkcl.org/', logo: '/images/logos/digital_university.jpg' },
        { name: 'CampusLive', url: 'https://campuslive.co.in/', logo: '/images/logos/campuslive.png' },
        { name: 'LearnLive', url: 'https://learnlive.mkcl.org/', logo: '/images/logos/learnlive.png' },
        { name: 'Work-based Degree Programs', url: 'https://mkcl.org/work-based-degree', logo: '/images/logos/work_based.jpg' }
    ]

    // Clear existing products to ensure clean slate (idempotent)
    await prisma.product.deleteMany()

    for (const p of products) {
        await prisma.product.create({
            data: {
                name: p.name,
                description: 'Innovative solution by MKCL', // Placeholder
                url: p.url,
                logoUrl: p.logo
            }
        })
    }

    console.log(`Seeded ${products.length} products.`)

    // Seed Admin User
    const adminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            employeeName: 'Harshad Tidake',
            mobileNumber: '9209039100',
            email: 'harshadt@mkcl.org',
            username: 'admin',
            password: 'password123', // In production, hash this!
            role: 'ADMIN',
            updatedBy: 'system'
        }
    })
    console.log('Seeded Admin User:', adminUser.username)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
