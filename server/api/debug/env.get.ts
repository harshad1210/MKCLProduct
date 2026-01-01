
export default defineEventHandler((event) => {
    // SECURITY: Do not return actual values, only boolean status
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN
    const nodeEnv = process.env.NODE_ENV

    return {
        status: 'ok',
        env: {
            NODE_ENV: nodeEnv,
            HAS_BLOB_TOKEN: hasBlobToken
        },
        timestamp: new Date().toISOString()
    }
})
