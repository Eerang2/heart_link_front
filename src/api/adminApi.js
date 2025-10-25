// src/api/adminApi.js
import axios from 'axios';

const adminApi = axios.create({
  baseURL: 'http://localhost:8080', // 또는 nginx 프록시 사용
  withCredentials: true, // ✅ 쿠키 전송 필수
});

export default adminApi;
