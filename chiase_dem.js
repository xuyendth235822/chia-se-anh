/**
 * CHỨC NĂNG: ĐẾM LƯỢT TRUY CẬP TRANG WEB (LƯU FIREBASE)
 */

function incrementGlobalActive() {
    let visits = 0;
    try {
        visits = parseInt(localStorage.getItem('localGlobalVisits') || '0', 10);
    } catch(e) {}
    
    visits += 1;
    localStorage.setItem('localGlobalVisits', visits);
    
    // Giả lập cơ chế Realtime bằng cách gọi update ngay lập tức
    if (typeof listenGlobalActive === 'function') {
        listenGlobalActive();
    }
}

function listenGlobalActive() {
    let visits = 0;
    try {
        visits = parseInt(localStorage.getItem('localGlobalVisits') || '0', 10);
    } catch(e) {}
    
    window.appData.views = visits;
    refreshStatsUI();
}

function refreshStatsUI() {
    const viewCounterElement = document.getElementById('view-counter');
    if (viewCounterElement) {
        viewCounterElement.innerHTML = `
            <i class="fas fa-eye text-blue-500"></i> Thống kê lượt truy cập: <span class="font-bold text-blue-700 ml-1">${window.appData.views || 0}</span>
        `;
        
        viewCounterElement.classList.add('animate-pulse', 'bg-blue-100', 'scale-105');
        setTimeout(() => {
            viewCounterElement.classList.remove('animate-pulse', 'bg-blue-100', 'scale-105');
        }, 500);
    }
}

// Lắng nghe dữ liệu ngay nếu db đã sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        listenGlobalActive();
    }, 1000);
});
