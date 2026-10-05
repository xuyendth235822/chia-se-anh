/**
 * CHỨC NĂNG 1: BỘ LỌC CHỈNH SỬA ẢNH CƠ BẢN (Persistent Photo Filters)
 */

function applyFilter(filterStyle) {
    if (!activeViewImgId) return;
    
    const imgObj = window.appData.images.find(img => img.id === activeViewImgId);
    if (!imgObj) return;

    // Lưu lại filter mới vào dữ liệu Firestore
    if (imgObj.userEmail === window.appData.currentUser) {
        db.collection('images').doc(activeViewImgId).update({
            currentFilter: filterStyle
        }).catch(err => console.error("Lỗi cập nhật filter:", err));
    } else {
        console.warn("Bạn không có quyền lưu filter vĩnh viễn cho ảnh của người khác. Chỉ hiển thị tạm thời.");
    }
    // Cập nhật ngay bộ lọc cho ảnh full view
    const fullImg = document.getElementById('full-view-img');
    if (filterStyle === 'none') {
        fullImg.style.filter = 'none';
    } else {
        fullImg.style.filter = filterStyle;
    }
}
