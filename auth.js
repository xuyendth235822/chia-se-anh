/**
 * CHỨC NĂNG: XÁC THỰC NGƯỜI DÙNG (AUTH)
 * Tệp này chứa xử lý Đăng nhập, Đăng ký và Đăng xuất thông qua nền tảng Firebase.
 */

// Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyATUImtMbMPuhVh5rp5AfCjx-XysFkpry4",
    authDomain: "chiaseanh-90255.firebaseapp.com",
    projectId: "chiaseanh-90255",
    storageBucket: "chiaseanh-90255.appspot.com",
    messagingSenderId: "1098994754786",
    appId: "1:1098994754786:web:68b70076837d016519aabb",
    measurementId: "G-14HXZXNWKZ"
};

// Khởi tạo Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Khởi tạo Firestore và Storage để các file khác có thể gọi
const db = firebase.firestore();
const storage = firebase.storage();

// Hàm chính xử lý nút bấm Đăng ký & Đăng nhập
function handleAuth(type) {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsgContainer = document.getElementById('error-msg');
    const errorText = document.getElementById('error-text');

    // Reset trạng thái lỗi
    errorMsgContainer.classList.add('hidden');
    errorText.innerText = '';

    // Kiểm tra tính hợp lệ cơ bản
    if (!email || !password) {
        showError('Vui lòng nhập đầy đủ Email và Mật khẩu!');
        return;
    }

    if (type === 'register') {
        // Thực thi tạo tài khoản bằng Firebase
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                alert("Chúc mừng! Đăng ký tài khoản thành công.");
                // onAuthStateChanged sẽ tự động bắt sự kiện và gọi showApp
            })
            .catch((error) => {
                showError('Lỗi đăng ký: ' + translateAuthError(error.code));
            });
    } else if (type === 'login') {
        // Thực thi đăng nhập
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // onAuthStateChanged sẽ tự động bắt sự kiện và gọi showApp
            })
            .catch((error) => {
                showError('Lỗi đăng nhập: ' + translateAuthError(error.code));
            });
    }
}

// Hàm xử lý nút Thoát
function handleLogout() {
    firebase.auth().signOut().then(() => {
        // Tải lại toàn bộ trang để xóa sạch mọi dữ liệu tạm trong RAM một cách an toàn nhất
        window.location.reload();
    }).catch((error) => {
        console.error("Xảy ra lỗi khi đăng xuất", error);
        alert("Đã xảy ra lỗi khi đăng xuất!");
    });
}

// Hàm hiển thị thông báo lỗi lên UI
function showError(message) {
    const errorMsgContainer = document.getElementById('error-msg');
    const errorText = document.getElementById('error-text');

    errorText.innerText = message;
    errorMsgContainer.classList.remove('hidden');

    // Tạo hiệu ứng lắc nhỏ để thu hút chú ý (tùy chọn)
    errorMsgContainer.classList.add('animate-bounce');
    setTimeout(() => {
        errorMsgContainer.classList.remove('animate-bounce');
    }, 1000);
}

// Hàm phiên dịch mã lỗi Firebase khô khan sang Tiếng Việt
function translateAuthError(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Định dạng Email không hợp lệ.';
        case 'auth/user-not-found':
            return 'Tài khoản không tồn tại trên hệ thống.';
        case 'auth/wrong-password':
            return 'Mật khẩu sai. Gợi ý: Hãy kiểm tra Caps Lock.';
        case 'auth/email-already-in-use':
            return 'Email này đã được sử dụng bởi một ai đó.';
        case 'auth/weak-password':
            return 'Mật khẩu quá yếu (Yêu cầu ít nhất 6 ký tự).';
        default:
            return 'Lỗi hệ thống (' + errorCode + '). Thử lại sau!';
    }
}

// Trình nghe sự kiện (Listener): Tự động vào App nếu tài khoản đã lưu phiên (cookies/localstorage)
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Tài khoản đã có sẵn phiên làm việc => không cần bắt đăng nhập lại
        showApp(user.email);
    }
});

// Hàm ẩn/hiện mật khẩu
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const icon = document.getElementById('toggle-password-icon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}
