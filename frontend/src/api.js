import axios from 'axios'

const API = axios.create({
  baseURL: 'https://project-management-tool-61ph.onrender.com',
})

export default API