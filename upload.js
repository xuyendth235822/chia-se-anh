/**
 * CHỨC NĂNG: TẢI ẢNH LÊN CLOUD (Firebase Storage) VÀ LƯU DỮ LIỆU (Firestore)
 * KÈM THÔNG TIN: ĐỊA ĐIỂM CHỤP, CHÚ THÍCH (CAPTION), CHỦ ĐỀ
 */

// Hàm kích hoạt chọn ảnh và kiểm tra ràng buộc địa điểm
function startPhotoUploadProcess() {
    const locInput = document.getElementById('upload-location');
    const locVal = (locInput?.value || '').trim();

    if (!locVal) {
        alert("Vui lòng ghi chú địa điểm chụp ảnh (ví dụ: Núi Cấm, Núi Sam, Chùa Bà...) trước khi đăng tải!");
        if (locInput) {
            locInput.focus();
            locInput.classList.add('border-red-500', 'ring-2', 'ring-red-100');
            setTimeout(() => {
                locInput.classList.remove('border-red-500', 'ring-2', 'ring-red-100');
            }, 3000);
        }
        return;
    }

    const photoInput = document.getElementById('photo-input');
    if (photoInput) {
        photoInput.click();
    }
}

document.getElementById('photo-input').addEventListener('change', async function(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 1. Kiểm tra địa điểm chụp (Bắt buộc theo yêu cầu)
    const locInput = document.getElementById('upload-location');
    const locationVal = (locInput?.value || '').trim();
    const captionVal = (document.getElementById('upload-caption')?.value || '').trim();
    const selectedTag = document.getElementById('upload-tag')?.value || 'Danh Lam Thắng Cảnh';
    const isPublic = document.getElementById('upload-public')?.checked || false;
    const currentUserEmail = window.appData.currentUser;

    if (!currentUserEmail) {
        alert("Bạn cần đăng nhập để tải ảnh lên!");
        e.target.value = '';
        return;
    }

    if (!locationVal) {
        alert("Vui lòng ghi chú địa điểm chụp ảnh (ví dụ: Núi Cấm, Núi Sam, Chùa Bà...)!");
        if (locInput) locInput.focus();
        e.target.value = '';
        return;
    }

    // Giao diện loading trên nút Upload
    const btnUpload = document.getElementById('upload-btn');
    let originalHtml = "";
    if (btnUpload) {
        originalHtml = btnUpload.innerHTML;
        btnUpload.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Đang tải ảnh lên...';
        btnUpload.style.pointerEvents = 'none';
        btnUpload.classList.add('opacity-60');
    }

    try {
        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) continue;

            // Tạo ID ngẫu nhiên cho file
            const uniqueFileId = 'img_' + Date.now().toString() + '_' + Math.floor(Math.random() * 10000);
            const storageRef = storage.ref(`images/${currentUserEmail}/${uniqueFileId}_${file.name}`);

            console.log("Đang tải ảnh lên Cloud:", file.name);
            
            let downloadURL = "";
            let storagePath = "";

            try {
                // Upload file lên Firebase Storage (kèm Timeout 10 giây chống treo)
                const uploadPromise = storageRef.put(file);
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error("Storage Timeout")), 10000);
                });
                const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
                downloadURL = await snapshot.ref.getDownloadURL();
                storagePath = snapshot.ref.fullPath;
            } catch (storageError) {
                console.warn("Tải lên Storage thất bại. Chuyển sang lưu dạng Base64 trực tiếp!", storageError);
                // Fallback: Chuyển thành Base64 để lưu thẳng vào Firestore
                const base64Data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => resolve(ev.target.result);
                    reader.onerror = () => reject(new Error("Không thể đọc file ảnh"));
                    reader.readAsDataURL(file);
                });
                downloadURL = base64Data;
                storagePath = "base64_fallback_" + uniqueFileId;
            }

            // Xây dựng Object Dữ liệu Ảnh kèm Địa điểm & Caption
            const newImage = {
                url: downloadURL,
                storagePath: storagePath,
                name: file.name,
                location: locationVal,
                caption: captionVal,
                size: (file.size / 1024).toFixed(1) + ' KB', 
                sizeRaw: file.size, 
                uploadDate: new Date().toLocaleString('vi-VN'),
                timestamp: Date.now(),
                tag: selectedTag,
                userEmail: currentUserEmail,
                isPublic: isPublic,
                isDeleted: false, 
                statViews: 0,
                statShares: 0,
                statDownloads: 0,
                statHearts: 0,
                comments: [],
                currentFilter: 'none'
            };
            
            // Lưu thông tin vào Firestore (Kèm timeout)
            const dbPromise = db.collection('images').add(newImage);
            const dbTimeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Lưu dữ liệu Firestore quá thời gian chờ")), 15000);
            });
            await Promise.race([dbPromise, dbTimeoutPromise]);
            
            console.log("Tải lên hoàn tất ảnh:", file.name, "Địa điểm:", locationVal);
        }

        // Dọn dẹp form sau khi đăng thành công
        if (locInput) locInput.value = '';
        const capInput = document.getElementById('upload-caption');
        if (capInput) capInput.value = '';

    } catch (error) {
        console.error("Lỗi tải ảnh:", error);
        if (error.code && error.code.includes('unauthorized')) {
            alert("Lỗi Quyền Storage: Bạn chưa bật Test Mode cho Firebase Storage!");
        } else if (error.code && error.code.includes('permission-denied')) {
            alert("Lỗi Quyền Firestore: Bạn chưa bật Test Mode cho Firestore!");
        } else {
            alert("Đã xảy ra lỗi khi tải ảnh lên (" + error.message + ").");
        }
    } finally {
        // Khôi phục nút Upload
        if (btnUpload) {
            btnUpload.innerHTML = originalHtml;
            btnUpload.style.pointerEvents = 'auto';
            btnUpload.classList.remove('opacity-60');
        }
        e.target.value = '';
    }
});
