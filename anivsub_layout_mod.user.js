// ==UserScript==
// @name        anivsub_layout_mod
// @namespace   https://www.github.com/1my3kk1
// @version     1.1
// @description anivsub layout modification
// @author      yekki
// @include     https://animevietsub.*/*
// @icon        https://i.pinimg.com/1200x/dc/a3/d0/dca3d0f2e04d4cccd0fdb200eecf39b5.jpg
// @run-at      document-start
// ==/UserScript==

//=====================================================================
// 1. DINH NGHIA BIEN
//=====================================================================

// .Body.Container - set maxWidth va padding
let thanBody = null;

// the Aside - xoa o trang phim
let theAside = null;

// announcement - xoa o trang phim
let announcement = null;

// breadcrumb - xoa o trang phim
let breadcrumb = null;

// the main xoa padding-right - xoa o trang phim
let theMain = null;

// media-player-box height 100vh - chinh sua o trang phim
let mediaPlayerBox = null;

// nut quay lai xem - fixed bottom-right
let nutQuayTroLaiPhim = null;

// IntersectionObserver theo doi vi tri mediaPlayerBox
let observerCuotPhim = null;

// class content - sua padding = 0 - chinh sua o trang phim
let content = null;
//=====================================================================
// 2. HAM KIEM TRA TRANG
//=====================================================================

// kiemTraTrangPhim: true neu url chua "/phim/"
function kiemTraTrangPhim(url) {
    if (url.includes("/phim/")) {
        return true;
    }
    return false;
}

//=====================================================================
// 2.5 TAO NUT QUAY LAI XEM
//=====================================================================

// taoNutQuayTroLaiPhim: tao nut fixed bottom-right, click de keo ve player
function taoNutQuayTroLaiPhim() {
    nutQuayTroLaiPhim = document.createElement('button');
    nutQuayTroLaiPhim.textContent = 'quay_lai_xem';
    nutQuayTroLaiPhim.style.cssText = [
        'position: fixed',
        'bottom: 2rem',
        'right: 2rem',
        'z-index: 9999',
        'padding: 2px 15px',
        'background: #1300a0',
        'color: #ffffff',
        'border: none',
        // 'border-radius: 0.5rem',
        'font-size: 1rem',
        'cursor: pointer',
        'box-shadow: 0 0.25rem 0.75rem rgba(0,0,0,0.3)',
        'display: none',
        'font-weight: bold'
    ].join(';');

    document.body.appendChild(nutQuayTroLaiPhim);

    nutQuayTroLaiPhim.addEventListener('click', function() {
        var player = document.querySelector('#media-player-box');
        if (player) {
            player.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

//=====================================================================
// 2.6 THEO DOI VI TRI MEDIA PLAYER
//=====================================================================

// quanSatMediaPlayerBox: tao IntersectionObserver de theo doi mediaPlayerBox
// khi player ra khoi viewport => hien nut
// khi player vao viewport => an nut
function quanSatMediaPlayerBox() {
    // disconnect observer cu de tranh memory leak
    if (observerCuotPhim) {
        observerCuotPhim.disconnect();
        observerCuotPhim = null;
    }

    // khong phai trang phim hoac nut chua tao => an nut va thoat
    if (!nutQuayTroLaiPhim || !kiemTraTrangPhim(window.location.href)) {
        if (nutQuayTroLaiPhim) {
            nutQuayTroLaiPhim.style.display = 'none';
        }
        return;
    }

    var player = document.querySelector('#media-player-box');
    if (!player) {
        nutQuayTroLaiPhim.style.display = 'none';
        return;
    }

    observerCuotPhim = new IntersectionObserver(function(cacPhanTu) {
        // isIntersecting: true = element dang trong man hinh
        // isIntersecting: false = element da bi cuon ra ngoai
        if (cacPhanTu[0].isIntersecting) {
            nutQuayTroLaiPhim.style.display = 'none';
        } else {
            nutQuayTroLaiPhim.style.display = 'block';
        }
    }, {
        threshold: 0.5
    });

    observerCuotPhim.observe(player);
}

//=====================================================================
// 3. HAM AP DUNG LAYOUT
//=====================================================================

// apDungLayout: query DOM va ap dung layout
function apDungLayout() {
    // query lai moi lan de lay element moi nhat (AJAX)
    thanBody = document.querySelector('.Body.Container');
    theAside = document.querySelector('Aside');
    announcement = document.querySelector('.announcement');
    breadcrumb = document.querySelector('.breadcrumb');
    theMain = document.querySelector('main');
    content = document.querySelector('.Content');
    mediaPlayerBox = document.querySelector('#media-player-box');
    if (thanBody) {
        thanBody.style.maxWidth = "none";
        thanBody.style.padding = "1rem 0";
    }

    if (kiemTraTrangPhim(window.location.href)) {
        if (theAside) {
            theAside.remove();
        }
        if (announcement) {
            announcement.remove();
        }
        if (breadcrumb) {
            breadcrumb.remove();
        }
        if (theMain) {
            theMain.style.paddingRight = "0";
        }
        if (mediaPlayerBox) {
            mediaPlayerBox.style.height = "100vh";
        }
        if (content) {
            content.style.padding = "0";
        }
    }
}

//=====================================================================
// 4. KHOI TAO
//=====================================================================

// hamKhoiTao: ap dung layout + theo doi DOM thay doi
function hamKhoiTao() {
    // tao nut quay lai xem 1 lan duy nhat
    taoNutQuayTroLaiPhim();

    apDungLayout();
    quanSatMediaPlayerBox();

    const observer = new MutationObserver(function() {
        apDungLayout();
        // DOM thay doi => player cu co the bi xoa, player moi duoc tao
        // can chay lai de observer phan tu moi
        quanSatMediaPlayerBox();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
    });
}

//=====================================================================
// 5. CHO DOM SAN SANG
//=====================================================================

document.addEventListener('DOMContentLoaded', function() {
    hamKhoiTao();
});
