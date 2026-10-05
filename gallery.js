/**
 * CHỨC NĂNG: HIỂN THỊ THƯ VIỆN & CÁC CHỈ SỐ THỐNG KÊ MỖI ẢNH, TƯƠNG TÁC
 * KÈM ĐỊA ĐIỂM CHỤP ẢNH, CAPTION CHÚ THÍCH & PHÂN LOẠI CHỦ ĐỀ
 */

// Hàm an toàn mã hóa chuỗi tránh lỗi XSS
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderGallery(sourceArray = window.appData.images) {
    const galleryContainer = document.getElementById('gallery');
    const totalPhotosElement = document.getElementById('total-photos');
    
    galleryContainer.innerHTML = ''; 

    if (totalPhotosElement) {
        totalPhotosElement.innerText = `${sourceArray.length} ảnh`;
    }

    if (sourceArray.length === 0) {
        const searchVal = (document.getElementById('search-input')?.value || '').trim();
        let emptyDesc = window.isInRecycleBinMode 
            ? 'Không có ảnh nào đang nằm trong thùng rác!' 
            : 'Hộp lưu trữ đang trống hoặc không có ảnh nào phù hợp!';
        
        if (!window.isInRecycleBinMode && searchVal) {
            emptyDesc = `Không tìm thấy ảnh nào khớp với từ khóa/địa điểm "${escapeHtml(searchVal)}".`;
        }

        galleryContainer.innerHTML = `
            <div class="col-span-full py-16 flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <i class="fas ${window.isInRecycleBinMode ? 'fa-trash' : 'fa-search-location'} text-5xl text-gray-300 mb-4"></i>
                <p class="text-gray-700 font-bold text-lg">${window.isInRecycleBinMode ? 'Thùng rác trống' : 'Không tìm thấy ảnh'}</p>
                <p class="text-gray-400 text-sm mt-1 text-center px-4">${emptyDesc}</p>
                ${(!window.isInRecycleBinMode && searchVal) ? `
                    <button onclick="clearSearchInput()" class="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors">
                        <i class="fas fa-times mr-1"></i> Xóa tìm kiếm
                    </button>
                ` : ''}
            </div>
        `;
        return;
    }

    sourceArray.forEach(image => {
        // Xây dựng chuỗi bình luận
        let commentsHTML = '';
        if(image.comments && image.comments.length > 0) {
            commentsHTML = image.comments.slice(-2).map((c, index) => {
                const commentId = c.id || index; 
                return `
                <div class="group/cmt relative text-xs text-gray-600 bg-gray-50 rounded pl-2 pr-6 py-1 mb-1 truncate tooltip cursor-help" title="${escapeHtml(c.text)}">
                    💬 <span class="font-semibold text-blue-600">${escapeHtml(c.user)}:</span> ${escapeHtml(c.text)}
                    <button onclick="deleteComment('${image.id}', ${commentId})" class="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 hidden group-hover/cmt:block p-1 bg-gray-50 rounded" title="Xóa bình luận">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            }).join('');
            if(image.comments.length > 2) commentsHTML += `<div class="text-[10px] text-gray-400 text-center">... và ${image.comments.length - 2} bình luận khác</div>`;
        }

        const locationText = image.location ? escapeHtml(image.location) : '';
        const captionText = image.caption ? escapeHtml(image.caption) : '';
        const nameText = escapeHtml(image.name || 'Ảnh');
        const tagText = escapeHtml(image.tag || 'Danh Lam Thắng Cảnh');

        const itemDom = document.createElement('div');
        itemDom.className = 'group flex flex-col relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300';
        
        itemDom.innerHTML = `
            <!-- THUMBNAIL ẢNH (Bấm vào xem) -->
            <div class="relative">
                <div onclick="openViewModal('${image.id}')" class="h-60 w-full overflow-hidden bg-gray-100 relative cursor-pointer flex items-center justify-center">
                    <!-- Áp dụng CSS filter thẳng vào thẻ img -->
                    <img src="${image.url}" alt="${nameText}" style="filter: ${image.currentFilter || 'none'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out">
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                       <i class="fas fa-search-plus text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </div>
                </div>

                <!-- BADGE ĐỊA ĐIỂM CHỤP NẰM TRÊN GÓC ẢNH -->
                ${image.location ? `
                <div class="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg max-w-[85%] pointer-events-none">
                    <i class="fas fa-map-marker-alt text-red-400 text-xs"></i>
                    <span class="truncate">${locationText}</span>
                </div>
                ` : ''}
                
                <!-- NÚT THẢ TIM TRÊN GÓC PHẢI THUMBNAIL -->
                <button onclick="toggleHeart(event, '${image.id}')" class="absolute top-3 right-3 bg-white/80 backdrop-blur hover:bg-white p-2 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 group/heart z-10 w-9 h-9 flex items-center justify-center">
                    <i class="fas fa-heart ${image.statHearts > 0 ? 'text-pink-500' : 'text-gray-300 group-hover/heart:text-pink-500'} text-base transition-colors"></i>
                </button>
            </div>
            
            <!-- THÔNG TIN & MENU (KHÁC BIỆT KHI Ở TRONG THÙNG RÁC) -->
            <div class="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <!-- Hàng Chủ Đề Tag & Quyền hiển thị -->
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <span class="text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <i class="fas fa-tag text-[9px]"></i> ${tagText}
                        </span>
                        ${image.isPublic ? '<span class="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><i class="fas fa-globe text-[9px]"></i> Cộng đồng</span>' : '<span class="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><i class="fas fa-lock text-[9px]"></i> Riêng tư</span>'}
                    </div>

                    <!-- ĐỊA ĐIỂM CHỤP (Nổi bật) -->
                    <div class="flex items-start gap-1.5 text-gray-900 font-bold text-sm mt-1" title="Địa điểm: ${locationText || 'Chưa cập nhật'}">
                        <i class="fas fa-map-marker-alt text-red-500 mt-0.5 text-xs flex-shrink-0"></i>
                        <span class="line-clamp-1">${locationText || '<span class="text-gray-400 font-normal italic">Chưa ghi chú địa điểm</span>'}</span>
                    </div>

                    <!-- CAPTION / CHÚ THÍCH -->
                    ${captionText ? `
                    <div class="mt-2 bg-blue-50/50 rounded-xl p-2.5 border border-blue-100/60 text-xs text-gray-600 italic">
                        <div class="flex items-start gap-1.5">
                            <i class="fas fa-quote-left text-blue-400 text-[10px] mt-0.5 flex-shrink-0"></i>
                            <span class="line-clamp-2">${captionText}</span>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Tên file & Ngày đăng -->
                    <p class="text-[11px] text-gray-400 mt-2 truncate" title="${nameText}">
                        <i class="far fa-file-image mr-1"></i>${nameText} • ${image.size}
                    </p>
                    <p class="text-[10px] text-gray-500 mt-0.5">
                        Người đăng: <span class="font-medium text-blue-600">${image.userEmail ? image.userEmail.split('@')[0] : 'Khách'}</span> • ${image.uploadDate}
                    </p>
                    
                    ${!window.isInRecycleBinMode ? `
                        <div class="mt-2 min-h-[1.5rem]">
                            ${commentsHTML}
                        </div>
                        <div class="flex gap-2 mt-2">
                            <input type="text" id="cmt-input-${image.id}" placeholder="Để lại lời nhắn..." class="flex-grow text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-300" onkeypress="if(event.key==='Enter') addComment('${image.id}')">
                            <button onclick="addComment('${image.id}')" class="text-blue-500 text-xs font-semibold hover:text-blue-700 px-1">Gửi</button>
                        </div>
                        <div class="flex items-center gap-3 mt-3 pt-3 border-t border-dashed border-gray-100 font-medium text-xs text-gray-600 flex-wrap">
                            <span class="flex items-center gap-1" title="Lượt thả tim"><i class="fas fa-heart text-pink-400"></i> ${image.statHearts || 0}</span>
                            <span class="flex items-center gap-1" title="Lượt xem"><i class="fas fa-eye text-blue-400"></i> ${image.statViews || 0}</span>
                            <span class="flex items-center gap-1" title="Lượt chia sẻ"><i class="fas fa-share text-green-400"></i> ${image.statShares || 0}</span>
                            <span class="flex items-center gap-1" title="Lượt tải xuống"><i class="fas fa-download text-orange-400"></i> ${image.statDownloads || 0}</span>
                        </div>
                    ` : `
                        <p class="text-red-500 text-xs font-medium mt-4"><i class="fas fa-exclamation-triangle"></i> Đã bị xóa tạm thời.</p>
                    `}
                </div>
                
                <!-- KHU VỰC NÚT TƯƠNG TÁC -->
                <div class="mt-4 pt-3 flex items-center justify-between gap-2 border-t border-gray-100">
                    ${!window.isInRecycleBinMode ? `
                        <div class="flex gap-2">
                            <button onclick="downloadImage('${image.id}')" class="text-gray-500 hover:text-white hover:bg-orange-500 w-9 h-9 rounded-lg transition-colors flex items-center justify-center" title="Tải xuống">
                                <i class="fas fa-download text-sm"></i>
                            </button>
                            <button onclick="openShareModal('${image.id}')" class="text-gray-500 hover:text-white hover:bg-green-500 w-9 h-9 rounded-lg transition-colors flex items-center justify-center" title="Chia sẻ Link">
                                <i class="fas fa-share text-sm"></i>
                            </button>
                            <button onclick="showQRCode('${image.id}')" class="text-gray-500 hover:text-white hover:bg-purple-500 w-9 h-9 rounded-lg transition-colors flex items-center justify-center" title="Tạo mã QR">
                                <i class="fas fa-qrcode text-sm"></i> QR
                            </button>
                        </div>
                        ${image.userEmail === window.appData.currentUser ? `
                        <button onclick="softDeleteImage('${image.id}')" class="text-red-400 hover:text-white hover:bg-red-500 w-9 h-9 rounded-lg font-medium transition-colors flex items-center justify-center" title="Ném vào thùng rác">
                            <i class="fas fa-trash-alt text-sm"></i>
                        </button>
                        ` : ''}
                    ` : `
                        <!-- NÚT KHÔI PHỤC VÀ XÓA VĨNH VIỄN TRONG THÙNG RÁC -->
                        <button onclick="restoreImage('${image.id}')" class="bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex-1 text-center">
                            <i class="fas fa-undo mr-1"></i> Khôi phục
                        </button>
                        <button onclick="hardDeleteImage('${image.id}')" class="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white w-10 py-1.5 rounded-lg transition-colors flex items-center justify-center" title="Xóa vĩnh viễn">
                            <i class="fas fa-times"></i>
                        </button>
                    `}
                </div>
            </div>
        `;
        
        galleryContainer.appendChild(itemDom);
    });
}

// Xóa giả (Đẩy vào thùng rác)
function softDeleteImage(targetId) {
    if (confirm('Bạn có muốn xóa hình này không?')) {
        db.collection('images').doc(targetId).update({ isDeleted: true })
        .then(() => {
            console.log("Đã đưa vào thùng rác Firestore:", targetId);
            if (typeof runGalleryLogic === 'function') runGalleryLogic();
        })
        .catch(err => console.error("Lỗi xóa tạm:", err));
    }
}

// Khôi phục ảnh (Đẩy từ thùng rác ra ngoài)
function restoreImage(targetId) {
    if (confirm('Bạn có muốn khôi phục hình này không?')) {
        db.collection('images').doc(targetId).update({ isDeleted: false })
        .then(() => {
            console.log("Khôi phục thành công từ thùng rác Firestore:", targetId);
            if (typeof runGalleryLogic === 'function') runGalleryLogic();
        })
        .catch(err => console.error("Lỗi khôi phục:", err));
    }
}

// Xóa Thật 100% (Xóa vĩnh viễn khỏi bộ nhớ và Storage)
async function hardDeleteImage(targetId) {
    if (confirm('Bạn có chắc chắn muốn xóa vĩnh viễn hình này không? Hành động này không thể hoàn tác.')) {
        try {
            // Tìm ảnh trong bộ nhớ để lấy đường dẫn Storage
            const image = window.appData.images.find(img => img.id === targetId);
            const storagePath = image ? image.storagePath : null;

            // 1. Xóa file trên Firebase Storage
            if (storagePath && storagePath !== 'undefined' && storagePath !== 'null' && !storagePath.startsWith('base64_fallback')) {
                const fileRef = storage.ref().child(storagePath);
                await fileRef.delete().catch(err => console.warn("File có thể đã bị xóa trên Storage:", err));
            }
            
            // 2. Xóa document trên Firestore
            await db.collection('images').doc(targetId).delete();
            
            // Cập nhật lại giao diện ngay lập tức
            if (typeof runGalleryLogic === 'function') runGalleryLogic();
            
        } catch (error) {
            console.error("Lỗi xóa vĩnh viễn:", error);
            alert("Lỗi khi xóa ảnh vĩnh viễn. Có thể do giới hạn quyền Firebase.");
        }
    }
}

// Dọn sạch thùng rác (Xóa vĩnh viễn tất cả)
async function emptyRecycleBin() {
    let deletedImages = window.appData.images.filter(img => img.isDeleted === true);
    
    if (deletedImages.length === 0) return;
    
    if (confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN ${deletedImages.length} ảnh trong thùng rác không? Hành động này không thể hoàn tác.`)) {
        for (const image of deletedImages) {
            try {
                if (image.storagePath && image.storagePath !== 'undefined' && image.storagePath !== 'null' && !image.storagePath.startsWith('base64_fallback')) {
                    const fileRef = storage.ref().child(image.storagePath);
                    await fileRef.delete().catch(err => console.warn("Storage file already deleted:", err));
                }
                await db.collection('images').doc(image.id).delete();
            } catch (error) {
                console.error("Lỗi khi xóa:", image.id, error);
            }
        }
        
        alert('Đã dọn sạch thùng rác!');
        if (typeof runGalleryLogic === 'function') runGalleryLogic();
    }
}

// Khôi phục tất cả ảnh trong thùng rác
function restoreAll() {
    let deletedImages = window.appData.images.filter(img => img.isDeleted === true);
    
    if (deletedImages.length === 0) return;
    
    if (confirm(`Bạn có chắc chắn muốn KHÔI PHỤC TẤT CẢ ${deletedImages.length} ảnh trong thùng rác không?`)) {
        Promise.all(deletedImages.map(img => db.collection('images').doc(img.id).update({ isDeleted: false })))
        .then(() => {
            console.log("Đã khôi phục tất cả ảnh từ thùng rác.");
            if (typeof runGalleryLogic === 'function') runGalleryLogic();
        })
        .catch(err => console.error("Lỗi khôi phục tất cả:", err));
    }
}
