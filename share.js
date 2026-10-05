/**
 * CHỨC NĂNG: CHIA SẺ ẢNH VÀ ĐẾM LƯỢT CHIA SẺ
 */

let activeShareImageId = null;

function openShareModal(imgId) {
    activeShareImageId = imgId;
    
    const modal = document.getElementById('share-modal');
    const shareLinkInput = document.getElementById('share-link');
    
    let basePath = window.location.href.split('?')[0].split('#')[0];
    if (basePath.endsWith('index.html')) {
        basePath = basePath.replace('index.html', 'view_photo.html');
    } else {
        if (!basePath.endsWith('/')) basePath += '/';
        basePath += 'view_photo.html';
    }
    const fakeLink = `${basePath}?share_id=${imgId}`;
    
    shareLinkInput.value = fakeLink;
    modal.classList.remove('hidden');
}

function closeShareModal() {
    const modal = document.getElementById('share-modal');
    modal.classList.add('hidden');
    activeShareImageId = null;
}

function copyShareLink(event) {
    const shareLinkInput = document.getElementById('share-link');
    
    // Bôi đen văn bản
    shareLinkInput.select();
    shareLinkInput.setSelectionRange(0, 99999); 
    
    const handleSuccess = () => {
        // --- CỘNG ĐIỂM CHIA SẺ (Lưu Offline) ---
        if (activeShareImageId) {
            let localShares = {};
            try {
                localShares = JSON.parse(localStorage.getItem('localShareStats') || '{}');
            } catch(e) {}
            
            localShares[activeShareImageId] = (localShares[activeShareImageId] || 0) + 1;
            localStorage.setItem('localShareStats', JSON.stringify(localShares));
            
            // Cập nhật bộ nhớ tạm để UI hiển thị số mới
            const img = window.appData.images.find(i => i.id === activeShareImageId);
            if (img) {
                img.statShares = (img.statShares || 0) + 1;
                if (typeof runGalleryLogic === 'function') runGalleryLogic();
            }
        }
        
        // --- HIỆU ỨNG TÍCH CỰC & ĐÓNG MODAL ---
        const copyBtn = event.currentTarget;
        const originalHtml = copyBtn.innerHTML;
        
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Đã sao chép!';
        copyBtn.classList.add('bg-green-600');
        copyBtn.classList.remove('bg-blue-600');
        
        // Chờ 0.8 giây rồi tự đóng popup
        setTimeout(() => {
            copyBtn.innerHTML = originalHtml;
            copyBtn.classList.remove('bg-green-600');
            copyBtn.classList.add('bg-blue-600');
            closeShareModal();
        }, 800);
        
        // Đã chuyển đếm lượt truy cập vào lúc load trang
    };

    // Cách 1: Ưu tiên dùng execCommand vì nó hỗ trợ HTTP mạng LAN cực tốt
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            handleSuccess();
            return;
        }
    } catch (err) {
        console.log("execCommand fallback:", err);
    }
    
    // Cách 2: Nếu Cách 1 thất bại, dùng Clipboard API hiện đại (yêu cầu HTTPS hoặc localhost)
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareLinkInput.value)
            .then(handleSuccess)
            .catch((err) => {
                console.error("Clipboard API lỗi:", err);
                alert("Máy tính đang khóa quyền sao chép. Bạn vui lòng nhấn phím Ctrl+C để copy nhé!");
            });
    } else {
        alert("Máy tính đang khóa quyền sao chép. Bạn vui lòng nhấn phím Ctrl+C để copy nhé!");
    }
}
