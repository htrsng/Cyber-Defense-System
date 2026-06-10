import { useState } from 'react';

export default function PricingPage() {
    const [faqOpen, setFaqOpen] = useState(0);

    const plans = [
        {
            name: 'FREE',
            price: '$0',
            period: '/tháng',
            desc: 'Bảo vệ cơ bản cho dự án nhỏ.',
            features: [
                { text: '1 website', included: true },
                { text: '1,000 requests/ngày', included: true },
                { text: 'Basic WAF', included: true },
                { text: 'Threat logs', included: true },
                { text: 'Risk Scoring', included: false },
                { text: 'Tarpit / Honeypot', included: false },
                { text: 'Email alerts', included: false },
            ],
            btnText: 'Bắt đầu miễn phí',
            btnClass: 'btn-ghost'
        },
        {
            name: 'PRO',
            price: '$9',
            period: '/tháng',
            desc: 'Ngăn chặn gian lận, giảm rủi ro.',
            isCurrent: true,
            features: [
                { text: '10 websites', included: true },
                { text: '100,000 requests/ngày', included: true },
                { text: 'Advanced WAF', included: true },
                { text: 'Risk Scoring + Breakdown', included: true },
                { text: 'Tarpit + Honeypot', included: false },
                { text: 'Email alerts', included: true },
                { text: 'Analytics reports', included: true },
            ],
            btnText: 'Plan hiện tại',
            btnClass: 'btn-ghost'
        },
        {
            name: 'BUSINESS',
            price: '$29',
            period: '/tháng',
            desc: 'Bảo vệ API, ngăn giao dịch bất thường.',
            isRecommended: true,
            features: [
                { text: '50 websites', included: true },
                { text: '1M requests/ngày', included: true },
                { text: 'Advanced Fraud Engine', included: true },
                { text: 'Tarpit + Honeypot', included: true },
                { text: 'Geo Blocking', included: true },
                { text: 'Attack Intelligence', included: true },
                { text: 'Security Reports', included: true },
            ],
            btnText: 'Nâng cấp Business',
            btnClass: 'btn-primary'
        },
        {
            name: 'ENTERPRISE',
            price: 'Liên hệ',
            period: '',
            desc: 'Dành cho Ngân hàng, Fintech, TMĐT.',
            features: [
                { text: 'Unlimited websites', included: true },
                { text: 'Unlimited requests', included: true },
                { text: 'Custom Rule Engine', included: true },
                { text: 'Priority support 24/7', included: true },
                { text: 'SLA 99.9%', included: true },
                { text: 'Dedicated IP', included: true },
                { text: 'Audit logs export', included: true },
            ],
            btnText: 'Liên hệ Sale',
            btnClass: 'btn-ghost'
        }
    ];

    const faqs = [
        { q: 'Tích hợp mất bao lâu?', a: '3 phút: copy API key, mount middleware, nhúng SDK.' },
        { q: 'Có thể cancel bất cứ lúc nào không?', a: 'Có. Không có hợp đồng ràng buộc.' },
        { q: 'Dữ liệu của tôi có được bảo mật không?', a: 'Có. Chúng tôi chỉ lưu metadata của request, không lưu payload.' },
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <h1 style={{ fontSize: 32, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 12 }}>Gói cước & Thanh toán</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Nâng cấp gói cước để mở khóa các tính năng phòng thủ nâng cao và tăng giới hạn truy cập.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 60 }}>
                {plans.map((p, i) => (
                    <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', border: (p.isCurrent || p.isRecommended) ? '1px solid var(--border-cyan)' : '1px solid var(--border-default)', background: (p.isCurrent || p.isRecommended) ? '#0d1520' : 'var(--bg-card)' }}>
                        {p.isCurrent && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-cyan)', color: '#000', padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>Current Plan</div>}
                        {p.isRecommended && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-green)', color: '#000', padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>Recommended</div>}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{p.name}</div>
                            {p.isCurrent && <span className="badge badge-plan free">Active</span>}
                        </div>

                        <div style={{ marginBottom: 8 }}>
                            <span style={{ fontSize: p.price === 'Liên hệ' ? 32 : 48, fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{p.price}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{p.period}</span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, height: 40 }}>{p.desc}</div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, marginBottom: 32 }}>
                            {p.features.map((f, j) => (
                                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: f.included ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                    <span style={{ color: f.included ? 'var(--color-green)' : 'var(--text-muted)', width: 16, textAlign: 'center', fontWeight: 'bold' }}>{f.included ? '✓' : '✗'}</span>
                                    <span>{f.text}</span>
                                </div>
                            ))}
                        </div>

                        <button className={`btn ${p.btnClass}`} disabled={p.isCurrent} style={{ width: '100%', border: (p.isCurrent || p.isRecommended) ? '1px solid var(--border-cyan)' : undefined, color: (p.isCurrent || p.isRecommended) ? 'var(--color-cyan)' : undefined }}>
                            {p.btnText}
                        </button>
                    </div>
                ))}
            </div>

            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <h2 style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 24, textAlign: 'center' }}>Câu hỏi thường gặp</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {faqs.map((faq, i) => (
                        <div key={i} className="card" style={{ padding: '0 20px', cursor: 'pointer' }} onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}>
                            <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                {faq.q}
                                <span style={{ color: 'var(--text-muted)' }}>{faqOpen === i ? '−' : '+'}</span>
                            </div>
                            {faqOpen === i && (
                                <div style={{ paddingBottom: 20, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
