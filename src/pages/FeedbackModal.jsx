// src/components/admin/FeedbackModal.jsx
import React, { useEffect, useRef, useState } from "react";
import "../styles/FeedbackForm.css";

const FeedbackModal = ({
                           open, onClose, onSubmitted, submitter, mode = "create", initial = null,
                       }) => {
    const isEdit = mode === "edit";
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const firstFieldRef = useRef(null);

    const STORAGE_KEY = "feedbackDraft";
    const MAX_CONTENT = 400;
    const isOver = content.length > MAX_CONTENT;

    useEffect(() => {
        if (!open) return;
        if (isEdit && initial) {
            setTitle(initial.title ?? "");
            setContent(initial.content ?? "");
        } else {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            setTitle(saved?.title ?? "");
            setContent(saved?.content ?? "");
        }
        setTimeout(() => firstFieldRef.current?.focus(), 0);

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e) => e.key === "Escape" && onClose?.();
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open, isEdit, initial, onClose]);

    if (!open) return null;

    const saveDraft = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ title, content }));
        alert("임시 저장되었습니다.");
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return alert("제목을 입력하세요.");
        if (!content.trim()) return alert("내용을 입력하세요.");
        if (isOver) return alert("내용은 400자를 넘길 수 없습니다.");
        try {
            setSubmitting(true);
            const res = await submitter?.({ id: initial?.id, title, content });
            if (!isEdit) localStorage.removeItem(STORAGE_KEY);
            onSubmitted?.(res);
            onClose?.();
        } catch (err) {
            console.error(err);
            alert(isEdit ? "수정 실패" : "등록 실패");
        } finally {
            setSubmitting(false);
        }
    };

    const onOverlayClick = (e) => {
        if (e.target.classList.contains("modal-overlay")) onClose?.();
    };

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title" onClick={onOverlayClick}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 id="feedback-modal-title">{isEdit ? "피드백 수정" : "피드백 등록"}</h3>
                    <button className="modal-close" onClick={onClose} aria-label="닫기">✕</button>
                </div>

                <form className="modal-body" onSubmit={submit}>
                    <input
                        ref={firstFieldRef}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="feedback-form input"
                        placeholder="제목을 입력하세요"
                        maxLength={40}
                    />
                    <div className="nf-counter">{title.length}/40</div>

                    <textarea
                        placeholder="내용"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={`feedback-form textarea ${isOver ? "error-border" : ""}`}
                        rows={8}
                        aria-invalid={isOver}
                        aria-describedby="content-help"
                    />
                    <div className="char-counter" id="content-help">
                        {content.length}/{MAX_CONTENT}
                        {isOver && <span className="error-text">  글자 초과되었습니다</span>}
                    </div>

                    <div className="button-wrapper">
                        {!isEdit && (
                            <button
                                type="button"
                                className="feedback-form button btn-secondary"
                                onClick={saveDraft}
                                disabled={submitting}
                            >
                                임시 저장
                            </button>
                        )}
                        <button
                            type="submit"
                            className="feedback-form button btn-primary"
                            disabled={submitting || isOver}
                            aria-disabled={submitting || isOver}
                        >
                            {submitting ? (isEdit ? "저장 중..." : "등록 중...") : isEdit ? "저장" : "등록"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;
