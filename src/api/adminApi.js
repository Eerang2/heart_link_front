// src/api/adminApi.js
import axios from 'axios';

const adminApi = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // 환경변수 사용
  withCredentials: true, // ✅ 쿠키 전송 필수
});

export default adminApi;
