import { useState, useEffect } from 'react'

const TOKEN_KEY = 'modulnas_upload_token'

export function useToken() {
    const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY) || '')

    const setToken = (val) => {
        const trimmed = val.trim()
        if (trimmed) {
            localStorage.setItem(TOKEN_KEY, trimmed)
        } else {
            localStorage.removeItem(TOKEN_KEY)
        }
        setTokenState(trimmed)
    }

    return [token, setToken]
}
