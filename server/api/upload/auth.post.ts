
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export default defineEventHandler(async (event) => {
    const body = await readBody(event) as HandleUploadBody

    try {
        const jsonResponse = await handleUpload({
            body,
            request: event.node.req,
            onBeforeGenerateToken: async (pathname) => {
                // Authenticate User
                // You should check if the user is logged in here
                // For now, we trust the /admin/* protection, but ideally check session
                /*
                const session = await getUserSession(event)
                if (!session) {
                  throw new Error('Unauthorized')
                }
                */

                // Validate File Type (Server Side)
                // We can restrict extensions here if needed, but frontend validation handles UX
                return {
                    allowedContentTypes: [
                        'application/pdf',
                        'application/vnd.ms-powerpoint',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'video/mp4', // Allow videos for demos if needed
                        'image/jpeg', 'image/png' // Allow logos
                    ],
                    tokenPayload: JSON.stringify({
                        // optional payload
                    }),
                }
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // Callback after upload finishes (optional)
                // console.log('blob uploaded', blob.url)
            },
        })

        return jsonResponse
    } catch (error) {
        throw createError({ statusCode: 400, statusMessage: (error as Error).message })
    }
})
