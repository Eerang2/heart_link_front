import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import "../../styles/admin/NoticeForm.css";

const MAX_CONTENT = 1000;

const NoticeForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = !!id;
  const isOver = useMemo(() => content.length > MAX_CONTENT, [content]);

  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      try {
        const res = await adminApi.get(`/notices/${id}`);
        setTitle(res.data.title ?? '');
        setContent(res.data.content ?? '');
      } catch {
        alert('공지사항을 불러오지 못했습니다.');
      }
    })();
  }, [id, isEditMode]);

  const submitNotice = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('제목을 입력해주세요.');
    if (!content.trim()) return alert('내용을 입력해주세요.');
    if (isOver) return alert(`내용은 ${MAX_CONTENT}자를 넘길 수 없습니다.`);

    try {
      if (isEditMode) {
        await adminApi.patch(`/notices/${id}`, { title, content });
        alert('공지사항 수정 성공');
      } else {
        await adminApi.post('/notices/create', { title, content });
        alert('공지사항 등록 성공');
      }
      navigate('/admin/notices');
    } catch {
      alert(isEditMode ? '수정 실패' : '등록 실패');
    }
  };

  return (
      <div className="notice-form">
        <h2 className="notice-form label">
          {isEditMode ? '공지사항 수정' : '공지사항 등록'}
        </h2>

        <form onSubmit={submitNotice} className="notice-form label">
          <input
              type="text"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="notice-form input"
              // 필요하면 제목 길이 제한
              // maxLength={100}
          />

          <textarea
              placeholder="내용"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`notice-form textarea ${isOver ? 'nf-error' : ''}`}
              rows={12}
              aria-invalid={isOver}
              aria-describedby="content-help"
          />

          <div id="content-help" className="nf-counter">
            {content.length}/{MAX_CONTENT}
            {isOver && <span className="nf-error-text">  글자 수를 초과했습니다.</span>}
          </div>

          <button
              type="submit"
              className="notice-form button"
              disabled={isOver}
              aria-disabled={isOver}
          >
            {isEditMode ? '수정' : '등록'}
          </button>
        </form>
      </div>
  );
};

export default NoticeForm;
