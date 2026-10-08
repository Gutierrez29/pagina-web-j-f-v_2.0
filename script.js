/**
 * Inversiones y Representaciones J&F Hrnos S.A.C.
 * Scripts principales - Modular, accesible y optimizado
 */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const safeInit = (fn, name) => {
            try {
                if (typeof fn === 'function') fn();
            } catch (err) {
                console.error(`[InitError] ${name}:`, err);
            }
        };

        safeInit(initHeaderScroll, 'HeaderScroll');
        safeInit(initMobileMenu, 'MobileMenu');
        safeInit(initHeroSlider, 'HeroSlider');
        safeInit(initRevealAnimations, 'RevealAnimations');
        safeInit(initFaqAccordion, 'FaqAccordion');
        safeInit(initEmailDeobfuscation, 'EmailDeobfuscation');
        safeInit(initMachineryCatalog, 'MachineryCatalog');
        safeInit(initQuotationWizard, 'QuotationWizard');
    });

    /**
     * 1. Header con sombra dinámica al scrollear
     */
    function initHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;

        const handleScroll = () => {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    /**
     * 2. Menú de navegación móvil accesible (a11y)
     */
    function initMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const navbar = document.querySelector('.navbar');
        if (!mobileMenu || !navbar) return;

        const navLinks = navbar.querySelectorAll('a');

        const toggleMenu = (forceClose = false) => {
            const shouldOpen = forceClose ? false : !navbar.classList.contains('active');
            navbar.classList.toggle('active', shouldOpen);
            mobileMenu.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
        };

        mobileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Cerrar menú al hacer clic en enlaces de navegación
        navLinks.forEach(link => {
            link.addEventListener('click', () => toggleMenu(true));
        });

        // Cerrar con la tecla Escape para accesibilidad
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navbar.classList.contains('active')) {
                toggleMenu(true);
                mobileMenu.focus();
            }
        });

        // Cerrar al hacer clic fuera del menú
        document.addEventListener('click', (e) => {
            if (navbar.classList.contains('active') && !navbar.contains(e.target) && e.target !== mobileMenu) {
                toggleMenu(true);
            }
        });
    }

    /**
     * 3. Carrusel Hero interactivo y táctil con soporte Swipe
     */
    function initHeroSlider() {
        const sliderContainer = document.querySelector('.hero-slider');
        const slides = document.querySelectorAll('.hero-slider .slide');
        const prevBtn = document.getElementById('slider-prev');
        const nextBtn = document.getElementById('slider-next');

        if (!sliderContainer || slides.length === 0) return;

        let currentSlide = 0;
        const totalSlides = slides.length;
        let slideTimer = null;
        let isPaused = false;

        const updateSlideAria = () => {
            slides.forEach((slide, idx) => {
                const isActive = idx === currentSlide;
                slide.classList.toggle('active', isActive);
                slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
            });
        };

        const showSlide = (index) => {
            if (index >= totalSlides) {
                currentSlide = 0;
            } else if (index < 0) {
                currentSlide = totalSlides - 1;
            } else {
                currentSlide = index;
            }
            updateSlideAria();
        };

        const nextSlide = () => showSlide(currentSlide + 1);
        const prevSlide = () => showSlide(currentSlide - 1);

        const startAutoPlay = () => {
            stopAutoPlay();
            slideTimer = setInterval(() => {
                if (!isPaused) nextSlide();
            }, 5500);
        };

        const stopAutoPlay = () => {
            if (slideTimer) {
                clearInterval(slideTimer);
                slideTimer = null;
            }
        };

        const restartTimer = () => {
            stopAutoPlay();
            startAutoPlay();
        };

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                restartTimer();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                restartTimer();
            });
        }

        // Pausa en hover y reanudación
        sliderContainer.addEventListener('mouseenter', () => { isPaused = true; });
        sliderContainer.addEventListener('mouseleave', () => { isPaused = false; });

        // Soporte para gestos táctiles (Swipe)
        let touchStartX = 0;
        let touchEndX = 0;

        sliderContainer.addEventListener('touchstart', (e) => {
            isPaused = true;
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sliderContainer.addEventListener('touchend', (e) => {
            isPaused = false;
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            restartTimer();
        }, { passive: true });

        const handleSwipe = () => {
            const threshold = 40;
            const diff = touchStartX - touchEndX;
            if (diff > threshold) {
                nextSlide();
            } else if (diff < -threshold) {
                prevSlide();
            }
        };

        // Inicializar estado ARIA inicial y ciclo automático
        updateSlideAria();
        startAutoPlay();
    }

    /**
     * 4. Animaciones de revelado y contadores con IntersectionObserver
     */
    function initRevealAnimations() {
        const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        if (revealElements.length === 0) return;

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    
                    if (entry.target.classList.contains('count-up')) {
                        animateNumber(entry.target);
                    }
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    function animateNumber(element) {
        const target = parseInt(element.getAttribute('data-target'), 10);
        if (isNaN(target)) return;

        const suffix = element.getAttribute('data-suffix') || '';
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out quad
            const easeProgress = progress * (2 - progress);
            const currentCount = Math.floor(easeProgress * target);

            element.textContent = `+${currentCount}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = `+${target}${suffix}`;
            }
        }

        requestAnimationFrame(update);
    }

    /**
     * 5. Acordeón accesible de Preguntas Frecuentes (FAQ)
     */
    function initFaqAccordion() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        if (faqQuestions.length === 0) return;

        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const isActive = question.classList.contains('active');
                const answer = question.nextElementSibling;

                // Cerrar cualquier otra pregunta abierta
                faqQuestions.forEach(otherQuestion => {
                    if (otherQuestion !== question && otherQuestion.classList.contains('active')) {
                        otherQuestion.classList.remove('active');
                        otherQuestion.setAttribute('aria-expanded', 'false');
                        if (otherQuestion.nextElementSibling) {
                            otherQuestion.nextElementSibling.style.maxHeight = null;
                        }
                    }
                });

                // Alternar estado actual
                question.classList.toggle('active', !isActive);
                question.setAttribute('aria-expanded', !isActive ? 'true' : 'false');

                if (answer) {
                    answer.style.maxHeight = !isActive ? `${answer.scrollHeight}px` : null;
                }
            });
        });
    }

    /**
     * 6. Deofuscación segura de correos electrónicos en cliente
     */
    function initEmailDeobfuscation() {
        const emailSpans = document.querySelectorAll('.obfuscated-email');
        if (emailSpans.length === 0) return;

        emailSpans.forEach(span => {
            const user = span.getAttribute('data-user');
            const domain = span.getAttribute('data-domain');
            if (user && domain) {
                const email = `${user}@${domain}`;
                span.innerHTML = `<a href="mailto:${email}" style="color: inherit; text-decoration: none;">${email}</a>`;
            }
        });
    }

    /**
     * 7. Catálogo interactivo de maquinaria pesada, filtros y modal de ficha técnica
     */
    const FLEET_DATA = [
        {
            id: "excavadora-volvo-ec300",
            name: "Excavadora Volvo EC300",
            category: "Excavadoras",
            workType: "Movimiento de Tierras",
            brand: "Volvo",
            model: "EC300 D/E",
            year: "2021 - 2023",
            power: "228 HP / 170 kW",
            capacity: "2.2 m³",
            operatingWeight: "31,500 Kg",
            maxReach: "10.7 m",
            maxDepth: "7.3 m",
            desc: "Excavadora hidráulica de servicio pesado diseñada para trabajo minero severo y canteras de alta exigencia. Equipada con tren de rodaje reforzado, pluma y balancín HD, sistema electrohidráulico inteligente de alta eficiencia y cabina ROPS/FOPS certificada.",
            img: "img/Maquinaria/excavadora-volvo-ec300.webp",
            applications: [
                "Excavación en roca y material denso",
                "Carguío masivo de volquetes FMX",
                "Perfilado de taludes mineros",
                "Zanjeo para obras de drenaje e infraestructura"
            ]
        },
        {
            id: "excavadora-caterpillar-320",
            name: "Excavadora Caterpillar 320",
            category: "Excavadoras",
            workType: "Movimiento de Tierras",
            brand: "Caterpillar",
            model: "320 Next Gen",
            year: "2022 - 2024",
            power: "158 HP / 117 kW",
            capacity: "1.8 m³",
            operatingWeight: "22,500 Kg",
            maxReach: "9.8 m",
            maxDepth: "6.7 m",
            desc: "Equipo de alta precisión y versatilidad con tecnología Cat Connect integrada. Rendimiento excepcional en corte de taludes, defensas ribereñas y desbroce en zonas geográficamente agrestes como la cuenca de Pataz y Parcoy.",
            img: "img/Maquinaria/excavadora-cat320.webp",
            applications: [
                "Desbroce y excavación de bancos",
                "Defensas ribereñas y encauzamiento de ríos",
                "Obras civiles y cimentaciones de campamentos",
                "Carguío continuo de agregados"
            ]
        },
        {
            id: "cargador-volvo-l150g",
            name: "Cargador Frontal Volvo L150G",
            category: "Cargadores Frontales",
            workType: "Movimiento de Tierras",
            brand: "Volvo",
            model: "L150G",
            year: "2020 - 2023",
            power: "300 HP / 220 kW",
            capacity: "4.2 m³",
            operatingWeight: "26,100 Kg",
            maxReach: "4.1 m",
            maxDepth: "N/A",
            desc: "Cargador sobre ruedas de alto tonelaje para acopio y manipulación ágil de mineral en plantas de beneficio y chancado. Su cinemática TP patentada por Volvo proporciona alto par de desprendimiento en todo el rango de elevación.",
            img: "img/Maquinaria/cargador-volvo-l150g.webp",
            applications: [
                "Alimentación continua de tolvas y chancadoras",
                "Carguío rápido de volquetes de 20 m³",
                "Acopio de mineral y agregados clasificados",
                "Mantenimiento y despeje de frentes de tajo"
            ]
        },
        {
            id: "cargador-komatsu-wa380",
            name: "Cargador Frontal Komatsu WA380-6",
            category: "Cargadores Frontales",
            workType: "Movimiento de Tierras",
            brand: "Komatsu",
            model: "WA380-6",
            year: "2021 - 2023",
            power: "191 HP / 142 kW",
            capacity: "3.5 m³",
            operatingWeight: "18,500 Kg",
            maxReach: "3.9 m",
            maxDepth: "N/A",
            desc: "Equipo robusto y confiable con transmisión hidrostática y convertidor de par con traba automática. Excelente estabilidad y radio de giro reducido, idóneo para patios de maniobra en campamentos y plataformas mineras.",
            img: "img/Maquinaria/cargador-komatsu.webp",
            applications: [
                "Carguío de agregados en canteras",
                "Movimiento de materiales en patios de acopio",
                "Apoyo en obras civiles y viales",
                "Despeje de accesos industriales"
            ]
        },
        {
            id: "retroexcavadora-cat-420f",
            name: "Retroexcavadora Caterpillar 420F",
            category: "Línea Amarilla",
            workType: "Carreteras y Compactación",
            brand: "Caterpillar",
            model: "420F IT 4x4",
            year: "2021 - 2024",
            power: "93 HP / 69 kW",
            capacity: "1.0 m³ frontal / 0.24 m³ posterior",
            operatingWeight: "11,000 Kg",
            maxReach: "6.2 m",
            maxDepth: "5.4 m extendida",
            desc: "Unidad versátil con tracción 4x4, brazo extensible y enganche rápido hidráulico. Diseñada para operar en espacios confinados, mantenimiento de cunetas y apertura de zanjas para servicios en campamentos e interior mina.",
            img: "img/Maquinaria/retroexcavadora-cat420f.webp",
            applications: [
                "Apertura y limpieza de cunetas viales",
                "Excavación de zanjas para tuberías y ductos",
                "Carguío ligero y nivelación de terrenos",
                "Demolición y mantenimiento de plataformas"
            ]
        },
        {
            id: "motoniveladora-cat-140h",
            name: "Motoniveladora Caterpillar 140H",
            category: "Línea Amarilla",
            workType: "Carreteras y Compactación",
            brand: "Caterpillar",
            model: "140H VHP",
            year: "2020 - 2023",
            power: "185 HP / 138 kW",
            capacity: "Vertedera de 4.3 m (14 ft)",
            operatingWeight: "15,800 Kg",
            maxReach: "2.2 m lateral",
            maxDepth: "0.7 m corte",
            desc: "Equipo especializado en conformación de rasantes, cunetas y bombeo en vías de penetración. Fundamental en nuestro servicio de mantenimiento vial periódico en las rutas Tayabamba, Parcoy y anexos mineros.",
            img: "img/Maquinaria/motoniveladora-cat140h.webp",
            applications: [
                "Perfilado y compactación de rasantes",
                "Conformación de cunetas y taludes laterales",
                "Mantenimiento rutinario de carreteras no pavimentadas",
                "Esparcido uniforme de material de afirmado"
            ]
        },
        {
            id: "rodillo-bomag-compactador",
            name: "Rodillo Compactador Bomag",
            category: "Línea Amarilla",
            workType: "Carreteras y Compactación",
            brand: "Bomag",
            model: "BW 211 D-40",
            year: "2021 - 2023",
            power: "134 HP / 100 kW",
            capacity: "Ancho de rolo: 2,130 mm",
            operatingWeight: "12,200 Kg",
            maxReach: "N/A",
            maxDepth: "N/A",
            desc: "Rodillo vibratorio monocilíndrico con tracción en el tambor y neumáticos de alta adherencia. Logra densidades Proctor óptimas en bases granulares, subrasantes y terraplenes de gran espesor.",
            img: "img/Maquinaria/rodillo-compactador.webp",
            applications: [
                "Compactación de terraplenes y pedraplenes",
                "Afirmado de vías departamentales y mineras",
                "Preparación de subrasante para losas de concreto",
                "Estabilización de accesos y botaderos"
            ]
        },
        {
            id: "minicargador-cat-246c",
            name: "Mini Cargador Caterpillar 246C",
            category: "Línea Amarilla",
            workType: "Movimiento de Tierras",
            brand: "Caterpillar",
            model: "246C High Flow",
            year: "2021 - 2023",
            power: "74 HP / 55 kW",
            capacity: "0.45 m³",
            operatingWeight: "3,400 Kg",
            maxReach: "3.1 m elevación",
            maxDepth: "N/A",
            desc: "Equipo compacto de alta maniobrabilidad con sistema hidráulico de alto caudal. Ideal para tareas auxiliares en plantas concentradoras, interior mina, limpieza debajo de fajas y espacios reducidos.",
            img: "img/Maquinaria/minicargador-cat246c.webp",
            applications: [
                "Limpieza bajo fajas transportadoras y tolvas",
                "Movimiento de materiales en espacios reducidos",
                "Mantenimiento dentro de plantas industriales",
                "Carguío ágil en obras de albañilería y pisos"
            ]
        },
        {
            id: "autohormigonera-carmix-35",
            name: "Auto Hormigonera Carmix 3.5 TT",
            category: "Hormigón y Concreto",
            workType: "Producción de Concreto",
            brand: "Carmix",
            model: "3.5 TT 4x4x4",
            year: "2022 - 2024",
            power: "111 HP / 83 kW",
            capacity: "3,500 L por ciclo (14 m³/h)",
            operatingWeight: "7,400 Kg vacío",
            maxReach: "Descarga 300°",
            maxDepth: "N/A",
            desc: "Planta de concreto móvil autocargable todo terreno con tracción y dirección en las 4 ruedas. Equipada con sistema de pesaje computarizado (Joyload) para dosificación exacta de agregados, cemento y aditivos en zonas remotas.",
            img: "img/Maquinaria/carmix-35.webp",
            applications: [
                "Producción de concreto estructural in situ",
                "Vaciado de muros de contención en zonas agrestes",
                "Bases de molinos, tanques y naves industriales",
                "Obras de arte y pontones en carreteras"
            ]
        },
        {
            id: "volquete-volvo-fmx-20m3",
            name: "Volquete Volvo FMX 8x4 / 6x4",
            category: "Volquetes y Acarreo",
            workType: "Acarreo de Minerales",
            brand: "Volvo",
            model: "FMX 480 / 500",
            year: "2022 - 2024",
            power: "480 - 500 HP",
            capacity: "Tolva roquera 15 m³ y 20 m³",
            operatingWeight: "Carga útil: 32,000 Kg",
            maxReach: "N/A",
            maxDepth: "N/A",
            desc: "Flota de volquetes pesados diseñada específicamente para la minería subterránea y de tajo en carreteras de altura. Ejes reductores de cubo, freno de motor VEB+ y tolva semirroquera antiabrasiva para máximo rendimiento.",
            img: "img/Maquinaria/volquete-volvo-fmx.webp",
            applications: [
                "Acarreo masivo de mineral (mena y desmonte)",
                "Transporte de agregados desde cantera a planta",
                "Movimiento de tierras en obras de infraestructura",
                "Soporte en proyectos de estabilización de taludes"
            ]
        },
        {
            id: "camabaja-transporte-40tn",
            name: "Cama Baja de 40 Toneladas",
            category: "Transporte Pesado",
            workType: "Logística Especializada",
            brand: "Volvo / Kenworth",
            model: "Tracto 6x4 + Plataforma Cuello Desmontable",
            year: "2021 - 2024",
            power: "480 HP",
            capacity: "40 Toneladas de carga útil",
            operatingWeight: "Plataforma 12.5 m",
            maxReach: "Largo: 12.5 m",
            maxDepth: "N/A",
            desc: "Unidad de transporte especializada para movilizar maquinaria de línea amarilla (excavadoras, cargadores, rodillos) e infraestructura sobredimensionada hacia los campamentos mineros de la cordillera andina.",
            img: "img/Maquinaria/camabaja-transporte.webp",
            applications: [
                "Traslado de excavadoras Volvo EC300 y Cat 320",
                "Movilización de grúas y maquinaria pesada",
                "Transporte de estructuras metálicas sobredimensionadas",
                "Gestión de rutas con escoltas y permisos MTC"
            ]
        },
        {
            id: "cisterna-combustible-9000",
            name: "Cisterna de Combustibles 9,000 Gln (MATPEL)",
            category: "Cisternas y MATPEL",
            workType: "Logística Especializada",
            brand: "Volvo FMX",
            model: "Encapsulada 4 Compartimientos",
            year: "2021 - 2024",
            power: "440 HP",
            capacity: "9,000 Galones (34,000 L)",
            operatingWeight: "Conforme pesos MTC",
            maxReach: "4 compartimientos",
            maxDepth: "N/A",
            desc: "Cisterna especializada para el transporte terrestre seguro de hidrocarburos y materiales peligrosos en la ruta Trujillo - Pataz. Cuenta con inscripción DGT-MTC, válvula de fondo neumática, recuperación de vapores y GPS en tiempo real.",
            img: "img/Maquinaria/cisterna-9000.webp",
            applications: [
                "Abastecimiento ininterrumpido de diésel B5 S-50 a minas",
                "Transporte seguro de combustibles en ruta nacional",
                "Conductores homologados categoría especial A-IV",
                "Planes de contingencia ambiental y seguros vigentes"
            ]
        },
        {
            id: "cisterna-surtidor-2600",
            name: "Cisterna Surtidor de Combustible 2,600 Gln",
            category: "Cisternas y MATPEL",
            workType: "Logística Especializada",
            brand: "Volvo / Hino",
            model: "Cisterna con Surtidor y Contador Digital",
            year: "2022 - 2024",
            power: "280 HP",
            capacity: "2,600 Galones (9,800 L)",
            operatingWeight: "N/A",
            maxReach: "Manguera retráctil 30m",
            maxDepth: "N/A",
            desc: "Unidad móvil para abastecimiento directo de combustible pie de obra a excavadoras, cargadores y volquetes en frentes de trabajo remotos, evitando traslados innecesarios y paradas operativas.",
            img: "img/Maquinaria/cisterna-surtidor.webp",
            applications: [
                "Abastecimiento directo en frentes de corte y canteras",
                "Suministro de diésel a generadores y compresoras",
                "Control volumétrico digital de despacho",
                "Operación ágil en accesos estrechos"
            ]
        },
        {
            id: "cisterna-regadora-agua",
            name: "Cisterna Regadora de Agua",
            category: "Cisternas y MATPEL",
            workType: "Carreteras y Compactación",
            brand: "Volvo / MB",
            model: "Tanque Elíptico con Flauta y Cañón",
            year: "2021 - 2023",
            power: "330 HP",
            capacity: "4,000 - 5,000 Galones (19,000 L)",
            operatingWeight: "N/A",
            maxReach: "Ancho riego: 8 m",
            maxDepth: "N/A",
            desc: "Cisterna de alta capacidad equipada con motobomba de alto caudal, flauta regadora posterior y cañón superior regulable. Indispensable para el humedecimiento de bases en compactación y mitigación de polvo en caminos mineros.",
            img: "img/Maquinaria/cisterna-regadora.webp",
            applications: [
                "Humedecimiento de material granular en compactación vial",
                "Mitigación y supresión de polvo en accesos mineros",
                "Abastecimiento de agua para autohormigoneras Carmix",
                "Apoyo en lavado de plantas industriales"
            ]
        }
    ];

    // Exponer datos de flota globalmente para hidratación instantánea
    if (typeof window !== 'undefined') {
        window.FLEET_DATA = FLEET_DATA;
    }

    function initMachineryCatalog() {
        const grid = document.getElementById('grid-maquinaria');
        if (!grid) return;

        const searchInput = document.getElementById('machinery-search');
        const searchClearBtn = document.getElementById('search-clear-btn');
        const workTypeFilter = document.getElementById('work-type-filter');
        const counterText = document.getElementById('machinery-counter-text');
        const noResultsBox = document.getElementById('no-machinery-found');
        const resetFiltersBtn = document.getElementById('reset-filters-btn');
        const resetAllFiltersBtn = document.getElementById('reset-all-filters-btn');

        // Elementos del Combobox de Categoría
        const categoryComboboxWrap = document.getElementById('category-combobox-wrap');
        const categoryInput = document.getElementById('category-combobox-input');
        const categoryToggleBtn = document.getElementById('category-toggle-btn');
        const categoryDropdown = document.getElementById('category-dropdown-list');
        const categoryClearBtn = document.getElementById('category-clear-btn');
        const categoryOptionItems = document.querySelectorAll('.combobox-option-item');

        // Modal elements
        const modal = document.getElementById('modal-maquina');
        const modalBody = document.getElementById('modal-machinery-body');
        const modalCloseBtn = document.getElementById('modal-close-btn');
        const modalBackdrop = document.getElementById('modal-backdrop');

        let currentCategory = 'all';
        let currentWorkType = 'all';
        let currentSearchQuery = '';

        // Actualizar contador total
        const countAllEl = document.getElementById('count-all');
        if (countAllEl) {
            countAllEl.textContent = FLEET_DATA.length;
        }

        // Toggle del dropdown de categorías
        const toggleCategoryDropdown = (forceState) => {
            if (!categoryDropdown) return;
            const isOpen = forceState !== undefined ? forceState : !categoryDropdown.classList.contains('open');
            categoryDropdown.classList.toggle('open', isOpen);
            if (categoryComboboxWrap) {
                categoryComboboxWrap.classList.toggle('is-open', isOpen);
            }
            if (categoryToggleBtn) {
                categoryToggleBtn.classList.toggle('rotated', isOpen);
            }
            if (isOpen) {
                categoryDropdown.scrollTop = 0;
                if (!categoryInput || !categoryInput.value.trim()) {
                    categoryOptionItems.forEach(item => item.classList.remove('hidden'));
                }
            }
        };

        // Selección de categoría
        const selectCategoryOption = (catValue, labelText) => {
            currentCategory = catValue;
            if (categoryInput) {
                if (catValue === 'all') {
                    categoryInput.value = '';
                    categoryInput.placeholder = `Todas las categorías (${FLEET_DATA.length})`;
                    if (categoryClearBtn) categoryClearBtn.style.display = 'none';
                } else {
                    categoryInput.value = labelText || catValue;
                    if (categoryClearBtn) categoryClearBtn.style.display = 'block';
                }
            }

            // Marcar ítem activo
            categoryOptionItems.forEach(item => {
                const isMatch = item.getAttribute('data-category') === catValue;
                item.classList.toggle('active', isMatch);
                item.setAttribute('aria-selected', isMatch ? 'true' : 'false');
                item.classList.remove('hidden');
            });

            toggleCategoryDropdown(false);
            filterFleet();
        };

        // Función para renderizar tarjetas
        const renderCatalog = (items) => {
            grid.innerHTML = '';

            if (items.length === 0) {
                noResultsBox.style.display = 'block';
                if (counterText) counterText.innerHTML = `Mostrando <strong>0</strong> de ${FLEET_DATA.length} equipos`;
                return;
            }

            noResultsBox.style.display = 'none';
            if (counterText) counterText.innerHTML = `Mostrando <strong>${items.length}</strong> de ${FLEET_DATA.length} equipos disponibles`;

            items.forEach(item => {
                const card = document.createElement('article');
                card.className = 'machinery-card';
                card.setAttribute('data-id', item.id);

                card.innerHTML = `
                    <div class="machinery-card-media">
                        <a href="maquinaria-detalle.html?id=${item.id}" aria-label="Ver ficha técnica completa de ${item.name}">
                            <img src="${item.img}" alt="${item.name}" width="600" height="375" loading="lazy" decoding="async">
                        </a>
                        <div class="card-badges">
                            <span class="badge-brand">${item.brand}</span>
                            <span class="badge-available">Disponible</span>
                        </div>
                    </div>
                    <div class="machinery-card-body">
                        <span class="card-meta-category">${item.category}</span>
                        <h3 class="machinery-card-title">
                            <a href="maquinaria-detalle.html?id=${item.id}" style="color: inherit; text-decoration: none;">${item.name}</a>
                        </h3>
                        <p class="machinery-card-model">Modelo: <strong>${item.model}</strong> (${item.year})</p>
                        <div class="machinery-specs-summary">
                            <div class="spec-cell">
                                <span class="spec-cell-label">Potencia</span>
                                <span class="spec-cell-value">${item.power.split('/')[0].trim()}</span>
                            </div>
                            <div class="spec-cell">
                                <span class="spec-cell-label">Capacidad</span>
                                <span class="spec-cell-value">${item.capacity.split('(')[0].trim()}</span>
                            </div>
                            <div class="spec-cell">
                                <span class="spec-cell-label">Peso Op.</span>
                                <span class="spec-cell-value">${item.operatingWeight.split('(')[0].trim()}</span>
                            </div>
                        </div>
                        <p class="machinery-card-desc">${item.desc}</p>
                        <div class="machinery-card-actions">
                            <a href="maquinaria-detalle.html?id=${item.id}" class="btn-card-spec" aria-label="Ver ficha técnica de ${item.name}">
                                <i class="fa-solid fa-file-lines" aria-hidden="true"></i> Ficha Técnica
                            </a>
                            <button type="button" class="btn-card-quote" data-action="quote-machine" data-id="${item.id}" aria-label="Cotizar ${item.name}">
                                <i class="fa-solid fa-calculator" aria-hidden="true"></i> Cotizar
                            </button>
                        </div>
                    </div>
                `;

                grid.appendChild(card);
            });
        };

        // Función de filtrado multidimensional
        const filterFleet = () => {
            const query = currentSearchQuery.toLowerCase().trim();
            const catQuery = currentCategory.toLowerCase().trim();

            const filtered = FLEET_DATA.filter(item => {
                // Filtro por categoría (exacto o parcial por texto)
                const matchesCategory = (() => {
                    if (catQuery === 'all' || !catQuery) return true;
                    const itemCat = item.category.toLowerCase();
                    if (itemCat === catQuery || itemCat.includes(catQuery)) return true;
                    if (catQuery.includes('carmix') && item.category === 'Hormigón y Concreto') return true;
                    if ((catQuery.includes('cama baja') || catQuery.includes('camabaja')) && item.category === 'Transporte Pesado') return true;
                    if (catQuery.includes('fmx') && item.category === 'Volquetes y Acarreo') return true;
                    if (catQuery.includes('matpel') && item.category === 'Cisternas y MATPEL') return true;
                    return false;
                })();

                // Filtro por tipo de trabajo
                const matchesWorkType = currentWorkType === 'all' || item.workType === currentWorkType;

                // Filtro por texto de búsqueda
                const matchesSearch = !query || 
                    item.name.toLowerCase().includes(query) ||
                    item.brand.toLowerCase().includes(query) ||
                    item.model.toLowerCase().includes(query) ||
                    item.category.toLowerCase().includes(query) ||
                    item.desc.toLowerCase().includes(query) ||
                    item.capacity.toLowerCase().includes(query);

                return matchesCategory && matchesWorkType && matchesSearch;
            });

            // Visibilidad del botón de restablecer filtros
            if (resetAllFiltersBtn) {
                const hasActiveFilters = (currentCategory !== 'all') || (currentWorkType !== 'all') || (currentSearchQuery !== '');
                resetAllFiltersBtn.style.display = hasActiveFilters ? 'inline-flex' : 'none';
            }

            renderCatalog(filtered);
        };

        // Event Listeners para búsqueda en flota
        if (searchInput) {
            let debounceTimer = null;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    currentSearchQuery = e.target.value;
                    if (searchClearBtn) {
                        searchClearBtn.style.display = currentSearchQuery ? 'block' : 'none';
                    }
                    filterFleet();
                }, 150);
            });
        }

        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    currentSearchQuery = '';
                    searchClearBtn.style.display = 'none';
                    filterFleet();
                    searchInput.focus();
                }
            });
        }

        // Event Listeners para Combobox de Tipo de Maquinaria
        if (categoryToggleBtn) {
            categoryToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCategoryDropdown();
            });
        }

        if (categoryInput) {
            categoryInput.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCategoryDropdown(true);
            });

            categoryInput.addEventListener('focus', () => {
                toggleCategoryDropdown(true);
            });

            // Permite escribir para filtrar dinámicamente ("si se puede escribir mejor")
            let catDebounce = null;
            categoryInput.addEventListener('input', (e) => {
                clearTimeout(catDebounce);
                catDebounce = setTimeout(() => {
                    const text = e.target.value.toLowerCase().trim();
                    if (categoryClearBtn) {
                        categoryClearBtn.style.display = text ? 'block' : 'none';
                    }

                    toggleCategoryDropdown(true);

                    // Filtrar opciones en el dropdown
                    categoryOptionItems.forEach(item => {
                        const label = item.querySelector('.option-label')?.textContent.toLowerCase() || '';
                        const catVal = (item.getAttribute('data-category') || '').toLowerCase();
                        const isAll = catVal === 'all';
                        if (isAll || label.includes(text) || catVal.includes(text)) {
                            item.classList.remove('hidden');
                        } else {
                            item.classList.add('hidden');
                        }
                    });

                    // Actualizar categoría activa
                    currentCategory = text === '' ? 'all' : text;
                    filterFleet();
                }, 100);
            });

            categoryInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    toggleCategoryDropdown(false);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const firstVisible = Array.from(categoryOptionItems).find(
                        item => !item.classList.contains('hidden') && item.getAttribute('data-category') !== 'all'
                    );
                    if (firstVisible) {
                        const cat = firstVisible.getAttribute('data-category');
                        const label = firstVisible.querySelector('.option-label')?.textContent.trim();
                        selectCategoryOption(cat, label);
                    } else {
                        toggleCategoryDropdown(false);
                    }
                }
            });
        }

        // Click en opciones del dropdown
        categoryOptionItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const cat = item.getAttribute('data-category');
                const label = item.querySelector('.option-label')?.textContent.trim();
                selectCategoryOption(cat, label);
            });
        });

        // Botón limpiar categoría (x)
        if (categoryClearBtn) {
            categoryClearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectCategoryOption('all', '');
                if (categoryInput) categoryInput.focus();
            });
        }

        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', (e) => {
            if (categoryComboboxWrap && !categoryComboboxWrap.contains(e.target)) {
                toggleCategoryDropdown(false);
            }
        });

        // Filtro por tipo de trabajo
        if (workTypeFilter) {
            workTypeFilter.addEventListener('change', (e) => {
                currentWorkType = e.target.value;
                filterFleet();
            });
        }

        // Botón de restablecer todos los filtros
        const handleResetAll = () => {
            if (searchInput) {
                searchInput.value = '';
                currentSearchQuery = '';
                if (searchClearBtn) searchClearBtn.style.display = 'none';
            }
            if (workTypeFilter) {
                workTypeFilter.value = 'all';
                currentWorkType = 'all';
            }
            selectCategoryOption('all', '');
        };

        if (resetAllFiltersBtn) {
            resetAllFiltersBtn.addEventListener('click', handleResetAll);
        }

        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', handleResetAll);
        }

        // Delegación de eventos para clicks en Ficha Técnica y Cotizar
        grid.addEventListener('click', (e) => {
            const specBtn = e.target.closest('[data-action="view-spec"]');
            const quoteBtn = e.target.closest('[data-action="quote-machine"]');

            if (specBtn) {
                const machineId = specBtn.getAttribute('data-id');
                openMachineModal(machineId);
            } else if (quoteBtn) {
                const machineId = quoteBtn.getAttribute('data-id');
                quoteDirectMachine(machineId);
            }
        });

        // Apertura de modal con datos del equipo
        const openMachineModal = (machineId) => {
            const machine = FLEET_DATA.find(m => m.id === machineId);
            if (!machine || !modal || !modalBody) return;

            modalBody.innerHTML = `
                <div class="modal-content-grid">
                    <div class="modal-media-col">
                        <div class="modal-img-wrapper">
                            <img src="${machine.img}" alt="${machine.name}" width="600" height="400">
                        </div>
                        <div class="modal-badges-row">
                            <span class="badge-brand">${machine.brand}</span>
                            <span class="badge-available">Disponible en Flota</span>
                        </div>
                        <div class="modal-actions-group" style="margin-top: 15px;">
                            <button type="button" class="btn-modal-quote" id="modal-btn-quote" data-id="${machine.id}">
                                <i class="fa-solid fa-calculator"></i> Cotizar Este Equipo
                            </button>
                            <a href="https://wa.me/51989401670?text=${encodeURIComponent('Hola Inversiones J&F, deseo cotizar la ' + machine.name + ' (' + machine.model + ') para una obra.')}" 
                               target="_blank" rel="noopener" class="btn-modal-whatsapp">
                                <i class="fa-brands fa-whatsapp"></i> WhatsApp Directo
                            </a>
                        </div>
                    </div>
                    <div class="modal-info-col">
                        <h3 id="modal-machinery-title">${machine.name}</h3>
                        <p class="modal-machine-subtitle">${machine.category} &bull; Modelo ${machine.model} (${machine.year})</p>
                        <p class="modal-machine-desc">${machine.desc}</p>
                        
                        <table class="modal-spec-table" aria-label="Especificaciones Técnicas">
                            <tbody>
                                <tr><th>Marca y Modelo</th><td>${machine.brand} / ${machine.model}</td></tr>
                                <tr><th>Potencia de Motor</th><td>${machine.power}</td></tr>
                                <tr><th>Capacidad Operativa</th><td>${machine.capacity}</td></tr>
                                <tr><th>Peso Operativo</th><td>${machine.operatingWeight}</td></tr>
                                <tr><th>Alcance Máximo</th><td>${machine.maxReach}</td></tr>
                                <tr><th>Profundidad Máx.</th><td>${machine.maxDepth}</td></tr>
                            </tbody>
                        </table>

                        <h4 class="modal-applications-title"><i class="fa-solid fa-check-circle" style="color: var(--blue-accent);"></i> Aplicaciones en Terreno:</h4>
                        <ul class="modal-applications-list">
                            ${machine.applications.map(app => `<li><i class="fa-solid fa-check"></i> <span>${app}</span></li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;

            // Vincular acción de cotizar desde dentro del modal
            const innerQuoteBtn = modalBody.querySelector('#modal-btn-quote');
            if (innerQuoteBtn) {
                innerQuoteBtn.addEventListener('click', () => {
                    closeMachineModal();
                    quoteDirectMachine(machine.id);
                });
            }

            modal.style.display = 'flex';
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            if (modalCloseBtn) modalCloseBtn.focus();
        };

        const closeMachineModal = () => {
            if (!modal) return;
            modal.classList.remove('active');
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeMachineModal);
        if (modalBackdrop) modalBackdrop.addEventListener('click', closeMachineModal);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
                closeMachineModal();
            }
        });

        // Cotizar directamente un equipo (selección local o redirección al cotizador multi-página)
        const quoteDirectMachine = (machineId) => {
            const machine = FLEET_DATA.find(m => m.id === machineId);
            const quotationSection = document.getElementById('cotizador');

            if (quotationSection) {
                const machinerySelect = document.getElementById('quote-machinery');
                const serviceSelect = document.getElementById('quote-service');
                if (machinerySelect && machine) {
                    machinerySelect.value = machine.name;
                }
                if (serviceSelect) {
                    serviceSelect.value = 'Alquiler de Maquinaria Pesada';
                }
                quotationSection.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    const firstInput = document.getElementById('quote-name');
                    if (firstInput) firstInput.focus();
                }, 600);
            } else if (machine) {
                // Redirigir hacia contacto.html con parámetros preseleccionados
                window.location.href = `contacto.html?equipo=${encodeURIComponent(machine.name)}&servicio=${encodeURIComponent('Alquiler de Maquinaria Pesada')}#cotizador`;
            }
        };

        // Renderizado inicial
        renderCatalog(FLEET_DATA);
    }

    /**
     * 8. Asistente de cotización en 2 pasos con validación estricta y canalización WhatsApp
     */
    function initQuotationWizard() {
        const form = document.getElementById('quotation-form');
        if (!form) return;

        const step1 = document.getElementById('wizard-step-1');
        const step2 = document.getElementById('wizard-step-2');
        const stepNav1 = document.getElementById('step-nav-1');
        const stepNav2 = document.getElementById('step-nav-2');
        const stepDivider = document.getElementById('step-divider-line');
        const btnNext = document.getElementById('btn-next-step');
        const btnPrev = document.getElementById('btn-prev-step');
        const btnWhatsApp = document.getElementById('btn-send-whatsapp');
        const successBox = document.getElementById('quote-success-box');
        const btnReset = document.getElementById('btn-reset-quote');

        // Controles de Maquinaria Escribible / Combobox en Formulario
        const machinerySearchInput = document.getElementById('quote-machinery-search');
        const machineryHiddenInput = document.getElementById('quote-machinery');
        const machineryToggleBtn = document.getElementById('form-machinery-toggle-btn');
        const machineryClearBtn = document.getElementById('form-machinery-clear-btn');
        const machineryDropdown = document.getElementById('form-machinery-dropdown');
        const previewContainer = document.getElementById('machine-preview-container');
        const previewCard = document.getElementById('selected-machine-card');

        // Restricción estricta de dígitos para Teléfono y RUC
        const phoneInput = document.getElementById('quote-phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9);
            });
        }

        const rucInput = document.getElementById('quote-ruc');
        if (rucInput) {
            rucInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
            });
        }

        // Renderizado de la Tarjeta Preview del Equipo / Camión seleccionado
        const renderMachinePreview = (machineOrName) => {
            if (!previewContainer || !previewCard) return;

            let machine = null;
            if (typeof machineOrName === 'object' && machineOrName !== null) {
                machine = machineOrName;
            } else if (typeof machineOrName === 'string') {
                machine = FLEET_DATA.find(m => m.name.toLowerCase() === machineOrName.toLowerCase());
            }

            if (machine) {
                previewCard.innerHTML = `
                    <img src="${machine.img}" alt="${machine.name}" class="preview-img">
                    <div class="preview-body">
                        <div class="preview-title-row">
                            <h4 class="preview-name">${machine.name}</h4>
                            <span class="preview-badge">${machine.brand}</span>
                            <span class="preview-badge" style="background:#e8f8ef;color:#1e824c;">${machine.category}</span>
                        </div>
                        <div class="preview-specs-row">
                            <span>Modelo: <strong>${machine.model}</strong></span>
                            <span>Capacidad: <strong>${machine.capacity}</strong></span>
                            <span>Potencia: <strong>${machine.power.split('/')[0].trim()}</strong></span>
                            <span>Peso: <strong>${machine.operatingWeight.split('(')[0].trim()}</strong></span>
                        </div>
                    </div>
                    <div class="preview-actions">
                        <a href="maquinaria-detalle.html?id=${machine.id}" target="_blank" rel="noopener" class="preview-link-spec" title="Ver ficha técnica completa">
                            Ver Ficha <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                        <button type="button" class="preview-btn-change" id="btn-change-machine">Cambiar</button>
                    </div>
                `;
                previewContainer.style.display = 'block';

                const changeBtn = previewCard.querySelector('#btn-change-machine');
                if (changeBtn) {
                    changeBtn.addEventListener('click', () => {
                        if (machinerySearchInput) {
                            machinerySearchInput.value = '';
                            machinerySearchInput.focus();
                            toggleMachineryDropdown(true);
                        }
                    });
                }
            } else {
                // Opción genérica: Flota completa / A definir
                previewCard.innerHTML = `
                    <div class="preview-img-fallback">
                        <i class="fa-solid fa-layer-group"></i>
                    </div>
                    <div class="preview-body">
                        <div class="preview-title-row">
                            <h4 class="preview-name">Flota Integral / Asesoría Técnica</h4>
                            <span class="preview-badge">Multiequipos J&F</span>
                        </div>
                        <div class="preview-specs-row">
                            <span>Se cotizará el paquete de equipos (excavadoras, volquetes, rodillos, cisternas) según el plan de obra.</span>
                        </div>
                    </div>
                    <div class="preview-actions">
                        <button type="button" class="preview-btn-change" id="btn-change-machine">Elegir equipo específico</button>
                    </div>
                `;
                previewContainer.style.display = 'block';

                const changeBtn = previewCard.querySelector('#btn-change-machine');
                if (changeBtn) {
                    changeBtn.addEventListener('click', () => {
                        if (machinerySearchInput) {
                            machinerySearchInput.value = '';
                            machinerySearchInput.focus();
                            toggleMachineryDropdown(true);
                        }
                    });
                }
            }
        };

        // Poblar catálogo en el dropdown escribible
        if (machineryDropdown) {
            machineryDropdown.innerHTML = '';

            // Opción por defecto
            const defaultLi = document.createElement('li');
            defaultLi.className = 'machinery-picker-item active';
            defaultLi.setAttribute('data-name', 'Flota completa / A definir según proyecto');
            defaultLi.setAttribute('role', 'option');
            defaultLi.innerHTML = `
                <div class="picker-thumb-fallback"><i class="fa-solid fa-layer-group"></i></div>
                <div class="picker-info">
                    <div class="picker-name">Flota completa / A definir según proyecto</div>
                    <div class="picker-meta">Asesoría integral multiequipo para obra</div>
                </div>
            `;
            machineryDropdown.appendChild(defaultLi);

            // Cada máquina de la flota con su foto y detalles
            FLEET_DATA.forEach(machine => {
                const li = document.createElement('li');
                li.className = 'machinery-picker-item';
                li.setAttribute('data-name', machine.name);
                li.setAttribute('data-id', machine.id);
                li.setAttribute('role', 'option');
                li.innerHTML = `
                    <img src="${machine.img}" alt="${machine.name}" class="picker-thumb" loading="lazy">
                    <div class="picker-info">
                        <div class="picker-name">${machine.name}</div>
                        <div class="picker-meta">${machine.brand} &bull; ${machine.category} &bull; Modelo ${machine.model}</div>
                    </div>
                `;
                machineryDropdown.appendChild(li);
            });
        }

        const toggleMachineryDropdown = (forceState) => {
            if (!machineryDropdown) return;
            const isOpen = forceState !== undefined ? forceState : !machineryDropdown.classList.contains('open');
            machineryDropdown.classList.toggle('open', isOpen);
            if (machineryToggleBtn) {
                machineryToggleBtn.classList.toggle('rotated', isOpen);
            }
            if (isOpen && (!machinerySearchInput || !machinerySearchInput.value.trim())) {
                const items = machineryDropdown.querySelectorAll('.machinery-picker-item');
                items.forEach(it => it.style.display = 'flex');
            }
        };

        const selectMachineOption = (machineName) => {
            if (machineryHiddenInput) machineryHiddenInput.value = machineName;
            if (machinerySearchInput) {
                machinerySearchInput.value = machineName === 'Flota completa / A definir según proyecto' ? '' : machineName;
                machinerySearchInput.placeholder = machineName;
            }
            if (machineryClearBtn) {
                machineryClearBtn.style.display = machineName === 'Flota completa / A definir según proyecto' ? 'none' : 'block';
            }

            // Marcar activo en el dropdown
            if (machineryDropdown) {
                const items = machineryDropdown.querySelectorAll('.machinery-picker-item');
                items.forEach(it => {
                    const isSelected = it.getAttribute('data-name') === machineName;
                    it.classList.toggle('active', isSelected);
                });
            }

            toggleMachineryDropdown(false);
            renderMachinePreview(machineName);
        };

        if (machineryToggleBtn) {
            machineryToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMachineryDropdown();
            });
        }

        if (machinerySearchInput) {
            machinerySearchInput.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMachineryDropdown(true);
            });

            machinerySearchInput.addEventListener('focus', () => {
                toggleMachineryDropdown(true);
            });

            machinerySearchInput.addEventListener('input', (e) => {
                const q = e.target.value.toLowerCase().trim();
                if (machineryClearBtn) machineryClearBtn.style.display = q ? 'block' : 'none';
                toggleMachineryDropdown(true);

                if (machineryDropdown) {
                    const items = machineryDropdown.querySelectorAll('.machinery-picker-item');
                    items.forEach(it => {
                        const name = (it.getAttribute('data-name') || '').toLowerCase();
                        const isMatch = name.includes(q);
                        it.style.display = isMatch ? 'flex' : 'none';
                    });
                }
            });

            machinerySearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    toggleMachineryDropdown(false);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (machineryDropdown) {
                        const firstVisible = Array.from(machineryDropdown.querySelectorAll('.machinery-picker-item'))
                            .find(it => it.style.display !== 'none');
                        if (firstVisible) {
                            selectMachineOption(firstVisible.getAttribute('data-name'));
                        } else {
                            toggleMachineryDropdown(false);
                        }
                    }
                }
            });
        }

        if (machineryClearBtn) {
            machineryClearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectMachineOption('Flota completa / A definir según proyecto');
                if (machinerySearchInput) machinerySearchInput.focus();
            });
        }

        // Delegación de clicks en opciones del selector de maquinaria
        if (machineryDropdown) {
            machineryDropdown.addEventListener('click', (e) => {
                const item = e.target.closest('.machinery-picker-item');
                if (item) {
                    e.stopPropagation();
                    const name = item.getAttribute('data-name');
                    selectMachineOption(name);
                }
            });
        }

        document.addEventListener('click', (e) => {
            const group = document.getElementById('form-machinery-group');
            if (group && !group.contains(e.target)) {
                toggleMachineryDropdown(false);
            }
        });

        // Auto-selección desde parámetros de URL (?equipo=...&servicio=...)
        const urlParams = new URLSearchParams(window.location.search);
        const prefilledEquip = urlParams.get('equipo');
        const prefilledService = urlParams.get('servicio');
        const serviceSelect = document.getElementById('quote-service');

        if (serviceSelect && prefilledService) {
            for (let i = 0; i < serviceSelect.options.length; i++) {
                if (serviceSelect.options[i].value.toLowerCase().includes(prefilledService.toLowerCase()) ||
                    prefilledService.toLowerCase().includes(serviceSelect.options[i].value.toLowerCase())) {
                    serviceSelect.selectedIndex = i;
                    break;
                }
            }
        }

        if (prefilledEquip) {
            selectMachineOption(prefilledEquip);
        } else {
            renderMachinePreview('Flota completa / A definir según proyecto');
        }

        // Scroll suave al cotizador si viene con ancla o parámetros pre-llenados
        if (prefilledEquip || prefilledService || window.location.hash === '#cotizador') {
            const cotizadorSec = document.getElementById('cotizador');
            if (cotizadorSec) {
                setTimeout(() => {
                    cotizadorSec.scrollIntoView({ behavior: 'smooth' });
                    const firstInput = document.getElementById('quote-name');
                    if (firstInput) firstInput.focus();
                }, 400);
            }
        }

        // Helpers de validación
        const setFieldError = (inputId, errorId, message) => {
            const input = document.getElementById(inputId);
            const errorSpan = document.getElementById(errorId);
            if (input) {
                const wrap = input.closest('.input-icon-wrap') || input.closest('.form-group');
                if (wrap) wrap.classList.add('has-error');
            }
            if (errorSpan) errorSpan.textContent = message;
        };

        const clearFieldError = (inputId, errorId) => {
            const input = document.getElementById(inputId);
            const errorSpan = document.getElementById(errorId);
            if (input) {
                const wrap = input.closest('.input-icon-wrap') || input.closest('.form-group');
                if (wrap) wrap.classList.remove('has-error');
            }
            if (errorSpan) errorSpan.textContent = '';
        };

        const validateStep1 = () => {
            let isValid = true;
            const name = document.getElementById('quote-name').value.trim();
            const company = document.getElementById('quote-company').value.trim();
            const ruc = document.getElementById('quote-ruc').value.trim();
            const phone = document.getElementById('quote-phone').value.trim();
            const email = document.getElementById('quote-email').value.trim();

            if (!name || name.length < 3) {
                setFieldError('quote-name', 'error-name', 'Por favor ingrese su nombre y apellido.');
                isValid = false;
            } else {
                clearFieldError('quote-name', 'error-name');
            }

            if (!company || company.length < 2) {
                setFieldError('quote-company', 'error-company', 'Por favor ingrese la razón social o empresa.');
                isValid = false;
            } else {
                clearFieldError('quote-company', 'error-company');
            }

            const rucRegex = /^\d{11}$/;
            if (!ruc || !rucRegex.test(ruc)) {
                setFieldError('quote-ruc', 'error-ruc', 'El RUC debe ser exactamente de 11 dígitos numéricos.');
                isValid = false;
            } else {
                clearFieldError('quote-ruc', 'error-ruc');
            }

            const phoneRegex = /^\d{9}$/;
            if (!phone || !phoneRegex.test(phone)) {
                setFieldError('quote-phone', 'error-phone', 'El teléfono debe tener exactamente 9 dígitos numéricos.');
                isValid = false;
            } else {
                clearFieldError('quote-phone', 'error-phone');
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                setFieldError('quote-email', 'error-email', 'Ingrese un correo electrónico corporativo válido.');
                isValid = false;
            } else {
                clearFieldError('quote-email', 'error-email');
            }

            return isValid;
        };

        const validateStep2 = () => {
            let isValid = true;
            const service = document.getElementById('quote-service').value;
            const location = document.getElementById('quote-location').value.trim();
            const details = document.getElementById('quote-details').value.trim();
            const consent = document.getElementById('quote-consent').checked;

            if (!service) {
                setFieldError('quote-service', 'error-service', 'Seleccione el servicio requerido.');
                isValid = false;
            } else {
                clearFieldError('quote-service', 'error-service');
            }

            if (!location || location.length < 3) {
                setFieldError('quote-location', 'error-location', 'Indique la ubicación o departamento del proyecto.');
                isValid = false;
            } else {
                clearFieldError('quote-location', 'error-location');
            }

            if (!details || details.length < 10) {
                setFieldError('quote-details', 'error-details', 'Detalle brevemente el requerimiento (mínimo 10 caracteres).');
                isValid = false;
            } else {
                clearFieldError('quote-details', 'error-details');
            }

            if (!consent) {
                setFieldError('quote-consent', 'error-consent', 'Debe aceptar los términos para tramitar la cotización.');
                isValid = false;
            } else {
                clearFieldError('quote-consent', 'error-consent');
            }

            return isValid;
        };

        // Navegación Paso 1 -> Paso 2
        if (btnNext) {
            btnNext.addEventListener('click', () => {
                if (!validateStep1()) return;

                step1.style.display = 'none';
                step2.style.display = 'block';

                stepNav1.classList.remove('active');
                stepNav1.classList.add('completed');
                stepNav1.querySelector('.step-circle').innerHTML = '<i class="fa-solid fa-check"></i>';

                stepNav2.classList.add('active');
                stepNav2.setAttribute('aria-selected', 'true');
                if (stepDivider) stepDivider.classList.add('active');
            });
        }

        // Navegación Paso 2 -> Paso 1
        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                step2.style.display = 'none';
                step1.style.display = 'block';

                stepNav2.classList.remove('active');
                stepNav2.setAttribute('aria-selected', 'false');

                stepNav1.classList.remove('completed');
                stepNav1.classList.add('active');
                stepNav1.querySelector('.step-circle').textContent = '1';

                if (stepDivider) stepDivider.classList.remove('active');
            });
        }

        // Generador de Mensaje y Apertura de WhatsApp
        const generateWhatsAppQuote = () => {
            const isStep1Valid = validateStep1();
            if (!isStep1Valid) {
                step2.style.display = 'none';
                step1.style.display = 'block';
                stepNav2.classList.remove('active');
                stepNav1.classList.add('active');
                return;
            }

            const isStep2Valid = validateStep2();
            if (!isStep2Valid) return;

            const name = document.getElementById('quote-name').value.trim();
            const company = document.getElementById('quote-company').value.trim();
            const ruc = document.getElementById('quote-ruc').value.trim();
            const phone = document.getElementById('quote-phone').value.trim();
            const email = document.getElementById('quote-email').value.trim();

            const service = document.getElementById('quote-service').value;
            const machinery = (machineryHiddenInput ? machineryHiddenInput.value : '') || 'Flota completa / A definir según proyecto';
            const location = document.getElementById('quote-location').value.trim();
            const duration = document.getElementById('quote-duration').value;
            const startDate = document.getElementById('quote-start-date').value || 'A definir / Inmediata';
            const details = document.getElementById('quote-details').value.trim();

            const message = `*SOLICITUD DE COTIZACIÓN - INVERSIONES J&F HRNOS*
━━━━━━━━━━━━━━━━━━━━
*DATOS DEL SOLICITANTE:*
👤 *Contacto:* ${name}
🏢 *Empresa:* ${company}
📋 *RUC:* ${ruc}
📞 *Teléfono:* ${phone}
✉️ *Correo:* ${email}

*REQUERIMIENTO TÉCNICO:*
⚙️ *Servicio:* ${service}
🚜 *Equipo:* ${machinery}
📍 *Ubicación de Obra:* ${location}
⏱️ *Duración:* ${duration}
📅 *Fecha Inicio:* ${startDate}

*DETALLES Y ALCANCE:*
${details}
━━━━━━━━━━━━━━━━━━━━
_Enviado desde el portal oficial inversionesjyf.com_`;

            const whatsappUrl = `https://wa.me/51989401670?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank', 'noopener');
        };

        if (btnWhatsApp) {
            btnWhatsApp.addEventListener('click', generateWhatsAppQuote);
        }

        // Envío formal de formulario por Correo (Configurado para diego.gutierrez2911@gmail.com según solicitud)
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!validateStep1() || !validateStep2()) return;

            const name = document.getElementById('quote-name').value.trim();
            const company = document.getElementById('quote-company').value.trim();
            const ruc = document.getElementById('quote-ruc').value.trim();
            const phone = document.getElementById('quote-phone').value.trim();
            const email = document.getElementById('quote-email').value.trim();

            const service = document.getElementById('quote-service').value;
            const machinery = (machineryHiddenInput ? machineryHiddenInput.value : '') || 'Flota completa / A definir según proyecto';
            const location = document.getElementById('quote-location').value.trim();
            const duration = document.getElementById('quote-duration').value;
            const startDate = document.getElementById('quote-start-date').value || 'A definir / Inmediata';
            const details = document.getElementById('quote-details').value.trim();

            // Correo de destino para pruebas solicitado por el usuario
            const targetEmail = 'diego.gutierrez2911@gmail.com';
            const subject = encodeURIComponent(`Solicitud Cotización Formal: ${service} - ${company} (RUC ${ruc})`);
            const body = encodeURIComponent(`Estimado Diego Gutiérrez / Inversiones J&F Hrnos S.A.C.,

Por medio de la presente, solicitamos formalmente la cotización técnico-económica para el siguiente proyecto:

===========================================
1. DATOS DE LA EMPRESA / SOLICITANTE
===========================================
- Contacto: ${name}
- Empresa / Razón Social: ${company}
- RUC: ${ruc}
- Teléfono / WhatsApp: ${phone}
- Correo Electrónico: ${email}

===========================================
2. REQUERIMIENTO TÉCNICO DE LA OBRA
===========================================
- Servicio Solicitado: ${service}
- Maquinaria / Equipo Específico: ${machinery}
- Ubicación / Frente de Trabajo: ${location}
- Duración Estimada del Contrato: ${duration}
- Fecha Estimada de Inicio: ${startDate}

===========================================
3. ALCANCES Y ESPECIFICACIONES DE LA OBRA
===========================================
${details}

===========================================
Solicitud generada a través del portal oficial de Inversiones J&F Hrnos S.A.C.
Quedamos a la espera de su propuesta técnico-comercial.`);

            // Abrir mailto hacia diego.gutierrez2911@gmail.com
            window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;

            // Mostrar estado de éxito y resumen técnico en pantalla
            form.style.display = 'none';
            if (successBox) {
                successBox.innerHTML = `
                    <i class="fa-solid fa-circle-check"></i>
                    <h3>¡Solicitud de Cotización Registrada!</h3>
                    <p>Los datos han sido preparados para envío a: <strong style="color:var(--blue-dark);">${targetEmail}</strong></p>
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:18px; text-align:left; margin:20px 0; font-size:0.9rem; line-height:1.6;">
                        <p style="margin:0 0 6px 0; font-weight:700; color:var(--blue-dark);"><i class="fa-solid fa-file-lines"></i> Resumen de la Solicitud Generada:</p>
                        <p style="margin:2px 0;"><strong>Empresa:</strong> ${company} (RUC: ${ruc})</p>
                        <p style="margin:2px 0;"><strong>Contacto:</strong> ${name} &bull; ${phone} &bull; ${email}</p>
                        <p style="margin:2px 0;"><strong>Servicio:</strong> ${service}</p>
                        <p style="margin:2px 0;"><strong>Equipo Seleccionado:</strong> ${machinery}</p>
                        <p style="margin:2px 0;"><strong>Ubicación:</strong> ${location} &bull; <strong>Duración:</strong> ${duration}</p>
                    </div>
                    <p class="direct-attention">Para atención prioritaria inmediata, comuníquese directamente al <strong>+51 989 401 670</strong>.</p>
                    <button type="button" id="btn-reset-quote" class="btn-wizard-secondary" style="margin-top:15px;">Realizar otra cotización</button>
                `;
                successBox.style.display = 'block';

                const newResetBtn = successBox.querySelector('#btn-reset-quote');
                if (newResetBtn) {
                    newResetBtn.addEventListener('click', () => {
                        form.reset();
                        successBox.style.display = 'none';
                        form.style.display = 'block';
                        step2.style.display = 'none';
                        step1.style.display = 'block';

                        stepNav1.classList.remove('completed');
                        stepNav1.classList.add('active');
                        stepNav1.querySelector('.step-circle').textContent = '1';

                        stepNav2.classList.remove('active');
                        stepNav2.setAttribute('aria-selected', 'false');

                        if (stepDivider) stepDivider.classList.remove('active');
                        selectMachineOption('Flota completa / A definir según proyecto');
                    });
                }
            }
        });

        // Restablecer asistente
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                form.reset();
                if (successBox) successBox.style.display = 'none';
                form.style.display = 'block';
                step2.style.display = 'none';
                step1.style.display = 'block';

                stepNav1.classList.remove('completed');
                stepNav1.classList.add('active');
                stepNav1.querySelector('.step-circle').textContent = '1';

                stepNav2.classList.remove('active');
                stepNav2.setAttribute('aria-selected', 'false');

                if (stepDivider) stepDivider.classList.remove('active');
                selectMachineOption('Flota completa / A definir según proyecto');
            });
        }
    }
})();