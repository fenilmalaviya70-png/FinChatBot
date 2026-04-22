/**
 * Custom Cursor Component
 * Elegant custom cursor with basic hover effect
 */

import { useEffect, useRef } from 'react';

const CustomCursor = () => {
    const dotRef = useRef(null);
    const ringRef = useRef(null);

    useEffect(() => {
        const dot = dotRef.current;
        const ring = ringRef.current;
        if (!dot || !ring) return;

        let mouseX = 0;
        let mouseY = 0;
        let ringX = 0;
        let ringY = 0;
        let animFrame;

        const moveCursor = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = `${mouseX}px`;
            dot.style.top = `${mouseY}px`;
        };

        const animateRing = () => {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            ring.style.left = `${ringX}px`;
            ring.style.top = `${ringY}px`;
            animFrame = requestAnimationFrame(animateRing);
        };

        const handleMouseEnter = () => {
            dot.classList.add('cursor-dot--hover');
            ring.classList.add('cursor-ring--hover');
        };

        const handleMouseLeave = () => {
            dot.classList.remove('cursor-dot--hover');
            ring.classList.remove('cursor-ring--hover');
        };

        window.addEventListener('mousemove', moveCursor);
        animFrame = requestAnimationFrame(animateRing);

        // Add hover effect for interactive elements
        const addListeners = () => {
            document.querySelectorAll('a, button, input, textarea, select, [role="button"], label').forEach((el) => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
                el.addEventListener('mouseenter', handleMouseEnter);
                el.addEventListener('mouseleave', handleMouseLeave);
            });
        };

        addListeners();

        // Observer for dynamically added elements
        const observer = new MutationObserver(addListeners);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            cancelAnimationFrame(animFrame);
            observer.disconnect();
        };
    }, []);

    return (
        <>
            {/* Inner dot */}
            <div
                ref={dotRef}
                className="cursor-dot"
                style={{
                    position: 'fixed',
                    width: '14px',
                    height: '14px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: 99999,
                    transform: 'translate(-50%, -50%)',
                    transition: 'width 0.15s ease, height 0.15s ease, background-color 0.15s ease',
                }}
            />
            {/* Outer ring */}
            <div
                ref={ringRef}
                className="cursor-ring"
                style={{
                    position: 'fixed',
                    width: '48px',
                    height: '48px',
                    border: '2px solid rgba(59, 130, 246, 0.7)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: 99998,
                    transform: 'translate(-50%, -50%)',
                    transition: 'width 0.15s ease, height 0.15s ease, border-color 0.15s ease',
                }}
            />

            {/* Cursor styles */}
            <style>{`
        * { cursor: none !important; }
        .cursor-dot--hover {
          background-color: #6366f1 !important;
          width: 20px !important;
          height: 20px !important;
        }
        .cursor-ring--hover {
          width: 60px !important;
          height: 60px !important;
          border-color: rgba(99, 102, 241, 0.5) !important;
        }
      `}</style>
        </>
    );
};

export default CustomCursor;
