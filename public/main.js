document.addEventListener('DOMContentLoaded', () => {
    // Internationalization (i18n)
    const i18n = {
        en: {
            header_subtitle: "Shorten your links, expand your reach.",
            label_url: "Your URL",
            label_custom: "Back-half (optional)",
            title_custom_input: "Only English letters and numbers",
            btn_shorten: "Shorten",
            label_result: "Your shortened link:",
            title_copy: "Copy to clipboard",
            text_copied: "Copied!",
            label_qr: "QR Code:",
            recent_title: "Recent Links",
            title_clear: "Clear History",
            title_toggle: "Minimize/Expand",
            title_close: "Close",
            modal_qr_title: "Scan QR Code",
            btn_qr_copy: "Copy Image",
            btn_qr_download: "Download",
            modal_confirm_title: "Confirm Deletion",
            modal_confirm_text: "Are you sure you want to delete this?",
            btn_yes: "Yes",
            btn_no: "No",
            alert_validating: "Validating...",
            alert_valid: "Valid URL",
            alert_invalid: "Invalid URL format or unreachable",
            alert_error: "An error occurred while shortening the link"
        },
        th: {
            header_subtitle: "ย่อลิงก์ให้สั้นลง เพื่อการเข้าถึงที่มากกว่า",
            label_url: "ลิงก์ของคุณ",
            label_custom: "ชื่อที่ต้องการ (เลือกได้)",
            title_custom_input: "เฉพาะตัวอักษรภาษาอังกฤษและตัวเลขเท่านั้น",
            btn_shorten: "ย่อลิงก์",
            label_result: "ลิงก์ที่ย่อแล้วของคุณ:",
            title_copy: "คัดลอกไปยังคลิปบอร์ด",
            text_copied: "คัดลอกแล้ว!",
            label_qr: "คิวอาร์โค้ด:",
            recent_title: "ประวัติการย่อลิงก์",
            title_clear: "ล้างประวัติ",
            title_toggle: "ย่อ/ขยาย",
            title_close: "ปิด",
            modal_qr_title: "สแกนคิวอาร์โค้ด",
            btn_qr_copy: "คัดลอกรูปภาพ",
            btn_qr_download: "ดาวน์โหลด",
            modal_confirm_title: "ยืนยันการลบ",
            modal_confirm_text: "คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?",
            btn_yes: "ใช่, ลบเลย",
            btn_no: "ไม่",
            alert_validating: "กำลังตรวจสอบ...",
            alert_valid: "ลิงก์ถูกต้อง",
            alert_invalid: "รูปแบบลิงก์ไม่ถูกต้องหรือเข้าถึงไม่ได้",
            alert_error: "เกิดข้อผิดพลาดขณะย่อลิงก์"
        }
    };

    let currentLang = localStorage.getItem('lang') || 'en';

    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        document.documentElement.lang = lang;
        
        document.getElementById('lang-en').classList.toggle('active', lang === 'en');
        document.getElementById('lang-th').classList.toggle('active', lang === 'th');
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (i18n[lang][key]) el.textContent = i18n[lang][key];
        });
        
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (i18n[lang][key]) el.title = i18n[lang][key];
        });
        
        // Re-render dynamic content to apply language changes
        if (typeof loadLocalHistory === 'function') {
            loadLocalHistory();
        }
    }

    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-th').addEventListener('click', () => setLanguage('th'));


    const form = document.getElementById('shorten-form');
    const urlInput = document.getElementById('url-input');
    const customCodeInput = document.getElementById('custom-code-input');
    const submitBtn = document.getElementById('submit-btn');
    const resultContainer = document.getElementById('result-container');
    const shortLink = document.getElementById('short-link');
    const copyBtn = document.getElementById('copy-btn');
    const copyFeedback = document.getElementById('copy-feedback');
    const recentList = document.getElementById('recent-list');
    const qrCodeImg = document.getElementById('qr-code-img');
    const qrContainer = document.querySelector('.qr-container');
    
    const validationFeedback = document.getElementById('validation-feedback');
    const validationIcon = document.getElementById('validation-icon');
    const validationText = document.getElementById('validation-text');

    const validIconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    const invalidIconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

    // Sound effect generator (Apple Pay style chime)
    function playSuccessSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            
            // First tone (A5)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, ctx.currentTime);
            gain1.gain.setValueAtTime(0, ctx.currentTime);
            gain1.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
            gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.15);

            // Second tone (C#6)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1);
            gain2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
            gain2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(ctx.currentTime + 0.1);
            osc2.stop(ctx.currentTime + 0.4);
        } catch (e) {
            console.log('Audio playback failed', e);
        }
    }

    // Initialize language on load (this also loads local history)
    setLanguage(currentLang);

    // Validation Debounce logic
    let validationTimeout;
    urlInput.addEventListener('input', () => {
        clearTimeout(validationTimeout);
        validationFeedback.classList.add('hidden');
        
        const url = urlInput.value.trim();
        if (!url) return;

        validationTimeout = setTimeout(async () => {
            try {
                const response = await fetch('/api/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url })
                });
                const data = await response.json();
                
                validationFeedback.classList.remove('hidden', 'valid', 'invalid');
                if (data.valid) {
                    validationFeedback.classList.add('valid');
                    validationIcon.innerHTML = validIconSvg;
                    validationText.textContent = i18n[currentLang].alert_valid;
                } else {
                    validationFeedback.classList.add('invalid');
                    validationIcon.innerHTML = invalidIconSvg;
                    validationText.textContent = i18n[currentLang].alert_invalid;
                }
            } catch (error) {
                console.error('Validation error:', error);
            }
        }, 800); // 800ms delay
    });

    // Custom code validation (only letters and numbers)
    customCodeInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const originalUrl = urlInput.value.trim();
        if (!originalUrl) return;
        
        const customCode = customCodeInput.value.trim();

        let processedUrl = originalUrl;
        if (!/^https?:\/\//i.test(processedUrl)) {
            processedUrl = 'http://' + processedUrl;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = currentLang === 'th' ? 'กำลังย่อลิงก์...' : 'Shortening...';

        try {
            const payload = { url: processedUrl };
            if (customCode) payload.customCode = customCode;

            const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                // Show result
                const fullShortUrl = data.shortUrl;
                const displayUrl = fullShortUrl.replace(/^https?:\/\//, '');
                
                shortLink.href = fullShortUrl;
                shortLink.textContent = displayUrl;
                
                // Show QR code
                qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(fullShortUrl)}`;
                qrCodeImg.dataset.url = fullShortUrl;
                qrCodeImg.dataset.id = data.shortId;
                
                resultContainer.classList.remove('hidden');
                
                // Clear input
                urlInput.value = '';
                customCodeInput.value = '';
                validationFeedback.classList.add('hidden');
                
                // Save to local history
                saveToLocalHistory({
                    shortUrl: fullShortUrl,
                    shortId: data.shortId,
                    originalUrl: processedUrl
                });
            } else {
                alert(data.error || 'Failed to shorten URL');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(i18n[currentLang].alert_error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = i18n[currentLang].btn_shorten;
        }
    });

    copyBtn.addEventListener('click', () => {
        const urlToCopy = shortLink.href;
        navigator.clipboard.writeText(urlToCopy).then(() => {
            playSuccessSound();
            copyFeedback.classList.remove('hidden');
            setTimeout(() => {
                copyFeedback.classList.add('hidden');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });

    const toggleRecentBtn = document.getElementById('toggle-recent-btn');
    const toggleRecentIcon = document.getElementById('toggle-recent-icon');
    const recentContent = document.getElementById('recent-content');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    const confirmModal = document.getElementById('confirm-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalBtnYes = document.getElementById('modal-btn-yes');
    const modalBtnNo = document.getElementById('modal-btn-no');

    const qrModal = document.getElementById('qr-modal');
    const qrCloseBtn = document.getElementById('qr-close-btn');
    const qrCodeLarge = document.getElementById('qr-code-large');
    const qrCopyBtn = document.getElementById('qr-copy-btn');
    const qrDownloadBtn = document.getElementById('qr-download-btn');
    
    let pendingConfirmAction = null;

    // QR Modal Logic
    qrCodeImg.addEventListener('click', () => {
        const url = qrCodeImg.dataset.url;
        const id = qrCodeImg.dataset.id;
        if (!url) return;
        
        qrCodeLarge.src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
        qrCodeLarge.dataset.id = id;
        qrModal.classList.remove('hidden');
    });

    qrCloseBtn.addEventListener('click', () => qrModal.classList.add('hidden'));
    qrModal.addEventListener('click', (e) => {
        if (e.target === qrModal) qrModal.classList.add('hidden');
    });

    qrDownloadBtn.addEventListener('click', async () => {
        try {
            qrDownloadBtn.textContent = currentLang === 'th' ? 'กำลังโหลด...' : 'Downloading...';
            const response = await fetch(qrCodeLarge.src);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `MyShortURL-${qrCodeLarge.dataset.id}.png`;
            a.click();
            playSuccessSound();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download QR code', error);
            alert(currentLang === 'th' ? 'เกิดข้อผิดพลาดในการดาวน์โหลด' : 'Failed to download QR code.');
        } finally {
            qrDownloadBtn.textContent = i18n[currentLang].btn_qr_download;
        }
    });

    qrCopyBtn.addEventListener('click', async () => {
        try {
            qrCopyBtn.textContent = 'Copying...';
            const response = await fetch(qrCodeLarge.src);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            playSuccessSound();
            qrCopyBtn.textContent = i18n[currentLang].text_copied;
            setTimeout(() => qrCopyBtn.textContent = i18n[currentLang].btn_qr_copy, 2000);
        } catch (error) {
            console.error('Failed to copy QR code', error);
            alert(currentLang === 'th' ? 'เบราว์เซอร์ของคุณไม่รองรับการคัดลอกรูปภาพ' : 'Failed to copy. Your browser might not support copying images.');
            qrCopyBtn.textContent = i18n[currentLang].btn_qr_copy;
        }
    });

    function showConfirmModal(message, actionCallback) {
        modalMessage.textContent = message;
        pendingConfirmAction = actionCallback;
        confirmModal.classList.remove('hidden');
    }

    function closeConfirmModal() {
        confirmModal.classList.add('hidden');
        pendingConfirmAction = null;
    }

    modalBtnYes.addEventListener('click', () => {
        if (pendingConfirmAction) pendingConfirmAction();
        closeConfirmModal();
    });

    modalBtnNo.addEventListener('click', closeConfirmModal);

    // Toggle recent links visibility
    toggleRecentBtn.addEventListener('click', () => {
        recentContent.classList.toggle('collapsed');
        if (recentContent.classList.contains('collapsed')) {
            toggleRecentIcon.style.transform = 'rotate(180deg)';
        } else {
            toggleRecentIcon.style.transform = 'rotate(0deg)';
        }
    });

    // Clear all history
    clearHistoryBtn.addEventListener('click', () => {
        const msg = currentLang === 'th' ? 'คุณแน่ใจหรือไม่ว่าต้องการล้างประวัติลิงก์ทั้งหมด?' : 'Are you sure you want to clear all your recent links history?';
        showConfirmModal(msg, () => {
            localStorage.removeItem('myShortUrlHistory');
            renderRecentLinks([]);
        });
    });

    function saveToLocalHistory(linkObj) {
        let history = JSON.parse(localStorage.getItem('myShortUrlHistory') || '[]');
        // Add to beginning
        history.unshift(linkObj);
        // Keep only top 5
        if (history.length > 5) history = history.slice(0, 5);
        
        localStorage.setItem('myShortUrlHistory', JSON.stringify(history));
        renderRecentLinks(history);
    }

    function loadLocalHistory() {
        const history = JSON.parse(localStorage.getItem('myShortUrlHistory') || '[]');
        renderRecentLinks(history);
    }
    
    function deleteFromHistory(index) {
        const msg = currentLang === 'th' ? 'คุณแน่ใจหรือไม่ว่าต้องการลบลิงก์นี้ออกจากประวัติ?' : 'Are you sure you want to delete this specific link from your history?';
        showConfirmModal(msg, () => {
            let history = JSON.parse(localStorage.getItem('myShortUrlHistory') || '[]');
            history.splice(index, 1);
            localStorage.setItem('myShortUrlHistory', JSON.stringify(history));
            renderRecentLinks(history);
        });
    }

    function renderRecentLinks(links) {
        recentList.innerHTML = '';
        if (links.length === 0) {
            const noLinkMsg = currentLang === 'th' ? 'ยังไม่มีประวัติการย่อลิงก์' : 'No recent links yet.';
            recentList.innerHTML = `<li><span class="recent-link-original">${noLinkMsg}</span></li>`;
            return;
        }

        links.forEach((link, index) => {
            const li = document.createElement('li');
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'recent-list-info';
            
            const shortA = document.createElement('a');
            shortA.href = link.shortUrl;
            shortA.target = '_blank';
            shortA.className = 'recent-link-short';
            shortA.textContent = link.shortUrl.replace(/^https?:\/\//, '');

            const origSpan = document.createElement('span');
            origSpan.textContent = link.originalUrl;
            origSpan.className = 'recent-link-original';
            origSpan.title = link.originalUrl;
            
            infoDiv.appendChild(shortA);
            infoDiv.appendChild(origSpan);

            const qrBtn = document.createElement('button');
            qrBtn.className = 'icon-btn';
            qrBtn.title = i18n[currentLang].title_copy;
            qrBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>';
            qrBtn.addEventListener('click', () => {
                qrCodeLarge.src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(link.shortUrl)}`;
                qrCodeLarge.dataset.id = link.shortId;
                qrModal.classList.remove('hidden');
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-link-btn';
            deleteBtn.title = 'Delete';
            deleteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
            deleteBtn.addEventListener('click', () => deleteFromHistory(index));

            const actionsDiv = document.createElement('div');
            actionsDiv.style.display = 'flex';
            actionsDiv.style.gap = '0.5rem';
            actionsDiv.appendChild(qrBtn);
            actionsDiv.appendChild(deleteBtn);

            li.appendChild(infoDiv);
            li.appendChild(actionsDiv);
            recentList.appendChild(li);
        });
    }
});
