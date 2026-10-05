/**
 * CHỨC NĂNG 2: THẢ TIM & BÌNH LUẬN ẢO TƯƠNG TÁC (Interaction)
 */

// Hàm thả tim với hiệu ứng
function toggleHeart(event, imgId) {
    // Ngăn chặn việc click nút này lại mở nhầm chức năng Xem ảnh ở nền
    event.stopPropagation();
    
    // Cập nhật lên Firestore
    db.collection('images').doc(imgId).update({
        statHearts: firebase.firestore.FieldValue.increment(1)
    }).catch(err => console.error("Lỗi thả tim:", err));
    
    // Tạo trái tim bay lên
    createFlyingHeart(event.clientX, event.clientY);
    
    // Đã chuyển đếm lượt truy cập vào lúc load trang
}

// Hàm thêm bình luận
async function addComment(imgId) {
    const inputEl = document.getElementById('cmt-input-' + imgId);
    const text = inputEl.value.trim();
    if (text === '') return;
    
    const userEmail = window.appData.currentUser || "Khách";
    // Lấy phần tên trước @
    const userName = userEmail.split('@')[0];

    const newComment = {
        id: Date.now(),
        text: text,
        user: userName
    };

    try {
        await db.collection('images').doc(imgId).update({
            comments: firebase.firestore.FieldValue.arrayUnion(newComment)
        });
        inputEl.value = '';
        // Đã chuyển đếm lượt truy cập vào lúc load trang
    } catch (err) {
        console.error("Lỗi thêm bình luận:", err);
    }
}

// Hàm xóa bình luận
async function deleteComment(imgId, commentId) {
    if (!confirm('Bạn có muốn xóa bình luận này không?')) return;
    try {
        const docRef = db.collection('images').doc(imgId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) return;
        
        const imgData = docSnap.data();
        const commentToRemove = imgData.comments.find(c => (c.id || c.index) === commentId);
        
        if (commentToRemove) {
            await docRef.update({
                comments: firebase.firestore.FieldValue.arrayRemove(commentToRemove)
            });
        }
    } catch (err) {
        console.error("Lỗi xóa bình luận:", err);
    }
}

// Hiệu ứng logic bay (bay trái tim) DOM Injection
function createFlyingHeart(x, y) {
    const heart = document.createElement('i');
    heart.className = 'fas fa-heart text-pink-500 absolute pointer-events-none drop-shadow-md z-50';
    heart.style.left = (x - 10) + 'px';
    heart.style.top = (y - 10) + 'px';
    heart.style.fontSize = '24px';
    heart.style.transition = 'all 1s ease-out';
    heart.style.transform = 'translateY(0) scale(1)';
    heart.style.opacity = '1';
    
    document.body.appendChild(heart);
    
    // Yêu cầu frame kế tiếp để CSS Transition chạy ngay
    requestAnimationFrame(() => {
        heart.style.transform = `translateY(-100px) scale(1.5) rotate(${Math.random() * 40 - 20}deg)`;
        heart.style.opacity = '0';
    });
    
    // Dọn dẹp DOM
    setTimeout(() => {
        if(document.body.contains(heart)) {
            document.body.removeChild(heart);
        }
    }, 1000);
}
