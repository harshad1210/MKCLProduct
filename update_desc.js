import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const longDescription = "This is a detailed description of the product that is definitely longer than one hundred and eight characters. We want to ensure that the read more button appears so that the user can click it and see the flip animation in action. This text serves as a placeholder for the actual product description which will be just as detailed and informative for the end user."

    // Update the first product found
    const product = await prisma.product.findFirst()

    if (!product) {
        console.log("No products found to update.")
        return
    }

    await prisma.product.update({
        where: { id: product.id },
        data: { description: longDescription }
    })

    console.log(`Updated product '${product.name}' with long description.`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
