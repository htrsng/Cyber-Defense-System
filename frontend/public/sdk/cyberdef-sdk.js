/**
 * CyberDef SaaS SDK v1.0.0
 * Bọc website của bạn bằng một lớp bảo vệ.
 */
(function() {
  // 1. Get API Key and Config from script tag
  const scriptTag = document.currentScript || document.querySelector('script[src*="cyberdef-sdk.js"]');
  const API_KEY = scriptTag?.getAttribute('data-key');
  const API_URL = scriptTag?.getAttribute('data-url') || 'http://localhost:5000/api/sdk/event';
  
  if (!API_KEY) {
      console.warn('🛡️ [CyberDef] Cảnh báo: Không tìm thấy API Key. SDK chưa được kích hoạt.');
      return;
  }

  console.log('🛡️ [CyberDef] SDK đã khởi chạy và đang bảo vệ website.');

  // 2. Thu thập Device Fingerprint cơ bản
  const getFingerprint = () => ({
      screen: `${window.screen.width}x${window.screen.height}`,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      lang: navigator.language,
      platform: navigator.platform,
  });

  // 3. Hàm gửi Event về CyberDef API
  const sendEvent = async (type, metadata = {}) => {
      try {
          const res = await fetch(API_URL, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-CyberDef-Key': API_KEY
              },
              body: JSON.stringify({
                  type,
                  fingerprint: getFingerprint(),
                  metadata: { ...metadata, page: window.location.pathname },
                  userAgent: navigator.userAgent
              })
          });
          
          if (!res.ok) return null;
          
          const data = await res.json();
          if (data.blocked) {
              showBlockBanner(data.reasons);
          }
          return data;
      } catch (err) {
          // Bỏ qua lỗi mạng để không làm sập website khách hàng
          return null;
      }
  };

  // 4. UI: Hiển thị Banner khi bị block
  const showBlockBanner = (reasons = []) => {
      if (document.getElementById('cyberdef-block-banner')) return;
      
      const banner = document.createElement('div');
      banner.id = 'cyberdef-block-banner';
      banner.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; right: 0; background: #ff3d5a; color: white; z-index: 2147483647; padding: 15px; font-family: monospace; text-align: center; box-shadow: 0 4px 15px rgba(255,0,0,0.3);">
              <strong style="font-size: 16px;">⛔ TRUY CẬP BỊ TỪ CHỐI BỞI CYBERDEF</strong><br/>
              <span style="font-size: 13px; opacity: 0.9;">Hành vi của bạn đã bị nhận diện là tấn công mạng.</span>
              ${reasons.length ? `<br/><span style="font-size: 11px; opacity: 0.8; margin-top: 5px; display: block;">Lý do: ${reasons.join(' | ')}</span>` : ''}
          </div>
      `;
      document.body.prepend(banner);
  };

  // 5. Theo dõi Login Form (Brute Force Detection)
  const trackForms = () => {
      document.addEventListener('submit', (e) => {
          const form = e.target;
          if (!form || form.tagName !== 'FORM') return;

          // Kiểm tra xem có phải login form không (dựa vào có trường password)
          const hasPassword = Array.from(form.elements).some(el => el.type === 'password');
          
          // Lấy email/username nếu có
          let username = '';
          const emailInput = form.querySelector('input[type="email"], input[name="username"], input[name="email"]');
          if (emailInput) username = emailInput.value;

          if (hasPassword) {
              // Gửi event LOGIN_ATTEMPT
              sendEvent('LOGIN_FAILED', {
                  action: 'form_submit',
                  username: username || 'unknown'
              });
          }

          // Kiểm tra Honeypot
          const honeypot = form.querySelector('input[name="cyberdef_hp"]');
          if (honeypot && honeypot.value) {
              sendEvent('BOT_DETECTED', { reason: 'honeypot_filled' });
              e.preventDefault(); // Chặn form submit
          }
      });
  };

  // 6. Theo dõi XSS trên các thẻ Input
  const trackXSS = () => {
      const xssPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:|onerror=|onload=/i;
      
      document.addEventListener('change', (e) => {
          const el = e.target;
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
              if (xssPattern.test(el.value)) {
                  sendEvent('XSS_ATTEMPT', {
                      payload: el.value.substring(0, 50) + '...',
                      fieldName: el.name || el.id || 'unknown'
                  });
              }
          }
      });
  };

  // 7. Inject Honeypot ẩn vào mọi form
  const injectHoneypots = () => {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
          if (!form.querySelector('input[name="cyberdef_hp"]')) {
              const input = document.createElement('input');
              input.type = 'text';
              input.name = 'cyberdef_hp';
              input.value = '';
              input.style.display = 'none'; // Ẩn khỏi người dùng thật
              input.tabIndex = -1;
              form.appendChild(input);
          }
      });
  };

  // Khởi động
  window.addEventListener('DOMContentLoaded', () => {
      trackForms();
      trackXSS();
      injectHoneypots();
  });
  
  // Xử lý trường hợp DOM đã load
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
      trackForms();
      trackXSS();
      injectHoneypots();
  }
})();
