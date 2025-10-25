import React, {useEffect} from 'react';
import {Routes, Route, useLocation, Navigate} from 'react-router-dom';

import StartPage from '../pages/StartPage';
import SignupPage from '../pages/SignupPage';
import MainPage from '../pages/MainPage';
import TermsAgree from '../pages/TermsAgree';
import NaverCallback from '../pages/NaverCallback';  // 추가
import MyPage from '../pages/MyPage';
import CommunityList from '../pages/community/CommunityList';
import CommunityWrite from '../pages/community/CommunityWrite';
import CommunityEdit from '../pages/community/CommunityEdit';
// import CommunityDetail from '../pages/community/CommunityDetail';
import Chatting from '../pages/Chatting';
import Header from '../components/Header';
import Footer from '../components/Footer'; // 🔥 추가
import MatchingRandom from '../pages/RandomMatching'; // 🔥 추가
import api from "../api/axiosInstance";
import Location from "../pages/Location";
import NoticeList from '../pages/NoticeList';
import NoticeDetail from '../pages/NoticeDetail';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminRoutes from "./admin/adminRoutes";
import FeedbackForm from "../pages/FeedbackModal";
import { tokenStore } from "../context/tokenStore";
import AboutPage from "../pages/introduc";

const RootRedirect = () => {
  const hasToken = !!tokenStore.getAccess();
  return hasToken ? <Navigate to="/main" replace /> : <StartPage />;
};

const AppRoutes = () => {

  const location = useLocation();
  const showPaths = ['/main', '/mypage','/random/matching', '/communityList','/communityWrite','/communityDetail','/communityEdit','/chatting', "/about"];
  const shouldShow = showPaths.includes(location.pathname);

  useEffect(() => {
    if (!tokenStore.getAccess()) return;
    api.get("/api/on/ping").catch(() => {}); // 어차피 인터셉터가 처리
  }, []);
  return (
    <>
      {shouldShow && <Header />}

      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/location" element={<Location />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/communityList" element={<CommunityList />} />
        <Route path="/communityWrite" element={<CommunityWrite />} />
        <Route path="/community/edit/:id" element={<CommunityEdit />} />
        <Route path="/chatting" element={<Chatting />} />
        <Route path="/random/matching" element={<MatchingRandom />} />
          <Route path="/naver/callback" element={<NaverCallback />} />
          <Route path="/member/termsAgree" element={<TermsAgree />} />
        <Route path="/notices" element={<NoticeList />} />
        <Route path="/notices/:id" element={<NoticeDetail />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/admin/login" element={<AdminLogin/>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>

      {shouldShow && <Footer />}
    </>
  );
};

export default AppRoutes;
