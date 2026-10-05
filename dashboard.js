/**
 * CHỨC NĂNG 3: BÁO CÁO THỐNG KÊ (Dashboard Analytics)
 */

function openDashboard() {
    const modal = document.getElementById('dashboard-modal');
    
    // 1. Tính TỔNG DUNG LƯỢNG ĐÃ DÙNG
    // Mỗi file size lưu dạng "12.5 KB", ta cúp đi chữ " KB" để lấy số
    let totalKb = 0;
    window.appData.images.forEach(img => {
        let numericSize = parseFloat(img.size.replace(' KB', ''));
        if(!isNaN(numericSize)) {
            totalKb += numericSize;
        }
    });

    let displaySize = `${totalKb.toFixed(1)} KB`;
    if (totalKb > 1024) { // Nếu vượt quá 1MB
        displaySize = `${(totalKb / 1024).toFixed(2)} MB`;
    }
    document.getElementById('dash-storage').innerText = displaySize;

    // 2. Tìm ẢNH ĐƯỢC XEM NHIỀU NHẤT
    const imageList = window.appData.images;
    if (imageList.length > 0) {
        let topImg = imageList[0];
        imageList.forEach(img => {
            // Xem xét tiêu chí "nhiều tương tác nhất" (sum của View + Share + Download + Tim)
            const currentTotal = img.statViews + img.statShares + img.statDownloads + (img.statHearts || 0);
            const topTotal = topImg.statViews + topImg.statShares + topImg.statDownloads + (topImg.statHearts || 0);
            
            if (currentTotal > topTotal) {
                topImg = img;
            }
        });
        
        let hotTxt = `${topImg.name} <span class="text-xs text-orange-500 font-normal block mt-1">(💖 ${topImg.statHearts || 0} | 👁 ${topImg.statViews} | 🔗 ${topImg.statShares} | ⬇️ ${topImg.statDownloads})</span>`;
        // Nếu vẫn không có ai xem thì vinh danh ảnh đầu lên thôi
        const totalTopStats = topImg.statViews + topImg.statShares + topImg.statDownloads + (topImg.statHearts || 0);
        if (totalTopStats === 0) {
            hotTxt = `${topImg.name} <span class="text-xs font-normal text-gray-400 block mt-1">(Chưa C.Ai Tương Tác)</span>`;
        }
        
        document.getElementById('dash-top-img').innerHTML = hotTxt;
    } else {
        document.getElementById('dash-top-img').innerText = "Chưa đăng tải ảnh nào.";
    }

    // 3. Hiện Modal
    modal.classList.remove('hidden');
    updateUptimeDisplay(); // Cập nhật đồng hồ tức thì
}

function updateUptimeDisplay() {
    const elm = document.getElementById('dash-uptime');
    if (!elm) return;

    let diffMs = Date.now() - window.appData.startTime;
    let totalSeconds = Math.floor(diffMs / 1000);
    
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    
    let uptStr = "";
    if (hours > 0) uptStr += `${hours} giờ `;
    if (minutes > 0 || hours > 0) uptStr += `${minutes} phút `;
    uptStr += `${seconds} giây`;

    elm.innerText = uptStr;
}

function closeDashboard() {
    document.getElementById('dashboard-modal').classList.add('hidden');
}
