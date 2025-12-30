import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { put, del } from '@vercel/blob'

export async function saveFile(file: any, folder: string = 'uploads'): Promise<string> {
    const filename = `${randomUUID()}-${file.filename}`

    if (process.env.NODE_ENV === 'production') {
        const blob = await put(filename, file.data, { access: 'public' })
        return blob.url
    } else {
        const uploadDir = path.join(process.cwd(), 'public', folder)
        await fs.mkdir(uploadDir, { recursive: true })
        const filePath = path.join(uploadDir, filename)
        await fs.writeFile(filePath, file.data)
        return `/${folder}/${filename}`
    }
}

export async function deleteFile(fileUrl: string) {
    if (!fileUrl) return
    try {
        if (fileUrl.startsWith('http')) {
            await del(fileUrl)
        } else {
            const filePath = path.join(process.cwd(), 'public', fileUrl)
            await fs.unlink(filePath)
        }
    } catch (e) {
        // Ignore if file missing or delete fails
        console.error('Delete file error:', e)
    }
}
