import axios from 'axios'

const api = axios.create({
    baseURL: 'https://nexo-backend-vrra.onrender.com'
})

export default api