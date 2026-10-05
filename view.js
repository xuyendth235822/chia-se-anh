/**
 * CHỨC NĂNG: MỞ XEM ẢNH VÀ ĐẾM LƯỢT XEM
 * HIỂN THỊ ĐỊA ĐIỂM, CHỦ ĐỀ VÀ CAPTION
 */

// Biến lưu trữ ID ảnh đang mở (để phục vụ chức năng chỉnh sửa Filters)
let activeViewImgId = null;

function openViewModal(imgId) {
    activeViewImgId = imgId;

    // Tìm bức ảnh trong bộ nhớ theo ID
    const imgObj = window.appData.images.find(img => img.id === imgId);
    if (!imgObj) return;

    // Tăng lượt Xem ảnh (Lưu Offline)
    let localViews = {};
    try {
        localViews = JSON.parse(localStorage.getItem('localViewStats') || '{}');
    } catch(e) {}
    
    localViews[imgId] = (localViews[imgId] || 0) + 1;
    localStorage.setItem('localViewStats', JSON.stringify(localViews));
    
    // Cập nhật bộ nhớ tạm
    imgObj.statViews = localViews[imgId];

    // Gắn URL ảnh vào modal
    const viewModal = document.getElementById('view-modal');
    const fullImg = document.getElementById('full-view-img');
    fullImg.src = imgObj.url;

    // Áp dụng bộ lọc (nếu ảnh đã được chỉnh sửa)
    fullImg.style.filter = imgObj.currentFilter || 'none';

    // Hiển thị thông tin địa điểm, caption, tag lên modal
    const locEl = document.getElementById('view-location');
    if (locEl) locEl.innerText = imgObj.location || 'Chưa ghi chú địa điểm';

    const capEl = document.getElementById('view-caption');
    if (capEl) {
        if (imgObj.caption) {
            capEl.innerText = `"${imgObj.caption}"`;
            capEl.classList.remove('hidden');
        } else {
            capEl.innerText = '';
            capEl.classList.add('hidden');
        }
    }

    const tagEl = document.getElementById('view-tag');
    if (tagEl) tagEl.innerText = imgObj.tag || 'Danh Lam Thắng Cảnh';

    // Hiển thị thống kê lên modal
    document.getElementById('view-stat-hearts').innerText = imgObj.statHearts || 0;
    document.getElementById('view-stat-views').innerText = imgObj.statViews || 0;
    document.getElementById('view-stat-shares').innerText = imgObj.statShares || 0;
    document.getElementById('view-stat-downloads').innerText = imgObj.statDownloads || 0;

    // Hiển thị modal
    viewModal.classList.remove('hidden');

    // Cập nhật lại HTML thư viện để hiện con số mới
    renderGallery();
}

function closeViewModal() {
    document.getElementById('view-modal').classList.add('hidden');
    // Cập nhật danh sách Thư viện để lỡ mà có đổi màu thì render lại thumbnail
    renderGallery();
    
    // Ngắt src để giảm thiểu bộ nhớ
    document.getElementById('full-view-img').src = "";
    activeViewImgId = null;
}
