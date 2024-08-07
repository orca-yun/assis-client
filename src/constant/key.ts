import { getStorageWithKey, setStorageWithKey, removeStorageWithKey } from '@/utils/storage'

export const ORCA_ASS_TOKEN = 'orca-ass-token'

export const getToken = (roomId: number) => getStorageWithKey(ORCA_ASS_TOKEN, roomId)
export const setToken = (roomId: number, token: string) => setStorageWithKey(ORCA_ASS_TOKEN, { [roomId]: token })
export const clearToken = (roomId: number) => removeStorageWithKey(ORCA_ASS_TOKEN, roomId)

export const ROBOT_MSG_HISTORY = 'orca-robot-msg'
