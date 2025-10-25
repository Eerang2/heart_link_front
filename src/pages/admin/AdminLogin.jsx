import adminApi from '../../api/adminApi';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react'; // 빠졌던 import 추가

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await adminApi.post(
        '/admin/login',
        { email, password }
      );
      // 필요 시 localStorage 등 인증 상태 저장 가능
      navigate('/admin/dashboard');
    } catch (err) {
      alert('로그인 실패');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-bold text-center mb-4">관리자 로그인</h2>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          로그인
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
