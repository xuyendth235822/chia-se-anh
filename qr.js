/**
 * CHỨC NĂNG: TẠO MÃ QR ĐỂ CHIA SẺ VÀ QUÉT ĐIỆN THOẠI
 */

function showQRCode(imgId) {
    const modal = document.getElementById('qr-modal');
    const qrContainer = document.getElementById('qrcode-container');
    const qrStatus = document.getElementById('qr-status');
    
    // Lấy link gốc để quét
    const image = window.appData.images.find(img => img.id === imgId);
    if (!image) return;

    // Mở Modal
    modal.classList.remove('hidden');
    qrContainer.style.opacity = 0;
    qrContainer.innerHTML = ''; // Xóa QR cũ
    qrStatus.classList.remove('hidden');
    
    let shareLink = "";
    
    // Dùng trực tiếp link Firebase Storage để điện thoại nào cũng quét và xem được
    if (image.url && image.url.startsWith('http')) {
        shareLink = image.url;
        qrStatus.innerText = "Mã đã sẵn sàng! Quét bằng điện thoại để xem trực tiếp.";
        qrStatus.className = "text-xs text-green-500 font-bold mt-4";
    } else {
        // Fallback
        let basePath = window.location.href.split('?')[0].split('#')[0];
        
        // KHẮC PHỤC LỖI "127.0.0.1 TỪ CHỐI KẾT NỐI":
        // Điện thoại không thể hiểu 127.0.0.1. Cần đổi sang IP LAN của máy tính.
        if (basePath.includes('127.0.0.1') || basePath.includes('localhost')) {
            const userIP = prompt("Để điện thoại quét được, vui lòng nhập địa chỉ IPv4 LAN của máy tính bạn (Ví dụ: 192.168.1.x).\nNếu bạn không biết, hãy mở CMD gõ ipconfig để xem IPv4 Address.", "192.168.1.");
            if (userIP && userIP.trim() !== "") {
                basePath = basePath.replace('127.0.0.1', userIP.trim()).replace('localhost', userIP.trim());
            }
        }

        if (basePath.endsWith('index.html')) {
            basePath = basePath.replace('index.html', 'view_photo.html');
        } else {
            if (!basePath.endsWith('/')) basePath += '/';
            basePath += 'view_photo.html';
        }
        shareLink = `${basePath}?share_id=${imgId}`;
        
        if (shareLink.includes('127.0.0.1') || shareLink.includes('localhost')) {
            qrStatus.innerText = "⚠️ LƯU Ý: Vẫn dùng 127.0.0.1, điện thoại KHÔNG THỂ quét được.";
            qrStatus.className = "text-xs text-red-500 font-bold mt-4";
        } else {
            qrStatus.innerText = "Mã đã tạo! Lưu ý: Điện thoại và máy tính phải dùng chung một mạng WiFi.";
            qrStatus.className = "text-xs text-blue-500 font-bold mt-4";
        }
    }
    
    try {
        // Tạo QR Code cục bộ bằng thư viện QRCode.js siêu nhẹ
        new QRCode(qrContainer, {
            text: shareLink,
            width: 256,
            height: 256,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
        
        // Hiện mã QR
        setTimeout(() => {
            qrContainer.style.opacity = 1;
        }, 100);
    } catch (e) {
        console.error("Lỗi tạo QR Code:", e);
        qrStatus.innerText = "❌ Lỗi hệ thống: Vui lòng F5 trang hoặc tải lại trang để nhận file thư viện Offline.";
        qrStatus.className = "text-xs text-red-500 font-bold mt-4";
    }
}

function closeQrModal() {
    document.getElementById('qr-modal').classList.add('hidden');
    document.getElementById('qrcode-container').innerHTML = "";
}
