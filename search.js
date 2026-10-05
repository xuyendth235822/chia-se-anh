/**
 * HỆ THỐNG QUẢN LÝ THƯ VIỆN CHÍNH (GỘP TÌM KIẾM THEO ĐỊA ĐIỂM, SẮP XẾP, BỘ LỌC CHỦ ĐỀ)
 */

window.currentFilterTag = 'Tất Cả';
window.isInRecycleBinMode = false;

// Hàm chuẩn hóa chuỗi tiếng Việt (bỏ dấu) để tìm kiếm linh hoạt (ví dụ: 'nui cam' khớp 'Núi Cấm')
function removeVietnameseTones(str) {
    if (!str) return '';
    str = str.toLowerCase();
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/[đĐ]/g, 'd');
    return str.trim();
}

// Xóa nhanh thanh tìm kiếm
function clearSearchInput() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
        const clearBtn = document.getElementById('clear-search-btn');
        if (clearBtn) clearBtn.classList.add('hidden');
        runGalleryLogic();
    }
}

// Hàm trung tâm xử lý Dữ liệu trước khi gọi kết xuất (render)
function runGalleryLogic() {
    let dataset = window.appData.images || [];

    // Bắt buộc lọc ảnh hiển thị theo Tab để đảm bảo khi vừa đăng nhập nó tải đúng
    if (window.appData.currentTab === 'my_photos') {
        dataset = dataset.filter(img => img.userEmail === window.appData.currentUser);
    } else if (window.appData.currentTab === 'community') {
        dataset = dataset.filter(img => img.isPublic === true);
    }

    // 1. Lọc theo trạng thái Thùng rác (Dùng thuộc tính isDeleted từ Firestore)
    if (window.isInRecycleBinMode) {
        dataset = dataset.filter(img => img.isDeleted === true);
        document.getElementById('gallery-title').innerHTML = `
            <div class="flex items-center gap-4">
                <span><i class="fas fa-trash-alt text-red-500"></i> Thùng Rác (Đã Xóa)</span>
                ${dataset.length > 0 ? `<button onclick="emptyRecycleBin()" class="text-xs bg-red-100 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm whitespace-nowrap"><i class="fas fa-times-circle"></i> Xóa tất cả</button>
                <button onclick="restoreAll()" class="text-xs bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm whitespace-nowrap"><i class="fas fa-undo"></i> Khôi phục tất cả</button>` : ''}
            </div>
        `;
    } else {
        // Chỉ hiện những ảnh KHÔNG nằm trong thùng rác
        dataset = dataset.filter(img => !img.isDeleted);
        document.getElementById('gallery-title').innerHTML = '<i class="fas fa-images text-blue-500"></i> Thư viện ảnh';
    }

    // 2. Lọc theo Chủ đề (Tag: Danh Lam Thắng Cảnh, Di Tích Lịch Sử, Phong Cảnh, Khác)
    if (!window.isInRecycleBinMode && window.currentFilterTag !== 'Tất Cả') {
        dataset = dataset.filter(img => {
            if (window.currentFilterTag === 'Khác') {
                return !['Danh Lam Thắng Cảnh', 'Di Tích Lịch Sử', 'Phong Cảnh'].includes(img.tag);
            }
            return img.tag === window.currentFilterTag;
        });
    }

    // 3. Lọc theo Từ khóa Tìm kiếm (Địa điểm chụp ảnh, Caption chú thích, Tên ảnh, Chủ đề)
    const rawSearch = (document.getElementById('search-input')?.value || '').trim();
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) {
        if (rawSearch !== '') clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
    }

    if (rawSearch !== '') {
        const searchLower = rawSearch.toLowerCase();
        const searchNoTone = removeVietnameseTones(rawSearch);

        dataset = dataset.filter(img => {
            const loc = (img.location || '').toLowerCase();
            const caption = (img.caption || '').toLowerCase();
            const name = (img.name || '').toLowerCase();
            const tag = (img.tag || '').toLowerCase();

            const locNoTone = removeVietnameseTones(loc);
            const captionNoTone = removeVietnameseTones(caption);
            const nameNoTone = removeVietnameseTones(name);
            const tagNoTone = removeVietnameseTones(tag);

            // Tìm kiếm chính xác có dấu HOẶC không dấu (vd: 'núi Cấm' hoặc 'nui cam' đều khớp)
            return loc.includes(searchLower) || locNoTone.includes(searchNoTone) ||
                   caption.includes(searchLower) || captionNoTone.includes(searchNoTone) ||
                   name.includes(searchLower) || nameNoTone.includes(searchNoTone) ||
                   tag.includes(searchLower) || tagNoTone.includes(searchNoTone);
        });
    }

    // 4. Sắp xếp (Sort)
    const sortMode = document.getElementById('sort-select')?.value || 'newest';
    
    if (sortMode === 'hearts') {
        // Yêu thích chỉ hiện những ảnh đã tim
        dataset = dataset.filter(img => (img.statHearts || 0) > 0);
    }
    
    dataset.sort((a, b) => {
        if (sortMode === 'newest') {
            return (b.timestamp || 0) - (a.timestamp || 0); // Mới tạo trước
        } else if (sortMode === 'hearts') {
            return (b.statHearts || 0) - (a.statHearts || 0); // Tim nhiều trước
        } else if (sortMode === 'views') {
            return (b.statViews || 0) - (a.statViews || 0); // Xem nhiều trước
        } else if (sortMode === 'size') {
            return (a.sizeRaw || 0) - (b.sizeRaw || 0);     // Nhẹ trước
        }
        return 0;
    });

    // Cập nhật số lượng trên nút Thùng rác
    updateRecycleBinCount();

    // 5. Kết xuất (Render)
    renderGallery(dataset);
}

