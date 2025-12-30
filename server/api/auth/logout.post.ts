import { logAudit, ACTION, ENTITY } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { username, userId } = body

    if (username) {
        await logAudit(ACTION.LOGOUT, ENTITY.USER, userId, { username }, username)
    }

    return { success: true }
})
