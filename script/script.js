document.addEventListener('DOMContentLoaded', () => {

    // --- 0. CUSTOM TOAST NOTIFICATION ---
    function injectToastStyles() {
        if (document.getElementById('lg-toast-styles')) return;
        const style = document.createElement('style');
        style.id = 'lg-toast-styles';
        style.textContent = `
            #lg-toast-container {
                position: fixed;
                bottom: 28px;
                left: 28px;
                z-index: 99999;
                display: flex;
                flex-direction: column-reverse;
                gap: 10px;
                pointer-events: none;
            }
            @media (max-width: 600px) {
                #lg-toast-container {
                    left: 50%;
                    transform: translateX(-50%);
                    bottom: 24px;
                    width: calc(100vw - 32px);
                    max-width: 380px;
                    align-items: center;
                }
                .lg-toast {
                    width: 100%;
                    min-width: unset !important;
                    max-width: 100% !important;
                    box-sizing: border-box;
                }
            }
            .lg-toast {
                pointer-events: all;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                min-width: 300px;
                max-width: 380px;
                padding: 14px 18px;
                background: #0e0e10;
                border: 1px solid #27272a;
                border-left: 3px solid var(--brand-gold, #D4AF37);
                box-shadow: 0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.08);
                font-family: 'Lato', sans-serif;
                font-size: 0.88rem;
                color: #f4f4f5;
                line-height: 1.5;
                opacity: 0;
                transform: translateY(12px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                cursor: default;
            }
            .lg-toast.lg-toast--in { opacity: 1; transform: translateY(0); }
            .lg-toast.lg-toast--out {
                opacity: 0;
                transform: translateY(8px);
                transition: opacity 0.25s ease, transform 0.25s ease;
            }
            .lg-toast-icon { flex-shrink: 0; width: 18px; height: 18px; margin-top: 1px; }
            .lg-toast-icon--success { color: var(--brand-gold, #D4AF37); }
            .lg-toast-icon--error   { color: #ef4444; }
            .lg-toast-icon--info    { color: #a1a1aa; }
            .lg-toast-body { flex: 1; }
            .lg-toast-title {
                font-weight: 700;
                font-size: 0.82rem;
                text-transform: uppercase;
                letter-spacing: 1.2px;
                margin-bottom: 3px;
            }
            .lg-toast-title--success { color: var(--brand-gold, #D4AF37); }
            .lg-toast-title--error   { color: #ef4444; }
            .lg-toast-title--info    { color: #a1a1aa; }
            .lg-toast-message { color: #d4d4d8; font-size: 0.85rem; }
            .lg-toast-close {
                flex-shrink: 0;
                background: none;
                border: none;
                color: #52525b;
                cursor: pointer;
                font-size: 1rem;
                line-height: 1;
                padding: 0;
                margin-left: 4px;
                transition: color 0.15s;
            }
            .lg-toast-close:hover { color: #a1a1aa; }
            .lg-toast-progress {
                position: absolute;
                bottom: 0; left: 0;
                height: 2px;
                background: var(--brand-gold, #D4AF37);
                opacity: 0.4;
                transition: width linear;
            }
            .lg-toast { position: relative; overflow: hidden; }
        `;
        document.head.appendChild(style);

        const container = document.createElement('div');
        container.id = 'lg-toast-container';
        document.body.appendChild(container);
    }

    window.showToast = function(message, type = 'success', duration = 4500) {
        injectToastStyles();
        const container = document.getElementById('lg-toast-container');

        const icons = {
            success: `<svg class="lg-toast-icon lg-toast-icon--success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
            error:   `<svg class="lg-toast-icon lg-toast-icon--error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
            info:    `<svg class="lg-toast-icon lg-toast-icon--info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
        };
        const titles = { success: 'Success', error: 'Error', info: 'Notice' };

        const toast = document.createElement('div');
        toast.className = 'lg-toast';
        toast.innerHTML = `
            ${icons[type] || icons.info}
            <div class="lg-toast-body">
                <div class="lg-toast-title lg-toast-title--${type}">${titles[type] || 'Notice'}</div>
                <div class="lg-toast-message">${message}</div>
            </div>
            <button class="lg-toast-close" aria-label="Dismiss">&times;</button>
            <div class="lg-toast-progress" style="width:100%;"></div>
        `;

        container.appendChild(toast);
        requestAnimationFrame(() => { requestAnimationFrame(() => { toast.classList.add('lg-toast--in'); }); });

        const progress = toast.querySelector('.lg-toast-progress');
        progress.style.transition = `width ${duration}ms linear`;
        requestAnimationFrame(() => { requestAnimationFrame(() => { progress.style.width = '0%'; }); });

        function dismiss() {
            toast.classList.remove('lg-toast--in');
            toast.classList.add('lg-toast--out');
            setTimeout(() => toast.remove(), 280);
        }
        toast.querySelector('.lg-toast-close').addEventListener('click', dismiss);
        const timer = setTimeout(dismiss, duration);
        toast.addEventListener('mouseenter', () => clearTimeout(timer));
        toast.addEventListener('mouseleave', () => setTimeout(dismiss, 1200));
    };


    // --- 1. MOBILE MENU TOGGLE ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav ul');

    let mobileBookBtn = document.querySelector('.mobile-book-btn');
    if (!mobileBookBtn) {
        mobileBookBtn = document.createElement('button');
        mobileBookBtn.className = 'mobile-book-btn';
        mobileBookBtn.textContent = 'Book Now';
        mobileBookBtn.addEventListener('click', () => {
            navMenu && navMenu.classList.remove('showing');
            menuToggle && (menuToggle.innerHTML = '&#9776;');
            menuToggle && (menuToggle.style.transform = 'rotate(0deg)');
            document.body.style.overflow = '';
            mobileBookBtn.classList.remove('visible');
            openBooking();
        });
        document.body.appendChild(mobileBookBtn);
    }

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navMenu.classList.contains('showing');
            if (!isOpen) {
                navMenu.classList.add('showing');
                menuToggle.innerHTML = '&#10005;';
                menuToggle.style.transform = 'rotate(90deg)';
                document.body.style.overflow = 'hidden';
                mobileBookBtn.classList.add('visible');
            } else {
                navMenu.classList.remove('showing');
                menuToggle.innerHTML = '&#9776;';
                menuToggle.style.transform = 'rotate(0deg)';
                document.body.style.overflow = '';
                mobileBookBtn.classList.remove('visible');
            }
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('showing');
                menuToggle.innerHTML = '&#9776;';
                menuToggle.style.transform = 'rotate(0deg)';
                document.body.style.overflow = '';
                mobileBookBtn.classList.remove('visible');
            });
        });
    }

    // --- 2. SCROLL FADE-IN ANIMATION ---
    const faders = document.querySelectorAll('.fade-in');
    const appearOnScroll = new IntersectionObserver(function(entries, obs) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    faders.forEach(f => appearOnScroll.observe(f));

    // --- 3. DYNAMIC BOOKING POP-UP MODAL ---

    // ============================================================
    // SERVICE DATA
    // ============================================================
    const extractPrice = (priceStr) => {
        const match = priceStr.match(/₱\s*([\d,]+)/);
        return match ? parseInt(match[1].replace(/,/g, '')) : 0;
    };

    const servicesByCategory = {
        'Facial Treatments': [
            { name: 'Glowing Facial',      price: '₱ 1,000', desc: 'An effective chemical agent used to exfoliate and renew the skin on a superficial to deep level.' },
            { name: 'Acne Peel Facial',    price: '₱ 1,200', desc: 'Medical-grade facial with comedone extraction & Acne Treatment peel formulated to control excessive oil production.' },
            { name: 'Melasma Facial',      price: '₱ 3,000', desc: 'Uses micro-needling Pen to target uneven skin tone & visibly improve pigmentation using Melasma Bright Serum.' },
            { name: 'Ageless Facial',      price: '₱ 1,500', desc: 'Aims to tighten skin, restore elasticity and reduce wrinkles with a powerful anti-aging formula.' },
            { name: 'Contour Facial',      price: '₱ 1,700', desc: 'HIFU facial — a non-surgical procedure using ultrasound waves to tighten and firm the skin.' },
            { name: 'Exilis Facial',       price: '₱ 1,500', desc: 'Proven to reduce fat cells and stimulate collagen production for a firmer, smoother complexion.' },
            { name: 'Diamond Peel Facial', price: '₱ 450',   desc: 'Non-invasive skin treatment using a diamond-tipped wand to gently exfoliate and resurface the skin.' },
            { name: 'Galvanic Facial',     price: '₱ 650',   desc: 'Plumps and smooths the skin, minimizing fine lines, wrinkles, and rough dry patches.' },
            { name: 'Hydra Facial',        price: '₱ 800',   desc: 'Ultimate treatment to hydrate, nourish, detoxify and rejuvenate while deep cleansing the skin.' },
        ],
        'Wellness & Massage': [
            { name: 'Swedish',                      price: '₱ 400', desc: 'Classic full-body relaxation massage using long, gliding strokes to ease tension and improve circulation.' },
            { name: 'Deep Tissue',                  price: '₱ 700', desc: 'Targets deeper muscle layers to relieve chronic tension, knots, and musculoskeletal issues.' },
            { name: 'Back Massage',                 price: '₱ 250', desc: 'Focused relief for the back, targeting built-up tension along the spine and shoulder blades.' },
            { name: 'Combi Massage',                price: '₱ 500', desc: 'A blend of Swedish and deep tissue techniques customized to your needs for full-body relief.' },
            { name: 'Foot Massage',                 price: '₱ 300', desc: 'Reflexology-inspired foot massage that relieves fatigue and promotes overall body relaxation.' },
            { name: 'Bodyscrub',                    price: '₱ 600', desc: 'Full body exfoliation that removes dead skin cells, leaving you refreshed and glowing.' },
            { name: 'Swedish + Ventosa (1hr)',      price: '₱ 600', desc: 'Swedish massage enhanced with cupping therapy to release deeper muscle tension.' },
            { name: 'Swedish + Hotstone (1hr)',     price: '₱ 550', desc: 'Swedish massage with warm basalt stones that melt away tension and soothe tired muscles.' },
            { name: 'Deep Tissue + Ventosa (1hr)', price: '₱ 800', desc: 'Intense deep tissue work combined with ventosa cupping for maximum muscle relief.' },
            { name: 'Deep Tissue + Hotstone (1hr)',price: '₱ 850', desc: 'Deep tissue massage elevated with heated stones for penetrating, lasting relief.' },
            { name: 'Signature Massage (1.5hr)',   price: '₱ 600', desc: "Let's G signature full-body experience combining our best techniques for total relaxation." },
            { name: 'Full Body + Hotstone (2hrs)', price: '₱ 900', desc: 'Our most comprehensive session — full-body massage with hot stone therapy for ultimate indulgence.' },
            { name: 'Add-on: Ventosa',             price: '₱ 200', desc: 'Traditional cupping add-on — helps release deep knots and improve blood flow.' },
            { name: 'Add-on: Hotstone',            price: '₱ 150', desc: 'Warm stone add-on that enhances any massage by soothing muscle tension and promoting circulation.' },
            { name: 'Add-on: Ear Candling',        price: '₱ 150', desc: 'Gentle ear candling to clear blockages and promote a sense of calm and clarity.' },
            { name: 'Regular Footspa',             price: '₱ 350', desc: 'Relaxing foot soak and care that softens skin and relieves aching feet.' },
            { name: 'Premium Footspa',             price: '₱ 450', desc: 'Elevated footspa with premium products, extended care, and deep nail grooming.' },
        ],
        'Brows & Lashes': [
            { name: 'Classic Lashes',   price: '₱ 500',            desc: 'One extension per natural lash for a clean, defined, and naturally enhanced look.' },
            { name: 'Natural Lashes',   price: '₱ 600',            desc: 'Soft, feathery lashes for an effortlessly natural everyday look.' },
            { name: 'Hybrid Lashes',    price: '₱ 700',            desc: 'Mix of classic and volume fans for a textured, wispy, multidimensional lash effect.' },
            { name: 'Volume Lashes',    price: '₱ 1,000',          desc: 'Handcrafted fans of ultra-fine lashes for a dramatic, full, and glamorous look.' },
            { name: 'Mega Volume',      price: '₱ 1,200',          desc: 'The boldest lash set — maximum fullness and drama using the finest lightweight extensions.' },
            { name: 'Lash Removal',     price: '₱ 100 – ₱ 300',   desc: 'Safe, professional removal of lash extensions without damaging your natural lashes.' },
            { name: 'Lash Lift',        price: '₱ 400',            desc: 'Semi-permanent curl treatment that lifts your natural lashes for a wide-eyed look.' },
            { name: 'Lash Tint',        price: '₱ 500',            desc: 'Darkens your natural lashes for definition and depth without mascara.' },
            { name: '7D Microblading',  price: '₱ 3,000 / ₱ 1,500', desc: 'Hair-stroke technique for incredibly natural, feather-like brows. Price: 1st / 2nd session.' },
            { name: 'Combrows',         price: '₱ 4,000 / ₱ 2,000', desc: 'Combination of microblading and shading for defined, long-lasting brows. Price: 1st / 2nd session.' },
            { name: 'Ombre Brows',      price: '₱ 3,500 / ₱ 1,750', desc: 'Powder-effect brows that graduate from light to dark for a soft, makeup finish. Price: 1st / 2nd session.' },
            { name: 'Hybrid Brows',     price: '₱ 3,500 / ₱ 1,750', desc: 'Microblading strokes at the front blended into shading at the tail for the most natural semi-perm brow.' },
            { name: 'Lip Tint',         price: '₱ 3,500 / ₱ 1,750', desc: 'Semi-permanent lip color that enhances shape and adds long-lasting pigment. Price: 1st / 2nd session.' },
        ],
        'Hair Services': [
            { name: 'Cut & Blowdry',          price: '₱ 150',        desc: 'Precision haircut finished with a professional blowdry for a polished, styled look.' },
            { name: 'Cut, Shampoo & Blowdry', price: '₱ 250',        desc: 'Complete cut service including a relaxing shampoo and smooth, styled blowdry finish.' },
            { name: 'Shampoo & Blowdry',      price: '₱ 200',        desc: 'Refresh and style with a thorough shampoo, conditioning treatment, and blowdry.' },
            { name: 'Hair Iron & Blowdry',    price: '₱ 300',        desc: 'Sleek, straight styling using professional flat iron and blowdry techniques.' },
            { name: 'Hair Color',             price: 'From ₱ 500',   desc: 'Full hair color service using premium dye. Price depends on hair length and color choice.' },
            { name: 'Hairspa',                price: 'From ₱ 500',   desc: 'Deep conditioning spa treatment that restores moisture, shine, and vitality to damaged hair.' },
            { name: 'Botox',                  price: 'From ₱ 1,500', desc: 'Hair botox that fills in damaged areas of the hair fiber for frizz-free, glossy results.' },
            { name: 'Keratin Straight',       price: 'From ₱ 2,000', desc: 'Keratin straightening for smooth, manageable, frizz-free hair lasting months.' },
            { name: 'Brazilian Blowout',      price: 'From ₱ 1,000', desc: 'Smoothing treatment that eliminates frizz and adds brilliant shine while reducing styling time.' },
            { name: 'Headspa — Regular',      price: '₱ 999',        desc: 'Calming scalp treatment with cleansing, massage, and nourishment to promote healthy hair growth.' },
            { name: 'Headspa — Premium',      price: '₱ 1,299',      desc: 'Elevated headspa with premium serums, extended scalp massage, and deep conditioning.' },
            { name: 'Headspa — Deluxe',       price: '₱ 1,899',      desc: 'Full headspa ritual with multi-step scalp therapy, specialized serums, and steam treatment.' },
            { name: 'Headspa — Signature',    price: '₱ 2,199',      desc: "Our most luxurious headspa — the complete Let's G scalp and hair renewal ritual." },
        ],
        'Skin Repair': [
            { name: 'Exosomes Facial',  price: '₱ 4,500', desc: 'A potent serum applied to skin that sends instructions to cells to regenerate and repair themselves at a cellular level.' },
            { name: 'Exo-laser Facial', price: '₱ 5,000', desc: 'For acne and atrophic scars — a combination of CO₂ Fractional Laser and Exosomes for cell regeneration and scar revision.' },
            { name: 'Derma Pen Facial', price: '₱ 3,000', desc: 'Most effective non-invasive procedure to reduce scarring, minimize large pores, correct pigmentation, and rejuvenate skin.' },
        ],
        'Laser Treatments': [
            { name: 'Pico: Elbow or Knees',      price: '₱ 900 / ₱ 4,500',   desc: 'Pico Whitening Laser for elbow or knee darkening. Per session / Promo 5+2.' },
            { name: 'Pico: Neck or Nape',        price: '₱ 1,000 / ₱ 5,000', desc: 'Pico Whitening Laser targeting neck and nape discoloration. Per session / Promo 5+2.' },
            { name: 'Pico: Butt Area',           price: '₱ 1,200 / ₱ 6,000', desc: 'Pico Whitening Laser for the butt area. Per session / Promo 5+2.' },
            { name: 'Pico: Brazilian/Inguinal',  price: '₱ 1,200 / ₱ 6,000', desc: 'Pico Whitening Laser for Brazilian and inguinal areas. Per session / Promo 5+2.' },
            { name: 'Pico: Underarm',            price: '₱ 1,000 / ₱ 5,000', desc: 'Pico Whitening Laser to lighten underarm discoloration. Per session / Promo 5+2.' },
            { name: 'Laser: Elbow or Knees',     price: '₱ 800 / ₱ 4,000',   desc: 'Targeted laser treatment for elbow or knee darkening. Per session / Promo 5+2.' },
            { name: 'Laser: Neck or Nape',       price: '₱ 800 / ₱ 4,000',   desc: 'Laser treatment for neck and nape. Per session / Promo 5+2.' },
            { name: 'Laser: Butt Area',          price: '₱ 1,000 / ₱ 5,000', desc: 'Laser treatment for butt area. Per session / Promo 5+2.' },
            { name: 'Laser: Brazilian/Inguinal', price: '₱ 1,000 / ₱ 5,000', desc: 'Laser treatment for Brazilian and inguinal areas. Per session / Promo 5+2.' },
            { name: 'Laser: Underarm',           price: '₱ 900 / ₱ 4,500',   desc: 'Laser treatment to improve underarm skin tone and texture. Per session / Promo 5+2.' },
        ],
        'Slimming & Contouring': [
            { name: 'HIFU: Face Neck',           price: '₱ 1,500', desc: 'Non-surgical ultrasound procedure to tighten and lift face and neck area.' },
            { name: 'HIFU: Arms or Love Handle', price: '₱ 1,500', desc: 'HIFU treatment for arms or love handle reduction and contouring.' },
            { name: 'HIFU: Lower Butt',          price: '₱ 2,000', desc: 'HIFU ultralift procedure to lift and firm the lower butt area.' },
            { name: 'Exilis: Face & Neck',       price: '₱ 1,200 / ₱ 6,000', desc: 'Radiofrequency slimming treatment for face and neck. Per session / Promo 5+1.' },
            { name: 'Exilis: Arms',              price: '₱ 1,500 / ₱ 7,000', desc: 'Exilis slimming for arm toning. Per session / Promo 5+1.' },
            { name: 'Exilis: Thighs',            price: '₱ 1,500 / ₱ 7,500', desc: 'Exilis treatment for thigh contouring. Per session / Promo 5+1.' },
            { name: 'Exilis: Love Handle',       price: '₱ 1,500 / ₱ 7,500', desc: 'Exilis slimming for love handle reduction. Per session / Promo 5+1.' },
            { name: 'Exilis: Tummy',             price: '₱ 1,800 / ₱ 9,000', desc: 'Exilis treatment for abdominal contouring. Per session / Promo 5+1.' },
            { name: 'Slimming Bed (30 mins)',    price: '₱ 800', desc: 'Far-infrared slimming bed session to boost metabolism and burn calories.' },
            { name: 'Meso Lipo Face & Chin',     price: '₱ 2,500', desc: 'Meso injection for facial contouring. Includes FREE 30mins Exilis.' },
            { name: 'Meso Lipo Any Part',        price: '₱ 4,500', desc: 'Meso lipo for any body part slimming. Includes FREE 40mins Exilis.' },
        ],
        'Nail Care Services': [
            { name: 'Mani & Pedicure',           price: '₱ 150 / ₱ 180', desc: 'Classic manicure and pedicure service.' },
            { name: 'Ingrown Removal',           price: '₱ 250', desc: 'Professional ingrown nail removal treatment.' },
            { name: 'Gel Manicure',              price: '₱ 400', desc: 'Long-lasting gel manicure with cure lamp.' },
            { name: 'Gel Pedicure',              price: '₱ 500', desc: 'Durable gel pedicure service.' },
            { name: 'Gel Polish Removal',        price: '₱ 100 - ₱ 250', desc: 'Safe removal of gel polish without damaging nails.' },
            { name: 'Nail Extension (Plain)',    price: '₱ 1,000', desc: 'Plain acrylic or gel nail extensions.' },
            { name: 'Nail Extension Removal',    price: '₱ 300 - ₱ 400', desc: 'Professional removal of nail extensions.' },
            { name: 'Stickers / Glitter / Rhinestones', price: '₱ 20 /pc', desc: 'Nail art embellishments per piece or nail.' },
            { name: 'Ribbon / 3D Flowers / Stones', price: '₱ 30 /pc', desc: 'Premium nail art add-ons.' },
            { name: 'Nail Art',                  price: '₱ 50 /nail', desc: 'Custom hand-painted nail art design.' },
            { name: 'Reinforced Gel Overlay',    price: '₱ 80 /nail', desc: 'Protective gel overlay for nail strength.' },
            { name: 'Cateye',                    price: '₱ 200', desc: 'Magnetic cateye gel nail art design.' },
        ],
        'Gluta Drips & Vitamins': [
            { name: 'G\'s Beauty Push',          price: '₱ 400 / ₱ 4,000', desc: 'Quick beauty injection push. Per session / 10x package.' },
            { name: 'G\'s Beauty Drip',          price: '₱ 700 / ₱ 7,000', desc: 'Beauty IV drip with vitamins and glutathione. Per session / 10x package.' },
            { name: 'G\'s Glowing Drip',         price: '₱ 1,000 / ₱ 6,000', desc: 'Premium glowing skin drip. Per session / 6x package.' },
            { name: 'G\'s Anti-Acne Drip',       price: '₱ 1,200', desc: 'IV drip formulated to target acne and breakouts.' },
            { name: 'G\'s Gorgeous Drip',        price: '₱ 1,200 / ₱ 7,200', desc: 'Comprehensive beauty drip. Per session / 6x package.' },
            { name: 'G\'s Fertility Drip',       price: '₱ 1,500', desc: 'Wellness drip supporting reproductive health.' },
            { name: 'G\'s Ultimate Drip',        price: '₱ 1,700 / ₱ 10,200', desc: 'Premium wellness IV drip. Per session / 6x package.' },
            { name: 'G\'s Slimming Drip',        price: '₱ 2,500', desc: 'Metabolism-boosting drip for weight management.' },
            { name: 'Vitamin C Add-on',          price: '₱ 300', desc: 'Vitamin C / B Complex / Placenta add-on injection.' },
            { name: 'Stemcell Add-on',           price: '₱ 400', desc: 'Stemcell / L-carnitine add-on for drip.' },
            { name: 'Collagen Add-on',           price: '₱ 500', desc: 'Premium collagen add-on injection.' },
        ],
        'Warts & Skintag': [
            { name: 'Cauterize: Face and Neck',  price: '₱ 1,500', desc: 'Cauterization method for warts, milia & skintag on face and neck.' },
            { name: 'Cauterize: Any Part of Body', price: '₱ 1,500', desc: 'Cauterization treatment for warts and skintags on any body part.' },
            { name: 'Laser: Any Part of Body',   price: '₱ 2,000', desc: 'Laser removal of warts, milia & skintags.' },
            { name: 'Laser: Face and Neck',      price: '₱ 3,000', desc: 'Precision laser removal for face and neck area.' },
        ],
    };

    // Sort services by price ascending
    Object.keys(servicesByCategory).forEach(category => {
        servicesByCategory[category].sort((a, b) => extractPrice(a.price) - extractPrice(b.price));
    });

    // ============================================================
    // PRICE MAP (for total calc)
    // ============================================================
    const ADDITIONAL_PRICE_MAP = {};
    Object.values(servicesByCategory).forEach(list => {
        list.forEach(s => {
            const p = extractPrice(s.price);
            if (p > 0) ADDITIONAL_PRICE_MAP[s.name] = p;
        });
    });

    // ============================================================
    // CUSTOM DROPDOWN + CALENDAR + BOOKING LAYOUT STYLES
    // ============================================================
    function injectBookingStyles() {
        if (document.getElementById('booking-custom-styles')) return;
        const style = document.createElement('style');
        style.id = 'booking-custom-styles';
        style.textContent = `
            /* ---- Hidden native selects ---- */
            #b-category-native, #b-service-native, #b-addl-category-native { display: none; }

            /* ---- Two-column booking layout ---- */
            .bk-layout {
                display: grid;
                grid-template-columns: 1fr 280px;
                gap: 24px;
                align-items: start;
            }
            .bk-form-col { min-width: 0; }
            .bk-total-col {
                position: sticky;
                top: 0;
            }

            /* ---- Total panel (dashboard-style) ---- */
            .bk-total-panel {
                background: #0e0e10;
                border: 1px solid #27272a;
                border-top: 3px solid var(--brand-gold, #D4AF37);
                padding: 20px;
            }
            .bk-total-label {
                font-size: 0.65rem;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: #a1a1aa;
                margin-bottom: 6px;
            }
            .bk-total-amount {
                font-family: 'Playfair Display', serif;
                font-size: 2rem;
                font-weight: 600;
                font-style: italic;
                color: var(--brand-gold, #D4AF37);
                margin-bottom: 16px;
                line-height: 1.1;
            }
            .bk-total-amount.no-service {
                font-size: 1.1rem;
                font-style: normal;
                color: #52525b;
            }
            .bk-total-divider {
                height: 1px;
                background: #27272a;
                margin-bottom: 14px;
            }
            .bk-total-line {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 8px;
                padding: 7px 0;
                border-bottom: 1px solid #1a1a1d;
                font-size: 0.78rem;
                color: #a1a1aa;
                line-height: 1.4;
            }
            .bk-total-line:last-child { border-bottom: none; }
            .bk-total-line-name { flex: 1; }
            .bk-total-line-price {
                color: var(--brand-gold, #D4AF37);
                font-weight: 600;
                white-space: nowrap;
                flex-shrink: 0;
            }
            .bk-total-empty {
                font-size: 0.78rem;
                color: #52525b;
                line-height: 1.6;
            }

            /* ---- Custom dropdown wrapper ---- */
            .lg-select-wrapper {
                position: relative;
                margin-bottom: 16px;
                user-select: none;
            }
            .lg-select-trigger {
                width: 100%;
                padding: 14px 40px 14px 16px;
                border: 1px solid var(--border-color, #27272a);
                background-color: var(--bg-alt, #18181b);
                color: var(--text-main, #f4f4f5);
                font-family: inherit;
                font-size: 0.95rem;
                border-radius: 2px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
                transition: border-color 0.2s;
                box-sizing: border-box;
            }
            .lg-select-trigger.placeholder { color: var(--text-muted, #a1a1aa); }
            .lg-select-trigger.open,
            .lg-select-trigger:hover { border-color: var(--brand-gold, #c9a84c); }
            .lg-select-trigger.disabled {
                opacity: 0.4;
                cursor: not-allowed;
                pointer-events: none;
            }
            .lg-select-trigger svg { flex-shrink: 0; transition: transform 0.2s; }
            .lg-select-trigger.open svg { transform: rotate(180deg); }

            /* ---- Dropdown panel ---- */
            .lg-select-panel {
                display: none;
                position: absolute;
                top: calc(100% + 2px);
                left: 0; right: 0;
                background: #18181b;
                border: 1px solid var(--brand-gold, #c9a84c);
                border-radius: 2px;
                z-index: 9999;
                max-height: 320px;
                overflow-y: auto;
                scrollbar-gutter: stable;
                box-shadow: 0 8px 32px rgba(0,0,0,0.6);
                scrollbar-width: thin;
                scrollbar-color: var(--brand-gold, #c9a84c) #27272a;
            }
            .lg-select-panel::-webkit-scrollbar { width: 4px; }
            .lg-select-panel::-webkit-scrollbar-track { background: #27272a; }
            .lg-select-panel::-webkit-scrollbar-thumb { background: var(--brand-gold, #c9a84c); border-radius: 2px; }
            .lg-select-panel.open { display: block; }

            /* ---- Category option ---- */
            .lg-option {
                padding: 13px 16px;
                cursor: pointer;
                font-size: 0.9rem;
                color: var(--text-main, #f4f4f5);
                border-bottom: 1px solid #27272a;
                transition: background 0.15s, color 0.15s;
            }
            .lg-option:last-child { border-bottom: none; }
            .lg-option:hover { background: #27272a; }
            .lg-option.selected { background: rgba(201,168,76,0.12); color: var(--brand-gold, #c9a84c); }

            /* ---- Service option ---- */
            .lg-service-option {
                padding: 13px 16px;
                cursor: pointer;
                border-bottom: 1px solid #27272a;
                transition: background 0.15s;
            }
            .lg-service-option:last-child { border-bottom: none; }
            .lg-service-option:hover { background: #27272a; }
            .lg-service-option.selected {
                background: rgba(201,168,76,0.12);
                border-left: 3px solid var(--brand-gold, #c9a84c);
            }
            .lg-service-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
                margin-bottom: 4px;
            }
            .lg-service-name { font-size: 0.9rem; color: var(--text-main, #f4f4f5); font-weight: 500; }
            .lg-service-option.selected .lg-service-name { color: var(--brand-gold, #c9a84c); }
            .lg-service-price { font-size: 0.82rem; color: var(--brand-gold, #c9a84c); white-space: nowrap; font-weight: 600; }
            .lg-service-desc { font-size: 0.78rem; color: var(--text-muted, #a1a1aa); line-height: 1.45; margin: 0; }

            /* ---- Confirmed service panel ---- */
            #b-service-info {
                display: none;
                padding: 13px 16px;
                border: 1px solid var(--border-color, #27272a);
                border-left: 3px solid var(--brand-gold, #c9a84c);
                background: var(--bg-alt, #18181b);
                border-radius: 2px;
                margin-top: -14px;
                margin-bottom: 16px;
                animation: lgFadeIn 0.2s ease;
            }
            #b-service-info.visible { display: block; }
            .svc-price { font-size: 1rem; font-weight: 700; color: var(--brand-gold, #c9a84c); margin-bottom: 5px; }
            .svc-desc { font-size: 0.82rem; color: var(--text-muted, #a1a1aa); line-height: 1.5; margin: 0; }

            /* ---- Wellness Add-ons (multi-select checkboxes) ---- */
            #addon-section { margin-bottom: 16px; }
            .addon-section-label {
                font-size: 0.65rem;
                color: var(--text-muted, #a1a1aa);
                text-transform: uppercase;
                letter-spacing: 1.2px;
                margin-bottom: 8px;
            }
            .addon-checkbox-list { display: flex; flex-direction: column; gap: 6px; }
            .addon-cb-row {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 9px 12px;
                background: var(--bg-alt, #18181b);
                border: 1px solid var(--border-color, #27272a);
                border-radius: 2px;
                cursor: pointer;
                transition: border-color 0.15s, background 0.15s;
            }
            .addon-cb-row input[type="checkbox"] {
                accent-color: var(--brand-gold, #c9a84c);
                width: 14px; height: 14px;
                flex-shrink: 0; cursor: pointer;
            }
            .addon-cb-row:has(input:checked) {
                border-color: var(--brand-gold, #c9a84c);
                background: rgba(201,168,76,0.07);
            }
            .addon-cb-name { flex: 1; font-size: 0.84rem; color: var(--text-main, #f4f4f5); }
            .addon-cb-price { font-size: 0.82rem; font-weight: 600; color: var(--brand-gold, #c9a84c); white-space: nowrap; }

            /* ---- Additional services — ask prompt ---- */
            #addl-ask-section { margin-bottom: 16px; }
            .addl-ask-label {
                font-size: 0.72rem;
                color: var(--text-muted, #a1a1aa);
                text-transform: uppercase;
                letter-spacing: 1.2px;
                margin-bottom: 10px;
            }
            .addl-ask-btns { display: flex; gap: 8px; }
            .addl-yn-btn {
                flex: 1;
                padding: 10px 12px;
                background: var(--bg-alt, #18181b);
                border: 1px solid var(--border-color, #27272a);
                color: var(--text-muted, #a1a1aa);
                font-family: inherit;
                font-size: 0.82rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 700;
                cursor: pointer;
                border-radius: 2px;
                transition: all 0.15s;
            }
            .addl-yn-btn:hover { border-color: var(--brand-gold, #c9a84c); color: var(--text-main, #f4f4f5); }
            .addl-yn-btn.active {
                background: var(--brand-gold, #c9a84c);
                border-color: var(--brand-gold, #c9a84c);
                color: #0e0e10;
            }

            /* ---- Additional services — search bar ---- */
            #addl-search {
                display: none;
                width: 100%;
                box-sizing: border-box;
                padding: 10px 14px 10px 36px;
                background: var(--bg-alt, #18181b);
                border: 1px solid var(--border-color, #27272a);
                border-radius: 2px;
                color: var(--text-main, #f4f4f5);
                font-family: inherit;
                font-size: 0.85rem;
                margin-bottom: 8px;
                transition: border-color 0.2s;
            }
            #addl-search:focus { outline: none; border-color: var(--brand-gold, #c9a84c); }
            #addl-search::placeholder { color: #52525b; }
            .addl-search-wrap {
                position: relative;
                margin-bottom: 0;
            }
            .addl-search-wrap svg {
                position: absolute;
                left: 11px;
                top: 50%;
                transform: translateY(-50%);
                pointer-events: none;
                opacity: 0.45;
            }

            /* ---- Additional services — picker ---- */
            #addl-picker-section { margin-bottom: 16px; }
            .addl-services-list { display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto; padding-right: 4px; scrollbar-width: thin; scrollbar-color: var(--brand-gold, #c9a84c) #27272a; }
            .addl-cb-row {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 9px 12px;
                background: var(--bg-alt, #18181b);
                border: 1px solid var(--border-color, #27272a);
                border-radius: 2px;
                cursor: pointer;
                transition: border-color 0.15s, background 0.15s;
            }
            .addl-cb-row input[type="checkbox"] {
                accent-color: var(--brand-gold, #c9a84c);
                width: 14px; height: 14px;
                flex-shrink: 0; cursor: pointer;
            }
            .addl-cb-row:has(input:checked) {
                border-color: var(--brand-gold, #c9a84c);
                background: rgba(201,168,76,0.07);
            }
            .addl-cb-name { flex: 1; font-size: 0.84rem; color: var(--text-main, #f4f4f5); }
            .addl-cb-cat { font-size: 0.72rem; color: var(--text-muted, #a1a1aa); margin-right: 6px; }
            .addl-cb-price { font-size: 0.82rem; font-weight: 600; color: var(--brand-gold, #c9a84c); white-space: nowrap; }

            /* ---- Custom date/time picker ---- */
            .lg-datetime-wrapper { margin-bottom: 16px; }
            .lg-datetime-trigger {
                width: 100%;
                padding: 14px 16px;
                border: 1px solid var(--border-color, #27272a);
                background: var(--bg-alt, #18181b);
                color: var(--text-main, #f4f4f5);
                font-family: inherit;
                font-size: 0.95rem;
                border-radius: 2px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: border-color 0.2s;
                box-sizing: border-box;
            }
            .lg-datetime-trigger:hover,
            .lg-datetime-trigger.open { border-color: var(--brand-gold, #c9a84c); }
            .lg-datetime-trigger .dt-placeholder { color: var(--text-muted, #a1a1aa); flex: 1; }
            .lg-datetime-trigger .dt-value { flex: 1; }
            .lg-datetime-trigger svg { flex-shrink: 0; opacity: 0.6; }

            /* ---- Calendar panel ---- */
            .lg-cal-panel {
                display: none;
                background: #18181b;
                border: 1px solid var(--brand-gold, #c9a84c);
                border-radius: 2px;
                padding: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.6);
                margin-top: 2px;
                animation: lgFadeIn 0.15s ease;
            }
            .lg-cal-panel.open { display: block; }
            .lg-cal-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
            .lg-cal-nav button {
                background: none; border: none;
                color: var(--text-muted, #a1a1aa);
                cursor: pointer; padding: 4px 8px; font-size: 1.1rem;
                border-radius: 2px; transition: color 0.15s, background 0.15s;
            }
            .lg-cal-nav button:hover { color: var(--brand-gold, #c9a84c); background: #27272a; }
            .lg-cal-month { font-size: 0.9rem; font-weight: 600; color: var(--text-main, #f4f4f5); letter-spacing: 0.05em; }
            .lg-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 12px; }
            .lg-cal-dow { text-align: center; font-size: 0.7rem; color: var(--text-muted, #a1a1aa); padding: 4px 0; text-transform: uppercase; letter-spacing: 0.05em; }
            .lg-cal-day { text-align: center; padding: 7px 2px; font-size: 0.82rem; border-radius: 2px; cursor: pointer; color: var(--text-main, #f4f4f5); transition: background 0.15s, color 0.15s; }
            .lg-cal-day:hover:not(.empty):not(.past) { background: #27272a; color: var(--brand-gold, #c9a84c); }
            .lg-cal-day.empty { cursor: default; }
            .lg-cal-day.past { color: #3f3f46; cursor: not-allowed; }
            .lg-cal-day.today { color: var(--brand-gold, #c9a84c); font-weight: 700; }
            .lg-cal-day.selected { background: var(--brand-gold, #c9a84c); color: #0e0e10; font-weight: 700; }

            /* ---- Time row ---- */
            .lg-time-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; border-top: 1px solid #27272a; padding-top: 12px; }
            .lg-time-row label { font-size: 0.78rem; color: var(--text-muted, #a1a1aa); white-space: nowrap; }
            .lg-time-selects { display: flex; gap: 6px; align-items: center; flex: 1; }
            .lg-time-sel {
                background: #27272a; border: 1px solid #3f3f46;
                color: var(--text-main, #f4f4f5);
                font-family: inherit; font-size: 0.85rem;
                padding: 6px 8px; border-radius: 2px;
                cursor: text; width: 48px;
                appearance: none; -webkit-appearance: none;
                -moz-appearance: textfield; text-align: center;
            }
            .lg-time-sel::-webkit-inner-spin-button,
            .lg-time-sel::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
            .lg-time-sel:focus { outline: none; border-color: var(--brand-gold, #c9a84c); box-shadow: 0 0 0 2px rgba(201,168,76,0.12); }
            .lg-time-colon { color: var(--brand-gold, #c9a84c); font-weight: bold; }
            .lg-ampm-group { display: flex; gap: 4px; }
            .lg-ampm-btn {
                background: #27272a; border: 1px solid #3f3f46;
                color: var(--text-muted, #a1a1aa);
                font-family: inherit; font-size: 0.78rem;
                padding: 6px 10px; border-radius: 2px;
                cursor: pointer; transition: all 0.15s;
            }
            .lg-ampm-btn.active { background: var(--brand-gold, #c9a84c); border-color: var(--brand-gold, #c9a84c); color: #0e0e10; font-weight: 600; }

            /* ---- Shared ---- */
            @keyframes lgFadeIn {
                from { opacity: 0; transform: translateY(-6px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            #bookingFormPop .form-group { margin-bottom: 16px; }
            #bookingFormPop input[type="text"],
            #bookingFormPop input[type="tel"],
            #bookingFormPop textarea {
                width: 100%;
                box-sizing: border-box;
            }

            /* ---- Booking modal overrides ---- */
            #modal-booking .modal-content {
                max-width: 860px !important;
                padding: 40px 36px !important;
            }

            /* ---- Responsive: stack on smaller screens ---- */
            @media (max-width: 680px) {
                .bk-layout {
                    grid-template-columns: 1fr !important;
                }
                .bk-total-col {
                    position: static !important;
                    order: -1;
                }
                .bk-total-panel {
                    margin-bottom: 8px;
                }
                .bk-total-amount { font-size: 1.5rem !important; }
                #modal-booking .modal-content {
                    padding: 28px 18px !important;
                    width: 95% !important;
                    max-height: 90vh !important;
                }
                .lg-time-row { flex-direction: column; align-items: flex-start; gap: 12px; }
                .lg-time-selects { width: 100%; }
                .lg-ampm-group { width: 100%; display: flex; }
                .lg-ampm-btn { flex: 1; text-align: center; }
                .lg-service-header { flex-direction: column; align-items: flex-start; gap: 4px; }
                .lg-service-price { font-size: 0.9rem; }
                .addl-ask-btns { gap: 6px; }
            }

            @media (max-width: 480px) {
                .bk-total-amount { font-size: 1.3rem !important; }
                #modal-booking .modal-content { padding: 22px 14px !important; }
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================================
    // BUILD CUSTOM DROPDOWN
    // ============================================================
    function buildDropdown(wrapperId, nativeId, triggerLabel, items, isService, onSelect) {
        const wrapper = document.getElementById(wrapperId);
        if (!wrapper) return;

        const trigger = wrapper.querySelector('.lg-select-trigger');
        const panel   = wrapper.querySelector('.lg-select-panel');
        const native  = document.getElementById(nativeId);

        trigger._onSelect = onSelect;

        if (trigger.dataset.listenersAttached) {
            _renderItemsFor(panel, native, trigger, items, isService);
            return;
        }
        trigger.dataset.listenersAttached = 'true';

        function closeAll() {
            document.querySelectorAll('.lg-select-trigger.open').forEach(t => {
                t.classList.remove('open');
                t.nextElementSibling && t.nextElementSibling.classList.remove('open');
            });
        }

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasOpen = trigger.classList.contains('open');
            closeAll();
            if (!wasOpen) {
                trigger.classList.add('open');
                panel.classList.add('open');
            }
        });

        document.addEventListener('click', () => {
            trigger.classList.remove('open');
            panel.classList.remove('open');
        });

        _renderItemsFor(panel, native, trigger, items, isService);
        return { renderItems: (list) => _renderItemsFor(panel, native, trigger, list, isService) };
    }

    function _renderItemsFor(panel, native, trigger, list, isService) {
        panel.innerHTML = '';
        list.forEach((item) => {
            if (isService) {
                const div = document.createElement('div');
                div.className = 'lg-service-option';
                div.innerHTML = `
                    <div class="lg-service-header">
                        <span class="lg-service-name">${item.name}</span>
                        <span class="lg-service-price">${item.price}</span>
                    </div>
                    <p class="lg-service-desc">${item.desc}</p>`;
                div.addEventListener('click', (e) => {
                    e.stopPropagation();
                    panel.querySelectorAll('.lg-service-option').forEach(o => o.classList.remove('selected'));
                    div.classList.add('selected');
                    trigger.innerHTML = `<span>${item.name}</span>${chevronSVG()}`;
                    trigger.classList.remove('placeholder', 'open');
                    panel.classList.remove('open');
                    if (native) {
                        if (!native.querySelector(`option[value="${item.name}"]`)) {
                            const opt = document.createElement('option');
                            opt.value = item.name; opt.textContent = item.name;
                            native.appendChild(opt);
                        }
                        native.value = item.name;
                    }
                    trigger._onSelect && trigger._onSelect(item);
                });
                panel.appendChild(div);
            } else {
                const div = document.createElement('div');
                div.className = 'lg-option';
                div.textContent = typeof item === 'string' ? item : item.name;
                div.addEventListener('click', (e) => {
                    e.stopPropagation();
                    panel.querySelectorAll('.lg-option').forEach(o => o.classList.remove('selected'));
                    div.classList.add('selected');
                    trigger.innerHTML = `<span>${div.textContent}</span>${chevronSVG()}`;
                    trigger.classList.remove('placeholder', 'open');
                    panel.classList.remove('open');
                    if (native) {
                        if (!native.querySelector(`option[value="${div.textContent}"]`)) {
                            const opt = document.createElement('option');
                            opt.value = div.textContent; opt.textContent = div.textContent;
                            native.appendChild(opt);
                        }
                        native.value = div.textContent;
                    }
                    trigger._onSelect && trigger._onSelect(item);
                });
                panel.appendChild(div);
            }
        });
    }

    function chevronSVG() {
        return `<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1l5 5 5-5" stroke="#a1a1aa" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    }

    // ============================================================
    // BUILD CUSTOM CALENDAR
    // ============================================================
    function buildCalendar(wrapperId, nativeId) {
        const wrapper  = document.getElementById(wrapperId);
        if (!wrapper) return;
        const trigger  = wrapper.querySelector('.lg-datetime-trigger');
        const panel    = wrapper.querySelector('.lg-cal-panel');
        const gridEl   = wrapper.querySelector('.lg-cal-grid');
        const monthEl  = wrapper.querySelector('.lg-cal-month');
        const prevBtn  = wrapper.querySelector('.lg-cal-prev');
        const nextBtn  = wrapper.querySelector('.lg-cal-next');
        const hrSel    = wrapper.querySelector('.lg-hr');
        const minSel   = wrapper.querySelector('.lg-min');
        const native   = document.getElementById(nativeId);

        let current = new Date();
        let selDate  = null;
        let ampm     = 'AM';

        const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

        function renderCalendar() {
            const today = new Date();
            const y = current.getFullYear(), m = current.getMonth();
            monthEl.textContent = `${MONTHS[m]} ${y}`;
            const first = new Date(y, m, 1).getDay();
            const days  = new Date(y, m + 1, 0).getDate();

            gridEl.innerHTML = DAYS.map(d => `<div class="lg-cal-dow">${d}</div>`).join('');

            for (let i = 0; i < first; i++) {
                gridEl.insertAdjacentHTML('beforeend', '<div class="lg-cal-day empty"></div>');
            }
            for (let d = 1; d <= days; d++) {
                const date = new Date(y, m, d);
                const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isToday = date.toDateString() === today.toDateString();
                const isSel   = selDate && date.toDateString() === selDate.toDateString();
                const cls = ['lg-cal-day', isPast ? 'past' : '', isToday ? 'today' : '', isSel ? 'selected' : ''].filter(Boolean).join(' ');
                const div = document.createElement('div');
                div.className = cls;
                div.textContent = d;

                if (!isPast) {
                    div.addEventListener('click', (e) => {
                        e.stopPropagation();
                        selDate = new Date(y, m, d);
                        const now = new Date();
                        if (selDate.toDateString() === now.toDateString() && hrSel) {
                            // Default to now+1hr, but clamp to business hours (11AM–8PM)
                            let nextHr24 = now.getHours() + 1;
                            if (nextHr24 < 11) nextHr24 = 11;  // not before opening
                            if (nextHr24 > 20) nextHr24 = 20;  // not after 8PM default
                            ampm = nextHr24 >= 12 ? 'PM' : 'AM';
                            let nextHr12 = nextHr24 > 12 ? nextHr24 - 12 : nextHr24;
                            if (nextHr12 === 0) nextHr12 = 12;
                            hrSel.value = String(nextHr12).padStart(2, '0');
                            if (minSel) minSel.value = '00';
                            wrapper.querySelectorAll('.lg-ampm-btn').forEach(b => {
                                b.classList.toggle('active', b.dataset.val === ampm);
                            });
                        } else if (hrSel) {
                            // Future date: default to 11AM
                            hrSel.value = '11';
                            ampm = 'AM';
                            if (minSel) minSel.value = '00';
                            wrapper.querySelectorAll('.lg-ampm-btn').forEach(b => {
                                b.classList.toggle('active', b.dataset.val === 'AM');
                            });
                        }
                        renderCalendar();
                        updateTrigger();
                        updateNative();
                    });
                }
                gridEl.appendChild(div);
            }
        }

        function updateTrigger() {
            const dtValue       = wrapper.querySelector('.dt-value');
            const dtPlaceholder = wrapper.querySelector('.dt-placeholder');
            if (selDate) {
                const hr  = hrSel ? hrSel.value : '09';
                const min = minSel ? minSel.value : '00';
                const dateStr = selDate.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
                if (dtValue) { dtValue.textContent = `${dateStr}  ${hr}:${min} ${ampm}`; dtValue.style.display = ''; }
                if (dtPlaceholder) dtPlaceholder.style.display = 'none';
            } else {
                if (dtValue) dtValue.style.display = 'none';
                if (dtPlaceholder) { dtPlaceholder.textContent = 'Select date & time...'; dtPlaceholder.style.color = ''; dtPlaceholder.style.display = ''; }
            }
        }

        // Business hours constants (24h)
        const BIZ_OPEN_H = 11, BIZ_OPEN_M = 0;   // 11:00 AM
        const BIZ_CLOSE_H = 20, BIZ_CLOSE_M = 40; // 8:40 PM — last booking slot

        function showTimeError(msg) {
            native.value = '';
            const ph  = wrapper.querySelector('.dt-placeholder');
            const val = wrapper.querySelector('.dt-value');
            if (val) val.style.display = 'none';
            if (ph) { ph.textContent = '⚠ ' + msg; ph.style.color = '#ef4444'; ph.style.display = ''; }
        }

        function clearTimeError() {
            const ph = wrapper.querySelector('.dt-placeholder');
            if (ph && ph.style.color === 'rgb(239, 68, 68)') {
                ph.textContent = 'Select date & time...';
                ph.style.color = '';
            }
        }

        function updateNative() {
            if (!native) return;
            if (!selDate) { native.value = ''; return; }

            let hr24 = parseInt(hrSel ? hrSel.value : '9');
            const mins = minSel ? minSel.value : '00';
            if (ampm === 'PM' && hr24 < 12) hr24 += 12;
            if (ampm === 'AM' && hr24 === 12) hr24 = 0;
            const minsInt = parseInt(mins);

            // ── Business hours check ──────────────────────────────────
            // Before opening (11:00 AM)
            const beforeOpen = hr24 < BIZ_OPEN_H || (hr24 === BIZ_OPEN_H && minsInt < BIZ_OPEN_M);
            // After last slot (8:40 PM)
            const afterClose = hr24 > BIZ_CLOSE_H || (hr24 === BIZ_CLOSE_H && minsInt > BIZ_CLOSE_M);

            if (beforeOpen) {
                showTimeError('We open at 11:00 AM — please select a later time.');
                return;
            }
            if (afterClose) {
                showTimeError('Last booking is at 8:40 PM — we’re closing soon.');
                return;
            }

            // ── Past / too-soon check ─────────────────────────────────
            const selectedTime = new Date(
                selDate.getFullYear(), selDate.getMonth(), selDate.getDate(),
                hr24, minsInt, 0, 0
            );
            const now = new Date();

            if (selectedTime <= now) {
                showTimeError('Please select a future time.');
                return;
            }

            // On the same day: need at least 15 min lead time
            const isToday = selDate.toDateString() === now.toDateString();
            if (isToday && (selectedTime - now) < 15 * 60 * 1000) {
                showTimeError('Please allow at least 15 minutes lead time.');
                return;
            }

            // ── All good ──────────────────────────────────────────────
            clearTimeError();
            const y  = selDate.getFullYear();
            const mo = String(selDate.getMonth() + 1).padStart(2, '0');
            const d  = String(selDate.getDate()).padStart(2, '0');
            native.value = `${y}-${mo}-${d}T${String(hr24).padStart(2, '0')}:${mins}`;
            updateTrigger();
        }

        wrapper._resetCalendar = function() {
            selDate = null; ampm = 'AM'; current = new Date();
            if (hrSel) hrSel.value = '11';
            if (minSel) minSel.value = '00';
            wrapper.querySelectorAll('.lg-ampm-btn').forEach(b => { b.classList.toggle('active', b.dataset.val === 'AM'); });
            if (native) native.value = '';
            renderCalendar(); updateTrigger();
            panel.classList.remove('open'); trigger.classList.remove('open');
        };

        // ── Hour input: free-type, 1-12 only ─────────────────────────
        if (hrSel) {
            hrSel.value = '11';
            hrSel.addEventListener('input', () => {
                // Strip non-digits
                hrSel.value = hrSel.value.replace(/\D/g, '').slice(0, 2);
                updateTrigger(); updateNative();
            });
            hrSel.addEventListener('blur', () => {
                let v = parseInt(hrSel.value) || 11;
                if (v < 1)  v = 1;
                if (v > 12) v = 12;
                hrSel.value = String(v).padStart(2, '0');
                updateTrigger(); updateNative();
            });
            // Up/down arrow keys
            hrSel.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    let v = parseInt(hrSel.value) || 11;
                    v += e.key === 'ArrowUp' ? 1 : -1;
                    if (v < 1)  v = 12;
                    if (v > 12) v = 1;
                    hrSel.value = String(v).padStart(2, '0');
                    updateTrigger(); updateNative();
                }
            });
        }

        // ── Minute input: free-type, 0-59 only ───────────────────────
        if (minSel) {
            minSel.value = '00';
            minSel.addEventListener('input', () => {
                minSel.value = minSel.value.replace(/\D/g, '').slice(0, 2);
                updateTrigger(); updateNative();
            });
            minSel.addEventListener('blur', () => {
                let v = parseInt(minSel.value);
                if (isNaN(v) || v < 0) v = 0;
                if (v > 59) v = 59;
                minSel.value = String(v).padStart(2, '0');
                updateTrigger(); updateNative();
            });
            // Up/down arrow keys
            minSel.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    let v = parseInt(minSel.value) || 0;
                    v += e.key === 'ArrowUp' ? 1 : -1;
                    if (v < 0)  v = 59;
                    if (v > 59) v = 0;
                    minSel.value = String(v).padStart(2, '0');
                    updateTrigger(); updateNative();
                }
            });
        }

        wrapper.querySelectorAll('.lg-ampm-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                wrapper.querySelectorAll('.lg-ampm-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                ampm = btn.dataset.val;
                updateTrigger(); updateNative();
            });
        });

        prevBtn && prevBtn.addEventListener('click', (e) => { e.stopPropagation(); current.setMonth(current.getMonth() - 1); renderCalendar(); });
        nextBtn && nextBtn.addEventListener('click', (e) => { e.stopPropagation(); current.setMonth(current.getMonth() + 1); renderCalendar(); });

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.toggle('open');
            trigger.classList.toggle('open');
        });

        document.addEventListener('click', () => { panel.classList.remove('open'); trigger.classList.remove('open'); });
        panel.addEventListener('click', e => e.stopPropagation());

        renderCalendar();
    }

    // ============================================================
    // TOTAL PANEL RENDERER
    // Reads: main service + wellness add-on checkboxes + additional service checkboxes
    // ============================================================
    function updateTotalPanel(mainServiceName) {
        const totalAmount   = document.getElementById('bk-total-amount');
        const totalLines    = document.getElementById('bk-total-lines');
        const totalEmpty    = document.getElementById('bk-total-empty');
        if (!totalAmount) return;

        const lines = [];
        let total = 0;

        // Main service
        const mainPrice = ADDITIONAL_PRICE_MAP[mainServiceName] || 0;
        if (mainServiceName && mainPrice > 0) {
            lines.push({ name: mainServiceName, price: mainPrice });
            total += mainPrice;
        }

        // Wellness add-ons (multi-select checkboxes)
        const addonChecks = document.querySelectorAll('#addon-checkbox-list input[type="checkbox"]:checked');
        addonChecks.forEach(cb => {
            const p = parseInt(cb.dataset.price) || 0;
            total += p;
            lines.push({ name: cb.value, price: p });
        });

        // Additional services (multi-select checkboxes from any category)
        const addlChecks = document.querySelectorAll('#addl-services-list input[type="checkbox"]:checked');
        addlChecks.forEach(cb => {
            const p = parseInt(cb.dataset.price) || 0;
            total += p;
            lines.push({ name: cb.value, price: p });
        });

        if (lines.length === 0) {
            totalAmount.textContent = '—';
            totalAmount.className = 'bk-total-amount no-service';
            totalLines.innerHTML = '';
            totalEmpty.style.display = 'block';
            return;
        }

        totalEmpty.style.display = 'none';
        totalAmount.className = 'bk-total-amount';
        totalAmount.textContent = '₱' + total.toLocaleString('en-PH');
        totalLines.innerHTML = lines.map(l =>
            `<div class="bk-total-line">
                <span class="bk-total-line-name">${l.name}</span>
                <span class="bk-total-line-price">₱${l.price.toLocaleString()}</span>
            </div>`
        ).join('');
    }

    // ============================================================
    // WELLNESS ADD-ON CHECKBOXES (multi-select)
    // ============================================================
    const ADDON_NAMES = ['Add-on: Ventosa', 'Add-on: Hotstone', 'Add-on: Ear Candling'];

    function buildWellnessAddons(currentMainServiceName) {
        const section = document.getElementById('addon-section');
        if (!section) return;

        const allServices = servicesByCategory['Wellness & Massage'] || [];
        const addonList = allServices.filter(s => ADDON_NAMES.includes(s.name));

        const listEl = document.getElementById('addon-checkbox-list');
        if (!listEl) return;
        listEl.innerHTML = '';

        addonList.forEach(addon => {
            const price = extractPrice(addon.price);
            const row = document.createElement('label');
            row.className = 'addon-cb-row';
            row.innerHTML = `
                <input type="checkbox" value="${addon.name}" data-price="${price}">
                <span class="addon-cb-name">${addon.name}</span>
                <span class="addon-cb-price">${addon.price}</span>`;
            const cb = row.querySelector('input');
            cb.addEventListener('change', () => { updateTotalPanel(currentMainServiceName); });
            listEl.appendChild(row);
        });
    }

    // ============================================================
    // ADDITIONAL SERVICES — ASK + CATEGORY + LIST
    // ============================================================
    // Add-on names that should never appear in the additional services picker
    const ADDL_EXCLUDED_NAMES = /^add-on:/i;

    function buildAdditionalServicesSection(currentMainServiceName, currentCategory) {
        const askSection    = document.getElementById('addl-ask-section');
        const pickerSection = document.getElementById('addl-picker-section');
        if (!askSection || !pickerSection) return;

        askSection.style.display = 'block';
        pickerSection.style.display = 'none';

        // Reset Y/N buttons
        document.querySelectorAll('.addl-yn-btn').forEach(b => b.classList.remove('active'));

        // Rebuild the addl-category dropdown whenever main service changes
        const addlCatWrapper = document.getElementById('addl-cat-wrapper');
        if (addlCatWrapper) {
            const catTrigger = addlCatWrapper.querySelector('.lg-select-trigger');
            if (catTrigger) {
                catTrigger.innerHTML = `<span style="color:var(--text-muted)">Pick a category...</span>${chevronSVG()}`;
                catTrigger.classList.add('placeholder');
                delete catTrigger.dataset.listenersAttached;
            }
            const catPanel = addlCatWrapper.querySelector('.lg-select-panel');
            if (catPanel) catPanel.innerHTML = '';
        }
        // Clear service list and search
        const addlList = document.getElementById('addl-services-list');
        if (addlList) addlList.innerHTML = '';
        const addlSearch = document.getElementById('addl-search');
        if (addlSearch) { addlSearch.value = ''; addlSearch.style.display = 'none'; }

        updateTotalPanel(currentMainServiceName);
    }

    function populateAddlServices(selectedCategory, mainServiceName, searchTerm) {
        const addlList = document.getElementById('addl-services-list');
        if (!addlList) return;

        // Show/update search bar
        const addlSearch = document.getElementById('addl-search');
        if (addlSearch) addlSearch.style.display = 'block';

        // Get all services from category, exclude add-ons and the main service
        const allServices = (servicesByCategory[selectedCategory] || [])
            .filter(s => s.name !== mainServiceName
                      && !ADDL_EXCLUDED_NAMES.test(s.name)
                      && extractPrice(s.price) > 0);

        // Apply search filter if provided
        const term = (searchTerm || '').trim().toLowerCase();
        const services = term
            ? allServices.filter(s => s.name.toLowerCase().includes(term) || (s.desc && s.desc.toLowerCase().includes(term)))
            : allServices;

        addlList.innerHTML = '';

        if (services.length === 0) {
            addlList.innerHTML = `<div style="font-size:0.82rem;color:#52525b;padding:8px 0;">${term ? 'No results match your search.' : 'No additional services available in this category.'}</div>`;
            return;
        }

        services.forEach(s => {
            const price = extractPrice(s.price);
            const row = document.createElement('label');
            row.className = 'addl-cb-row';
            row.innerHTML = `
                <input type="checkbox" value="${s.name}" data-price="${price}">
                <span class="addl-cb-name">${s.name}</span>
                <span class="addl-cb-cat">${selectedCategory}</span>
                <span class="addl-cb-price">₱${price.toLocaleString()}</span>`;
            const cb = row.querySelector('input');
            // Preserve checked state across re-renders
            const alreadyChecked = document.querySelector(`#addl-services-list input[value="${CSS.escape(s.name)}"]:checked`);
            if (alreadyChecked) cb.checked = true;
            cb.addEventListener('change', () => { updateTotalPanel(mainServiceName); });
            addlList.appendChild(row);
        });
    }

    // ============================================================
    // BOOKING RECEIPT MODAL
    // ============================================================
    function showBookingReceipt(result, payload) {
        // Toast alert as well
        showToast(`Your Appointment ID is: ${result.appointment_id}`, 'success', 6000);

        // Build price breakdown
        const allSelected = [payload.service, ...(payload.addons || [])];
        let receiptLines = [];
        let receiptTotal = 0;
        allSelected.forEach(name => {
            const p = ADDITIONAL_PRICE_MAP[name] || 0;
            if (p > 0) { receiptLines.push({ name, price: p }); receiptTotal += p; }
        });

        const apptId = result.appointment_id || '—';
        const dateStr = payload.date ? new Date(payload.date).toLocaleString('en-PH', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

        const linesHtml = receiptLines.length > 0
            ? receiptLines.map(l => `<div class="lg-rcpt-line"><span>${l.name}</span><span>₱${l.price.toLocaleString('en-PH')}</span></div>`).join('')
            : `<div class="lg-rcpt-line" style="color:#52525b;font-style:italic;"><span>${payload.service}</span><span>—</span></div>`;

        const totalHtml = receiptLines.length > 0
            ? `<div class="lg-rcpt-total"><span>Estimated Total</span><span>₱${receiptTotal.toLocaleString('en-PH')}</span></div>`
            : '';

        // Inject styles once
        if (!document.getElementById('lg-rcpt-styles')) {
            const s = document.createElement('style');
            s.id = 'lg-rcpt-styles';
            s.textContent = `
                #lg-receipt-modal {
                    position: fixed; inset: 0; z-index: 100000;
                    background: rgba(0,0,0,0.82);
                    display: flex; align-items: center; justify-content: center;
                    animation: lgFadeIn 0.25s ease;
                    padding: 16px;
                }
                #lg-receipt-box {
                    background: #0e0e10;
                    border: 1px solid #27272a;
                    border-top: 3px solid var(--brand-gold, #D4AF37);
                    max-width: 420px; width: 100%;
                    padding: 32px 28px 24px;
                    position: relative;
                    box-shadow: 0 16px 48px rgba(0,0,0,0.8);
                    font-family: 'Lato', sans-serif;
                }
                .lg-rcpt-logo {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.1rem;
                    font-style: italic;
                    color: var(--brand-gold, #D4AF37);
                    margin-bottom: 6px;
                    letter-spacing: 0.03em;
                }
                .lg-rcpt-headline {
                    font-size: 1.35rem;
                    font-weight: 700;
                    color: #f4f4f5;
                    margin-bottom: 4px;
                }
                .lg-rcpt-sub {
                    font-size: 0.8rem;
                    color: #71717a;
                    margin-bottom: 22px;
                }
                .lg-rcpt-id-block {
                    background: #18181b;
                    border: 1px solid #27272a;
                    border-left: 3px solid var(--brand-gold, #D4AF37);
                    padding: 12px 14px;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                }
                .lg-rcpt-id-label {
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 1.4px;
                    color: #71717a;
                    margin-bottom: 3px;
                }
                .lg-rcpt-id-value {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--brand-gold, #D4AF37);
                    letter-spacing: 0.04em;
                }
                .lg-rcpt-copy-btn {
                    background: none;
                    border: 1px solid #27272a;
                    color: #71717a;
                    font-size: 0.72rem;
                    padding: 5px 10px;
                    cursor: pointer;
                    border-radius: 2px;
                    transition: all 0.15s;
                    white-space: nowrap;
                    font-family: inherit;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }
                .lg-rcpt-copy-btn:hover { border-color: var(--brand-gold, #D4AF37); color: var(--brand-gold, #D4AF37); }
                .lg-rcpt-meta {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                .lg-rcpt-meta-item { font-size: 0.8rem; }
                .lg-rcpt-meta-label {
                    font-size: 0.62rem;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    color: #52525b;
                    margin-bottom: 3px;
                }
                .lg-rcpt-meta-value { color: #d4d4d8; }
                .lg-rcpt-divider { height: 1px; background: #27272a; margin-bottom: 16px; }
                .lg-rcpt-section-label {
                    font-size: 0.62rem;
                    text-transform: uppercase;
                    letter-spacing: 1.4px;
                    color: #52525b;
                    margin-bottom: 10px;
                }
                .lg-rcpt-line {
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                    font-size: 0.83rem;
                    color: #a1a1aa;
                    padding: 6px 0;
                    border-bottom: 1px solid #1a1a1d;
                }
                .lg-rcpt-line:last-child { border-bottom: none; }
                .lg-rcpt-total {
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: var(--brand-gold, #D4AF37);
                    padding-top: 12px;
                    margin-top: 4px;
                    border-top: 1px solid #27272a;
                }
                .lg-rcpt-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 22px;
                }
                .lg-rcpt-btn-dl {
                    flex: 1;
                    padding: 13px 10px;
                    background: var(--brand-gold, #D4AF37);
                    color: #0e0e10;
                    border: none;
                    font-family: inherit;
                    font-size: 0.82rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    cursor: pointer;
                    transition: opacity 0.15s;
                }
                .lg-rcpt-btn-dl:hover { opacity: 0.88; }
                .lg-rcpt-btn-close {
                    padding: 13px 18px;
                    background: none;
                    border: 1px solid #27272a;
                    color: #71717a;
                    font-family: inherit;
                    font-size: 0.82rem;
                    cursor: pointer;
                    transition: border-color 0.15s, color 0.15s;
                    letter-spacing: 0.05em;
                }
                .lg-rcpt-btn-close:hover { border-color: #52525b; color: #a1a1aa; }
                .lg-rcpt-note {
                    font-size: 0.73rem;
                    color: #52525b;
                    margin-top: 14px;
                    text-align: center;
                    line-height: 1.5;
                }
            `;
            document.head.appendChild(s);
        }

        const modal = document.createElement('div');
        modal.id = 'lg-receipt-modal';
        modal.innerHTML = `
            <div id="lg-receipt-box">
                <div class="lg-rcpt-logo">Let's G Aesthetic & Wellness</div>
                <div class="lg-rcpt-headline">Booking Confirmed!</div>
                <div class="lg-rcpt-sub">We look forward to seeing you. Please save your appointment ID.</div>

                <div class="lg-rcpt-id-block">
                    <div>
                        <div class="lg-rcpt-id-label">Appointment ID</div>
                        <div class="lg-rcpt-id-value">${apptId}</div>
                    </div>
                    <button class="lg-rcpt-copy-btn" id="lg-rcpt-copy">Copy</button>
                </div>

                <div class="lg-rcpt-meta">
                    <div class="lg-rcpt-meta-item">
                        <div class="lg-rcpt-meta-label">Name</div>
                        <div class="lg-rcpt-meta-value">${payload.name || '—'}</div>
                    </div>
                    <div class="lg-rcpt-meta-item">
                        <div class="lg-rcpt-meta-label">Date & Time</div>
                        <div class="lg-rcpt-meta-value">${dateStr}</div>
                    </div>
                    <div class="lg-rcpt-meta-item">
                        <div class="lg-rcpt-meta-label">Category</div>
                        <div class="lg-rcpt-meta-value">${payload.category || '—'}</div>
                    </div>
                    <div class="lg-rcpt-meta-item">
                        <div class="lg-rcpt-meta-label">Contact</div>
                        <div class="lg-rcpt-meta-value">${payload.phone || '—'}</div>
                    </div>
                </div>

                <div class="lg-rcpt-divider"></div>
                <div class="lg-rcpt-section-label">Services</div>
                ${linesHtml}
                ${totalHtml}

                <div class="lg-rcpt-actions">
                    <button class="lg-rcpt-btn-dl" id="lg-rcpt-dl">↓ Download Receipt</button>
                    <button class="lg-rcpt-btn-close" id="lg-rcpt-close">Done</button>
                </div>
                <div class="lg-rcpt-note">This is an estimated total. Final pricing may vary based on consultation.</div>
            </div>`;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Copy button
        document.getElementById('lg-rcpt-copy').addEventListener('click', function() {
            navigator.clipboard.writeText(apptId).then(() => {
                this.textContent = 'Copied!';
                setTimeout(() => { this.textContent = 'Copy'; }, 2000);
            }).catch(() => {
                this.textContent = 'Copy';
            });
        });

        // Close
        function closeReceipt() {
            modal.remove();
            document.body.style.overflow = '';
        }
        document.getElementById('lg-rcpt-close').addEventListener('click', closeReceipt);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeReceipt(); });

        // Download receipt as PNG image
        document.getElementById('lg-rcpt-dl').addEventListener('click', () => {
            const DPR    = Math.min(window.devicePixelRatio || 1, 2);
            const W      = 640;
            const GOLD   = '#D4AF37';
            const GOLD2  = '#c9a84c';
            const BG     = '#0e0e10';
            const BG2    = '#18181b';
            const BORDER = '#27272a';
            const TEXT   = '#f4f4f5';
            const MUTED  = '#a1a1aa';
            const DIM    = '#71717a';
            const FAINT  = '#1a1a1d';
            const PAD    = 48;
            const INNER  = W - PAD * 2;

            // ── measure canvas height first ──────────────────────
            // each service line ~26px, header block ~180, meta ~100, footer ~90
            const SERVICE_ROWS = Math.max(receiptLines.length, 1);
            const HAS_NOTES    = !!(payload.notes && payload.notes.trim());
            const NOTES_LINES  = HAS_NOTES ? Math.ceil(payload.notes.length / 55) : 0;
            const H = 220          // top gold bar + logo + headline
                    + 90           // appt ID block
                    + 20           // gap
                    + (HAS_NOTES ? 30 + NOTES_LINES * 20 : 0) // notes
                    + 120          // meta grid (name/date/cat/phone)
                    + 32           // "Services" label + divider
                    + SERVICE_ROWS * 30
                    + (receiptLines.length > 0 ? 46 : 0) // total row
                    + 100;         // footer

            const canvas  = document.createElement('canvas');
            canvas.width  = W * DPR;
            canvas.height = H * DPR;
            const ctx = canvas.getContext('2d');
            ctx.scale(DPR, DPR);

            // helpers
            function rect(x, y, w, h, color) {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            }
            function line(x1, y1, x2, y2, color, width) {
                ctx.strokeStyle = color;
                ctx.lineWidth   = width || 1;
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
            }
            function txt(str, x, y, font, color, align) {
                ctx.font         = font;
                ctx.fillStyle    = color;
                ctx.textAlign    = align || 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(str, x, y);
            }
            function label(str, x, y) {
                txt(str.toUpperCase(), x, y, '600 10px system-ui', DIM, 'left');
            }
            function wrapText(str, x, y, maxW, lineH, font, color) {
                ctx.font = font; ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
                const words = str.split(' ');
                let line = '', lineY = y;
                words.forEach(word => {
                    const test = line ? line + ' ' + word : word;
                    if (ctx.measureText(test).width > maxW && line) {
                        ctx.fillText(line, x, lineY);
                        line = word; lineY += lineH;
                    } else { line = test; }
                });
                if (line) ctx.fillText(line, x, lineY);
                return lineY + lineH;
            }

            let y = 0;

            // ── background ──────────────────────────────────────
            rect(0, 0, W, H, BG);

            // ── gold top bar ────────────────────────────────────
            rect(0, 0, W, 4, GOLD);

            // ── left gold accent stripe ──────────────────────────
            rect(0, 4, 3, H - 4, GOLD2);

            y = 36;

            // ── logo / brand ────────────────────────────────────
            ctx.font         = 'italic 600 15px "Playfair Display", Georgia, serif';
            ctx.fillStyle    = GOLD;
            ctx.textAlign    = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText("Let's G Aesthetic & Wellness", PAD, y);
            y += 26;

            txt('BOOKING CONFIRMATION', PAD, y, '700 10px system-ui', DIM);
            y += 28;

            // ── headline ─────────────────────────────────────────
            txt('Booking Confirmed!', PAD, y, '700 26px system-ui', TEXT);
            y += 36;

            txt('Please save your appointment details.', PAD, y, '400 12px system-ui', DIM);
            y += 32;

            // ── appointment ID block ──────────────────────────────
            rect(PAD, y, INNER, 62, BG2);
            rect(PAD, y, 3, 62, GOLD);
            line(PAD, y + 62, PAD + INNER, y + 62, BORDER);
            label('Appointment ID', PAD + 14, y + 12);
            txt(apptId, PAD + 14, y + 30, '700 16px system-ui', GOLD);
            y += 78;

            // ── notes (if any) ───────────────────────────────────
            if (HAS_NOTES) {
                label('Special Requests', PAD, y);
                y += 16;
                y = wrapText(payload.notes, PAD, y, INNER, 20, '400 12px system-ui', MUTED);
                y += 10;
            }

            // ── meta grid ────────────────────────────────────────
            const metaItems = [
                { label: 'Name',       val: payload.name     || '—' },
                { label: 'Date & Time',val: dateStr                  },
                { label: 'Category',   val: payload.category || '—' },
                { label: 'Contact',    val: payload.phone    || '—' },
            ];
            const colW = INNER / 2;
            metaItems.forEach((item, i) => {
                const col = i % 2;
                const row = Math.floor(i / 2);
                const mx  = PAD + col * colW;
                const my  = y + row * 46;
                label(item.label, mx, my);
                txt(item.val, mx, my + 16, '400 12px system-ui', MUTED);
            });
            y += Math.ceil(metaItems.length / 2) * 46 + 6;

            // ── divider ───────────────────────────────────────────
            line(PAD, y, PAD + INNER, y, BORDER);
            y += 18;
            label('Services', PAD, y);
            y += 20;

            // ── service lines ─────────────────────────────────────
            if (receiptLines.length > 0) {
                receiptLines.forEach((l, i) => {
                    if (i > 0) line(PAD, y, PAD + INNER, y, FAINT);
                    txt(l.name,  PAD, y + 7, '400 12px system-ui', MUTED);
                    txt('₱' + l.price.toLocaleString('en-PH'), PAD + INNER, y + 7, '600 12px system-ui', GOLD, 'right');
                    y += 28;
                });
                // total row
                line(PAD, y, PAD + INNER, y, BORDER);
                y += 12;
                txt('Estimated Total', PAD, y, '700 13px system-ui', TEXT);
                txt('₱' + receiptTotal.toLocaleString('en-PH'), PAD + INNER, y, '700 15px system-ui', GOLD, 'right');
                y += 34;
            } else {
                txt(payload.service || '—', PAD, y + 6, '400 12px system-ui', MUTED);
                y += 30;
            }

            // ── footer divider ────────────────────────────────────
            y += 6;
            line(PAD, y, PAD + INNER, y, BORDER);
            y += 18;

            // note
            txt('Estimated total only. Final pricing subject to consultation.', PAD, y, 'italic 400 10px system-ui', DIM);
            y += 20;

            // address + contact
            txt('G. Lazaro Road, Cor Isabelo Fernando, Valenzuela, 1443', PAD, y, '400 10px system-ui', DIM);
            y += 16;
            txt('(+63) 954 176 8840  ·  letsgreservation@gmail.com', PAD, y, '400 10px system-ui', DIM);
            y += 24;

            // bottom gold bar
            rect(0, H - 3, W, 3, GOLD2);

            // ── export ────────────────────────────────────────────
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a   = document.createElement('a');
                a.href     = url;
                a.download = `LetsG_Receipt_${apptId}.png`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('Receipt image downloaded!', 'success', 3000);
            }, 'image/png');
        });
    }

    // ============================================================
    // OPEN BOOKING
    // ============================================================
    let _bookingIsSubmitting = false;

    window.openBooking = function(preselectedCategory) {
        let bookingModal = document.getElementById('modal-booking');

        if (!bookingModal) {
            injectBookingStyles();

            const categories = Object.keys(servicesByCategory);

            const modalHTML = `
            <div id="modal-booking" class="modal">
                <div class="modal-content">
                    <span class="close-btn" onclick="closeModal('modal-booking')">&times;</span>
                    <h2 style="margin-bottom:5px;">Book Your Session</h2>
                    <p style="color:var(--text-muted);margin-bottom:24px;">Experience ultimate relaxation at Let's G</p>

                    <div class="bk-layout">

                        <!-- LEFT: form column -->
                        <div class="bk-form-col">
                            <form id="bookingFormPop">

                                <div class="form-group">
                                    <input type="text" id="b-name" required placeholder="Full Name (e.g., Juan Dela Cruz)">
                                </div>
                                <div class="form-group">
                                    <div class="phone-input-wrap">
                                        <select class="phone-prefix-select" id="b-phone-prefix">
                                            <option value="+63">🇵🇭 +63</option>
                                            <option value="+1">+1</option>
                                            <option value="+44">+44</option>
                                            <option value="+61">+61</option>
                                        </select>
                                        <input type="tel" id="b-phone" required placeholder="9XXXXXXXXX" maxlength="10" pattern="[0-9]{7,10}" inputmode="numeric">
                                    </div>
                                </div>

                                <!-- CATEGORY dropdown -->
                                <div class="lg-select-wrapper" id="cat-wrapper">
                                    <div class="lg-select-trigger placeholder">
                                        <span>Select a Service Category...</span>
                                        ${chevronSVG()}
                                    </div>
                                    <div class="lg-select-panel"></div>
                                    <select id="b-category-native" name="category"></select>
                                </div>

                                <!-- SERVICE dropdown -->
                                <div class="lg-select-wrapper" id="svc-wrapper">
                                    <div class="lg-select-trigger placeholder disabled">
                                        <span>— Select a category first —</span>
                                        ${chevronSVG()}
                                    </div>
                                    <div class="lg-select-panel"></div>
                                    <select id="b-service-native" name="service"></select>
                                </div>

                                <!-- Confirmed service info -->
                                <div id="b-service-info">
                                    <div class="svc-price" id="b-service-price"></div>
                                    <p class="svc-desc" id="b-service-desc"></p>
                                </div>

                                <!-- WELLNESS ADD-ONS (checkboxes, multi-select, Wellness only) -->
                                <div id="addon-section" style="display:none;">
                                    <div class="addon-section-label">Add-ons (Optional — select any)</div>
                                    <div class="addon-checkbox-list" id="addon-checkbox-list"></div>
                                </div>

                                <!-- ADDITIONAL SERVICES: Ask prompt -->
                                <div id="addl-ask-section" style="display:none;margin-bottom:16px;">
                                    <div class="addl-ask-label">Would you like to add more services?</div>
                                    <div class="addl-ask-btns">
                                        <button type="button" class="addl-yn-btn" id="addl-yes-btn">Yes, add more</button>
                                        <button type="button" class="addl-yn-btn" id="addl-no-btn">No thanks</button>
                                    </div>
                                </div>

                                <!-- ADDITIONAL SERVICES: Category + service picker (shown after "Yes") -->
                                <div id="addl-picker-section" style="display:none;">
                                    <div class="lg-select-wrapper" id="addl-cat-wrapper">
                                        <div class="lg-select-trigger placeholder" id="addl-cat-trigger">
                                            <span>Pick a category...</span>
                                            ${chevronSVG()}
                                        </div>
                                        <div class="lg-select-panel" id="addl-cat-panel"></div>
                                        <select id="b-addl-category-native" name="addl_category"></select>
                                    </div>
                                    <div class="addl-search-wrap">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                        <input type="text" id="addl-search" placeholder="Search services...">
                                    </div>
                                    <div class="addl-services-list" id="addl-services-list"></div>
                                </div>

                                <!-- Date/time picker -->
                                <div class="lg-datetime-wrapper" id="dt-wrapper">
                                    <div class="lg-datetime-trigger">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                        <span class="dt-placeholder">Select date &amp; time...</span>
                                        <span class="dt-value" style="display:none;"></span>
                                    </div>
                                    <div class="lg-cal-panel">
                                        <div class="lg-cal-nav">
                                            <button type="button" class="lg-cal-prev">&#8592;</button>
                                            <span class="lg-cal-month"></span>
                                            <button type="button" class="lg-cal-next">&#8594;</button>
                                        </div>
                                        <div class="lg-cal-grid"></div>
                                        <div class="lg-time-row">
                                            <label>Time:</label>
                                            <div class="lg-time-selects">
                                                <input type="text" inputmode="numeric" class="lg-time-sel lg-hr" maxlength="2" placeholder="11">
                                                <span class="lg-time-colon">:</span>
                                                <input type="text" inputmode="numeric" class="lg-time-sel lg-min" maxlength="2" placeholder="00">
                                            </div>
                                            <div class="lg-ampm-group">
                                                <button type="button" class="lg-ampm-btn active" data-val="AM">AM</button>
                                                <button type="button" class="lg-ampm-btn" data-val="PM">PM</button>
                                            </div>
                                        </div>
                                    </div>
                                    <input type="hidden" id="b-date-native" name="date">
                                </div>

                                <div class="form-group">
                                    <textarea id="b-notes" rows="2" placeholder="Special Requests or Notes (Optional)"></textarea>
                                </div>
                                <button type="submit" id="b-submitBtn" class="btn-primary" style="width:100%;">Confirm Booking</button>
                            </form>
                        </div>

                        <!-- RIGHT: total panel -->
                        <div class="bk-total-col">
                            <div class="bk-total-panel">
                                <div class="bk-total-label">Estimated Total</div>
                                <div class="bk-total-amount no-service" id="bk-total-amount">—</div>
                                <div class="bk-total-divider"></div>
                                <div id="bk-total-lines"></div>
                                <div class="bk-total-empty" id="bk-total-empty">Select a service to see your estimated total here.</div>
                            </div>
                        </div>

                    </div><!-- end .bk-layout -->
                </div>
            </div>`;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
            bookingModal = document.getElementById('modal-booking');

            // ---- Category dropdown ----
            buildDropdown('cat-wrapper', 'b-category-native', 'Select a Service Category...', categories, false, (cat) => {
                const services = servicesByCategory[cat] || [];
                const svcTrigger = document.querySelector('#svc-wrapper .lg-select-trigger');

                if (svcTrigger) {
                    svcTrigger.classList.remove('disabled', 'open');
                    svcTrigger.innerHTML = `<span style="color:var(--text-muted)">Select a specific service...</span>${chevronSVG()}`;
                }
                document.getElementById('b-service-native').value = '';
                document.getElementById('b-service-info').classList.remove('visible');

                // Hide wellness add-ons if switching category
                const addonSec = document.getElementById('addon-section');
                if (addonSec) addonSec.style.display = 'none';

                // Hide additional services sections
                document.getElementById('addl-ask-section').style.display = 'none';
                document.getElementById('addl-picker-section').style.display = 'none';

                // Reset total
                updateTotalPanel('');

                const isWellness = (cat === 'Wellness & Massage');
                const baseServices = isWellness
                    ? services.filter(s => !ADDON_NAMES.includes(s.name))
                    : services;

                buildDropdown('svc-wrapper', 'b-service-native', 'Select a specific service...', baseServices, true, (svc) => {
                    document.getElementById('b-service-price').textContent = svc.price;
                    document.getElementById('b-service-desc').textContent  = svc.desc;
                    document.getElementById('b-service-info').classList.add('visible');

                    // Show wellness add-ons if applicable
                    if (isWellness) {
                        const addonSec = document.getElementById('addon-section');
                        if (addonSec) {
                            addonSec.style.display = 'block';
                            buildWellnessAddons(svc.name);
                        }
                    } else {
                        const addonSec = document.getElementById('addon-section');
                        if (addonSec) addonSec.style.display = 'none';
                    }

                    // Show additional services ask prompt
                    buildAdditionalServicesSection(svc.name, cat);

                    updateTotalPanel(svc.name);
                });
            });

            // ---- "Yes/No" additional services buttons ----
            document.getElementById('addl-yes-btn').addEventListener('click', () => {
                document.getElementById('addl-yes-btn').classList.add('active');
                document.getElementById('addl-no-btn').classList.remove('active');
                document.getElementById('addl-picker-section').style.display = 'block';

                const mainSvcName = document.getElementById('b-service-native').value;
                const mainCat     = document.getElementById('b-category-native').value;

                // Reset trigger appearance for re-open
                const addlCatTrigger = document.getElementById('addl-cat-trigger');
                if (addlCatTrigger) {
                    addlCatTrigger.innerHTML = `<span style="color:var(--text-muted)">Pick a category...</span>${chevronSVG()}`;
                    addlCatTrigger.classList.add('placeholder');
                    delete addlCatTrigger.dataset.listenersAttached;
                }
                document.getElementById('addl-services-list').innerHTML = '';
                const addlSearch = document.getElementById('addl-search');
                if (addlSearch) { addlSearch.value = ''; addlSearch.style.display = 'none'; }

                // Exclude add-on-only categories if needed; use all categories
                const allCats = Object.keys(servicesByCategory);
                let _currentAddlCat = null;

                buildDropdown('addl-cat-wrapper', 'b-addl-category-native', 'Pick a category...', allCats, false, (selectedCat) => {
                    _currentAddlCat = selectedCat;
                    const searchVal = addlSearch ? addlSearch.value : '';
                    populateAddlServices(selectedCat, mainSvcName, searchVal);
                });

                // Wire up search input
                if (addlSearch) {
                    // Remove old listener by cloning
                    const newSearch = addlSearch.cloneNode(true);
                    addlSearch.parentNode.replaceChild(newSearch, addlSearch);
                    newSearch.addEventListener('input', () => {
                        if (_currentAddlCat) {
                            populateAddlServices(_currentAddlCat, mainSvcName, newSearch.value);
                        }
                    });
                }
            });

            document.getElementById('addl-no-btn').addEventListener('click', () => {
                document.getElementById('addl-no-btn').classList.add('active');
                document.getElementById('addl-yes-btn').classList.remove('active');
                document.getElementById('addl-picker-section').style.display = 'none';
                // Uncheck any previously checked additional services
                document.querySelectorAll('#addl-services-list input[type="checkbox"]').forEach(cb => { cb.checked = false; });
                const mainSvcName = document.getElementById('b-service-native').value;
                updateTotalPanel(mainSvcName);
            });

            // ---- Calendar ----
            buildCalendar('dt-wrapper', 'b-date-native');

            // ---- Submit ----
            document.getElementById('bookingFormPop').addEventListener('submit', async function(e) {
                e.preventDefault();
                if (_bookingIsSubmitting) return;
                _bookingIsSubmitting = true;

                const submitBtn = document.getElementById('b-submitBtn');
                submitBtn.innerText = "Processing...";
                submitBtn.disabled  = true;

                if (!document.getElementById('b-category-native').value) {
                    showToast('Please select a service category.', 'error');
                    submitBtn.innerText = 'Confirm Booking'; submitBtn.disabled = false; _bookingIsSubmitting = false; return;
                }
                if (!document.getElementById('b-service-native').value) {
                    showToast('Please select a specific service.', 'error');
                    submitBtn.innerText = 'Confirm Booking'; submitBtn.disabled = false; _bookingIsSubmitting = false; return;
                }
                if (!document.getElementById('b-date-native').value) {
                    showToast('Please select a valid future date and time.', 'error');
                    submitBtn.innerText = 'Confirm Booking'; submitBtn.disabled = false; _bookingIsSubmitting = false; return;
                }

                // Collect all checked add-ons and additional services
                const addonsList = [];
                document.querySelectorAll('#addon-checkbox-list input[type="checkbox"]:checked').forEach(cb => addonsList.push(cb.value));
                document.querySelectorAll('#addl-services-list input[type="checkbox"]:checked').forEach(cb => addonsList.push(cb.value));

                const selectedService = document.getElementById('b-service-native').value;
                const selectedAddons = document.querySelectorAll(
                    '#addon-checkbox-list input[type="checkbox"]:checked, #addl-services-list input[type="checkbox"]:checked'
                );
                const totalPrice = Array.from(selectedAddons).reduce(
                    (total, checkbox) => total + (parseInt(checkbox.dataset.price, 10) || 0),
                    ADDITIONAL_PRICE_MAP[selectedService] || 0
                );

                const payload = {
                    access_key: '86e630dc-487c-4601-ab8a-eca9bedb8e9f',
                    from_name: "Let's G Aesthetics Booking Page",
                    subject: 'New booking request',
                    name:     document.getElementById('b-name').value,
                    phone:    (document.getElementById('b-phone-prefix')?.value || '+63') + document.getElementById('b-phone').value,
                    category: document.getElementById('b-category-native').value,
                    service:  selectedService,
                    date:     document.getElementById('b-date-native').value,
                    notes:    document.getElementById('b-notes').value,
                    addons:   addonsList.join(', ') || 'None',
                    total_price: '₱' + totalPrice.toLocaleString('en-PH')
                };

                try {
                    const response = await fetch('https://api.web3forms.com/submit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    const result = await response.json();
                    console.log('Web3Forms booking response:', result);
                    if (response.ok && result.success) {
                        this.reset();
                        document.getElementById('b-service-info').classList.remove('visible');
                        closeModal('modal-booking');
                        showToast('Booking request sent. The clinic will contact you to confirm your appointment.', 'success', 6000);
                    } else {
                        throw new Error(result.message || 'Unable to send your booking request.');
                    }
                } catch (error) {
                    console.error('Booking request error:', error);
                    showToast(error.message || 'Unable to send your booking request. Please try again.', 'error');
                } finally {
                    submitBtn.innerText = "Confirm Booking";
                    submitBtn.disabled  = false;
                    _bookingIsSubmitting = false;
                }
            });

        } // end if (!bookingModal)

        // Reset calendar on every open
        const dtWrapper = document.getElementById('dt-wrapper');
        if (dtWrapper && dtWrapper._resetCalendar) dtWrapper._resetCalendar();

        // Apply preselectedCategory
        if (preselectedCategory && servicesByCategory[preselectedCategory]) {
            const catPanel = document.querySelector('#cat-wrapper .lg-select-panel');
            const svcTrigger = document.querySelector('#svc-wrapper .lg-select-trigger');
            if (svcTrigger) {
                svcTrigger.innerHTML = `<span style="color:var(--text-muted)">— Select a category first —</span>${chevronSVG()}`;
                svcTrigger.classList.add('disabled');
            }
            document.getElementById('b-service-native').value = '';
            document.getElementById('b-service-info').classList.remove('visible');

            if (catPanel) {
                catPanel.querySelectorAll('.lg-option').forEach(opt => {
                    if (opt.textContent.trim() === preselectedCategory) opt.click();
                });
            }
        }

        bookingModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    // --- 4. POP-UP MODAL CONTROLS ---
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) { modal.classList.add('show'); document.body.style.overflow = 'hidden'; }
    };
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) { modal.classList.remove('show'); document.body.style.overflow = 'auto'; }
    };
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });

    // --- 5. SANCTUARY CLUB SUBMISSION ---
    const clubForm = document.getElementById('clubForm');
    if (clubForm) {
        clubForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const submitBtn    = clubForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Processing...";
            submitBtn.disabled  = true;
            const data = Object.fromEntries(new FormData(clubForm).entries());
            fetch('/database/api.php?route=club', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(r => r.json())
            .then(result => {
                if (result.status === 'success') { showToast(result.message, 'success'); clubForm.reset(); }
                else showToast('Error: ' + result.message, 'error');
            })
            .catch(() => showToast('Something went wrong. Please try again or contact support.', 'error'))
            .finally(() => { submitBtn.innerText = originalText; submitBtn.disabled = false; });
        });
    }

});

// --- 7. GLOBAL UTILITY FUNCTIONS ---
function toggleDemoReel(video) {
    const btn = document.getElementById('demoReelPlayBtn');
    if (!video) return;
    if (video.paused) {
        video.muted = false;
        video.play().catch(err => console.log("Video playback interrupted:", err));
        if (btn) btn.style.display = 'none';
    } else {
        video.pause();
        if (btn) btn.style.display = 'flex';
    }
}