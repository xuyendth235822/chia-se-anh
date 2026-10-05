/**
 * CHỨC NĂNG: GIAO TIẾP VỚI FIREBASE FIRESTORE ĐỂ LƯU TRỮ VÀ ĐỌC DỮ LIỆU
 */

// Đặt trạng thái Tab hiện tại mặc định
window.appData.currentTab = 'my_photos';

// Hàm Khởi tạo/Tải dữ liệu thay cho initDB cũ
function loadImages(callback) {
    const currentUserEmail = window.appData.currentUser;
    if (!currentUserEmail) return;

    let query = db.collection('images');

    // Nếu đang ở Tab Cá Nhân: Chỉ lấy ảnh của user hiện tại (kể cả xóa tạm)
    if (window.appData.currentTab === 'my_photos') {
        query = query.where('userEmail', '==', currentUserEmail);
    } 
    // Nếu đang ở Tab Cộng Đồng: Lấy ảnh public của tất cả mọi người
    else if (window.appData.currentTab === 'community') {
        query = query.where('isPublic', '==', true);
    }

    // Hủy lắng nghe cũ nếu có
    if (window.appData.unsubscribe) {
        window.appData.unsubscribe();
    }

    console.log("Đang tải dữ liệu từ Firestore cho tab:", window.appData.currentTab);

    // Lắng nghe dữ liệu realtime
    window.appData.unsubscribe = query.onSnapshot((snapshot) => {
        console.log("Firestore onSnapshot triggered. Số lượng document:", snapshot.docs.length);
        const images = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            data.id = doc.id; // Lấy ID thực của Firestore
            // Lấy lượt chia sẻ offline
            let localShares = {};
            try {
                localShares = JSON.parse(localStorage.getItem('localShareStats') || '{}');
            } catch(e) {}
            if (localShares[doc.id] !== undefined) {
                data.statShares = localShares[doc.id];
            }

            // Lấy lượt xem offline
            let localViews = {};
            try {
                localViews = JSON.parse(localStorage.getItem('localViewStats') || '{}');
            } catch(e) {}
            if (localViews[doc.id] !== undefined) {
                data.statViews = localViews[doc.id];
            }

            // Xử lý logic Thùng rác (Recycle Bin) cho Tab Cá nhân
            if (window.appData.currentTab === 'my_photos') {
                // Đẩy TẤT CẢ ảnh vào mảng (kể cả đã xóa hay chưa xóa).
                // File search.js sẽ chịu trách nhiệm lọc ra khi ở Thùng rác hay Thư viện.
                images.push(data);
            } else {
                // Tab cộng đồng thì chỉ lấy ảnh chưa xóa
                if (!data.isDeleted) {
                    images.push(data);
                }
            }
        });

        window.appData.images = images;
        
        if (callback) callback();
    }, (error) => {
        console.error("Lỗi khi tải ảnh từ Firestore:", error);
        if (error.code === 'permission-denied') {
            alert("Lỗi Quyền Truy Cập: Bạn chưa bật Test Mode trong Firebase Firestore Rules!");
        } else if (error.code === 'failed-precondition') {
            alert("Lỗi Index: Hãy nhấn vào link trong F12 Console để tạo Index cho Firestore.");
        }
    });
}

// Giữ lại hàm initDB làm cầu nối tương thích với code cũ trong index.html
function initDB(callback) {
    loadImages(callback);
}

// Thay thế saveState cũ (vốn dùng để lưu nguyên mảng)
// Bây giờ ta sẽ cập nhật từng ảnh trực tiếp bằng ID
window.saveState = function() {
    // Không dùng hàm này nữa vì Firestore cập nhật từng document riêng lẻ
};