// Gọi từ Navbar: Chuyển đổi giữa [Thư Viện Ảnh] và [Thùng Rác]
function viewRecycleBin(isActive) {
    window.isInRecycleBinMode = isActive;
    
    // Đổi màu Nút Thùng Rác trên Nav
    const btn = document.getElementById('recycle-bin-btn');
    if (isActive) {
        btn.innerHTML = '<i class="fas fa-arrow-left"></i> Quay lại';
        btn.setAttribute('onclick', 'viewRecycleBin(false)');
        btn.classList.add('bg-gray-500', 'text-white', 'border-gray-500');
        btn.classList.remove('text-red-500', 'hover:bg-red-50', 'border-red-100');
        // Ẩn thanh Tag khi vào thùng rác
        document.getElementById('tags-filter-container').style.display = 'none';
        document.getElementById('sort-select').style.display = 'none';
    } else {
        // Nút sẽ được update số lượng bởi updateRecycleBinCount trong runGalleryLogic
        btn.innerHTML = '<i class="fas fa-trash-alt"></i> Thùng rác';
        btn.setAttribute('onclick', 'viewRecycleBin(true)');
        btn.classList.remove('bg-gray-500', 'text-white', 'border-gray-500');
        btn.classList.add('text-red-500', 'hover:bg-red-50', 'border-red-100');
        document.getElementById('tags-filter-container').style.display = 'flex';
        document.getElementById('sort-select').style.display = 'block';
    }
    
    // Luôn dọn sạch ô tìm kiếm khi chuyển qua lại Thùng rác để tránh lỗi hiển thị sai
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) clearBtn.classList.add('hidden');
    
    runGalleryLogic();
}

// Cập nhật con số hiển thị trên nút Thùng Rác
function updateRecycleBinCount() {
    const btn = document.getElementById('recycle-bin-btn');
    if (!btn || window.isInRecycleBinMode) return; // Nếu đang ở TRONG thùng rác thì hiện chữ "Quay lại", không hiện số

    // Đếm số lượng ảnh đã xóa từ appData.images (đã được lọc theo tài khoản hiện tại từ storage.js)
    const count = (window.appData.images || []).filter(img => img.isDeleted === true).length;

    if (count > 0) {
        btn.innerHTML = `<i class="fas fa-trash-alt"></i> Thùng rác <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">${count}</span>`;
    } else {
        btn.innerHTML = `<i class="fas fa-trash-alt"></i> Thùng rác`;
    }
}

// Gọi từ Bộ Lọc Chủ Đề (Tag)
function setFilterTag(tagName) {
    window.currentFilterTag = tagName;
    
    // Cập nhật UI nút Tag (đổi màu nút đang Active)
    document.querySelectorAll('.tag-btn').forEach(btn => {
        if (btn.dataset.tag === tagName) {
            btn.classList.replace('bg-white', 'bg-blue-500');
            btn.classList.replace('text-gray-600', 'text-white');
            btn.classList.add('shadow-sm', 'border-blue-500');
            btn.classList.remove('border-gray-200');
        } else {
            btn.classList.replace('bg-blue-500', 'bg-white');
            btn.classList.replace('text-white', 'text-gray-600');
            btn.classList.remove('shadow-sm', 'border-blue-500');
            btn.classList.add('border-gray-200');
        }
    });

    runGalleryLogic();
}
