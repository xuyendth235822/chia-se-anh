/**
 * CHỨC NĂNG: KIẾT XUẤT ẢNH CÓ FILTER XUỐNG MÁY THEO YÊU CẦU
 */

function downloadImage(imgId) {
    const imgObj = window.appData.images.find(img => img.id === imgId);
    if (!imgObj) return;

    // Cập nhật lượt tải qua Firestore
    db.collection('images').doc(imgId).update({
        statDownloads: firebase.firestore.FieldValue.increment(1)
    }).catch(err => console.error("Lỗi cập nhật tải xuống:", err));
    // Nếu ảnh có áp dụng Filter, ta phải dùng HTML5 Canvas để in Bộ lọc (CSS Style)
    // dính chết vào điểm ảnh (Pixel) để file tải xuống thực sự có màu như đã chọn.
    if (imgObj.currentFilter && imgObj.currentFilter !== 'none') {
        const tempImage = new Image();
        tempImage.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = tempImage.width;
            canvas.height = tempImage.height;
            const ctx = canvas.getContext('2d');
            
            // Vẽ ảnh kèm CSS filter
            ctx.filter = imgObj.currentFilter;
            ctx.drawImage(tempImage, 0, 0);
            
            // Lấy chuỗi base64 đã dính màu
            const filteredDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            
            // Tải
            forceDownloadLink(filteredDataUrl, 'agmap_filtered_' + Date.now() + '.jpg');
        };
        // Cần đảm bảo hình ảnh base64 tải hoàn tất vào biến ảnh tàng hình
        tempImage.src = imgObj.url;
    } else {
        // Nêú không có màu thì cứ tải file gốc nhẹ nhàng
        forceDownloadLink(imgObj.url, imgObj.name || ('agmap_photo_' + Date.now() + '.jpg'));
    }

    renderGallery();
    // Đã chuyển đếm lượt truy cập vào lúc load trang
}

// Hàm phụ kích hoạt tải file vật lý
function forceDownloadLink(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
