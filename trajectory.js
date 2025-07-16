// 軌跡ページのJavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // 年度ナビゲーションボタン
    const yearNavBtns = document.querySelectorAll('.year-nav-btn');
    const navCircles = document.querySelectorAll('.nav-circle');
    const yearSections = document.querySelectorAll('.timeline-year-section');
    
    // 年度ナビゲーションボタンのイベントリスナー
    yearNavBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetYear = this.dataset.year;
            
            // アクティブなボタンを更新
            yearNavBtns.forEach(button => button.classList.remove('active'));
            this.classList.add('active');
            
            // フローティングナビゲーションも更新
            navCircles.forEach(circle => circle.classList.remove('active'));
            const targetCircle = document.querySelector(`.nav-circle[data-year="${targetYear}"]`);
            if (targetCircle) {
                targetCircle.classList.add('active');
            }
            
            // スムーズにスクロール
            const targetSection = document.getElementById(`year-${targetYear}`);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 100; // ヘッダー分のオフセット
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // フローティングナビゲーション
    navCircles.forEach(circle => {
        circle.addEventListener('click', function() {
            const targetYear = this.dataset.year;
            
            // アクティブなボタンを更新
            navCircles.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 年度ナビゲーションボタンも更新
            yearNavBtns.forEach(btn => btn.classList.remove('active'));
            const targetBtn = document.querySelector(`.year-nav-btn[data-year="${targetYear}"]`);
            if (targetBtn) {
                targetBtn.classList.add('active');
            }
            
            // スムーズにスクロール
            const targetSection = document.getElementById(`year-${targetYear}`);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 100; // ヘッダー分のオフセット
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // スクロールアニメーションを無効化 - 最初から表示
    const timelineEvents = document.querySelectorAll('.timeline-event');
    timelineEvents.forEach(event => {
        event.style.opacity = '1';
        event.style.transform = 'translateY(0)';
    });
    
    // スクロール位置によるナビゲーション自動更新
    let isScrolling = false;
    
    window.addEventListener('scroll', function() {
        if (!isScrolling) {
            isScrolling = true;
            requestAnimationFrame(updateActiveNavigation);
        }
    });
    
    function updateActiveNavigation() {
        const scrollPosition = window.scrollY + 300;
        
        yearSections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                const sectionId = section.id;
                const year = sectionId.replace('year-', '');
                
                // ナビゲーションサークルを更新
                navCircles.forEach(circle => {
                    circle.classList.remove('active');
                    if (circle.dataset.year === year) {
                        circle.classList.add('active');
                    }
                });
                
                // 年度ナビゲーションボタンも更新
                yearNavBtns.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.year === year) {
                        btn.classList.add('active');
                    }
                });
            }
        });
        
        isScrolling = false;
    }
    
    // 画像の遅延読み込み（軽量化）
    if ('loading' in HTMLImageElement.prototype) {
        // ブラウザがネイティブ遅延読み込みをサポートしている場合は何もしない
    } else {
        // フォールバック
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    // タッチデバイス対応
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            const activeButton = document.querySelector('.timeline-nav-btn.active');
            if (!activeButton) return;
            
            const buttons = Array.from(navButtons);
            const currentIndex = buttons.indexOf(activeButton);
            
            if (swipeDistance > 0 && currentIndex > 0) {
                // 右スワイプ - 前の年へ
                buttons[currentIndex - 1].click();
            } else if (swipeDistance < 0 && currentIndex < buttons.length - 1) {
                // 左スワイプ - 次の年へ
                buttons[currentIndex + 1].click();
            }
        }
    }
    
    // キーボードナビゲーション
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            
            const activeButton = document.querySelector('.timeline-nav-btn.active');
            if (!activeButton) return;
            
            const buttons = Array.from(navButtons);
            const currentIndex = buttons.indexOf(activeButton);
            
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                buttons[currentIndex - 1].click();
            } else if (e.key === 'ArrowRight' && currentIndex < buttons.length - 1) {
                buttons[currentIndex + 1].click();
            }
        }
    });
    
    // パフォーマンス最適化
    const debouncedResize = debounce(function() {
        updateActiveNavigation();
    }, 150);
    
    window.addEventListener('resize', debouncedResize);
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 初期化完了
    console.log('軌跡ページが正常に読み込まれました');
});