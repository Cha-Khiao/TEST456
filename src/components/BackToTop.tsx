'use client';

import { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={scrollToTop}
        className={`btn-back-to-top ${isVisible ? 'visible' : ''}`}
        aria-label="Back to Top"
      >
        <FaArrowUp />
      </button>

      <style jsx>{`
        .btn-back-to-top {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%);
          color: white;
          border: none;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          cursor: pointer;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 1000; /* อยู่บนสุด */
        }

        .btn-back-to-top.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .btn-back-to-top:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.6);
        }
      `}</style>
    </>
  );
}