import axios from "axios"

export const baseUrl = import.meta.env.VITE_REACT_BACKEND_URL

export default axios.create({
    baseURL: baseUrl,
    withCredentials: true
})