import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { translations } from './translations.js';

const canvas = document.getElementById('simulationCanvas');

// Idioma atual: padrão 'en' (Inglês)
let currentLang = localStorage.getItem('sg_sim_lang') || 'en';

// Variáveis da simulação
let simMode = 'classic'; // 'classic' | 'orbital' | 'spin'
let currentL = 0; // 0 (s), 1 (p), 2 (d), 3 (f)
let isRunning = false; // Inicia pausada
let baseSpeed = 0.8;
let magnetStrength = 0.5;
let isMagnetOn = false; // Inicia com o ímã desligado
let presentationLabels = []; // Labels do Modo Apresentação
let apparatusNameLabels = []; // Rótulos simples (Forno, Colimadores...) — ocultados quando os cards narrativos estão visíveis
let isNarrativeOn = true; // Modo Narrativa ativo por padrão

// UI Elements
const btnLangEn = document.getElementById('lang-en');
const btnLangPt = document.getElementById('lang-pt');
const btnClassic = document.getElementById('btn-classic');
const btnOrbital = document.getElementById('btn-orbital');
const btnQuantum = document.getElementById('btn-quantum');
const orbitalSelectorGroup = document.getElementById('orbital-selector-group');
const orbitalBtns = document.querySelectorAll('.orbital-btn');
const btnMagnetOn = document.getElementById('btn-magnet-on');
const btnMagnetOff = document.getElementById('btn-magnet-off');
const magnetSlider = document.getElementById('magnet-slider');
const btnPlayPause = document.getElementById('btn-play-pause');
const playPauseIcon = document.getElementById('play-pause-icon');
const playPauseText = document.getElementById('play-pause-text');
const btnReset = document.getElementById('btn-reset');
const infoBoxText = document.querySelector('.info-box p');
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
const btnResetView = document.getElementById('btn-reset-view');
const btnNarrativeOn = document.getElementById('btn-narrative-on');
const btnNarrativeOff = document.getElementById('btn-narrative-off');

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0b0f19');
scene.fog = new THREE.FogExp2('#0b0f19', 0.0125); // Alcance de visão aumentado em ~20% (densidade reduzida de 0.015 para 0.0125)

// Camera Setup
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 20, 80);

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
labelRenderer.domElement.style.zIndex = '5';
document.querySelector('.app-container').appendChild(labelRenderer.domElement);

function createLabel(text, className, position, parent) {
    const div = document.createElement('div');
    div.className = className;
    div.innerHTML = text;
    const label = new CSS2DObject(div);
    label.position.copy(position);
    parent.add(label);
    return label;
}

// Card narrativo ancorado: a haste (stem) termina exatamente sobre o componente 3D.
// side: 'up' (card acima do ponto) | 'down' (card abaixo). stemX: posição horizontal da haste no card (%).
function createNarrativeCard(cfg, parent) {
    const { step, kicker, title, html, accent, accent2, anchor, side = 'up', stemX = 50, stemH = 46, index = 0, extraClass = '' } = cfg;

    const el = document.createElement('div');
    el.className = `narrative-anchor is-${side} ${extraClass}`.trim();
    if (el.classList.contains('hidden-narrative')) {
        el.setAttribute('aria-hidden', 'true');
        el.inert = true;
    }
    el.style.setProperty('--accent', accent);
    if (accent2) el.style.setProperty('--accent-2', accent2);
    el.style.setProperty('--stem-x', `${stemX}%`);
    el.style.setProperty('--stem-h', `${stemH}px`);
    el.style.setProperty('--i', index);
    el.innerHTML = `
        <div class="nc-wrap">
            <article class="nc-card">
                <header class="nc-head"><span class="nc-step">${step}</span><span>${kicker}</span></header>
                <div class="nc-title">${title}</div>
                ${html}
            </article>
            <span class="nc-stem" aria-hidden="true"></span>
        </div>`;

    const obj = new CSS2DObject(el);
    obj.position.copy(anchor);
    // Alinha o ponto de ancoragem do card com a ponta da haste
    obj.center.set(stemX / 100, side === 'up' ? 1 : 0);
    obj.userData.cfg = cfg;
    parent.add(obj);

    const cardArticle = el.querySelector('.nc-card');
    if (cardArticle) {
        let pointerDownX = 0;
        let pointerDownY = 0;
        let isPointerDown = false;

        cardArticle.addEventListener('pointerdown', (e) => {
            if (el.classList.contains('hidden-narrative')) return;
            if (e.target.closest('a, button')) return;
            if (e.button !== undefined && e.button !== 0) return;
            pointerDownX = e.clientX;
            pointerDownY = e.clientY;
            isPointerDown = true;
        });

        cardArticle.addEventListener('pointerup', (e) => {
            if (el.classList.contains('hidden-narrative')) {
                isPointerDown = false;
                return;
            }
            if (!isPointerDown) return;
            isPointerDown = false;
            // Se o clique foi em um link ou botão interno (como citações [1], [2]), não altera o foco do card
            if (e.target.closest('a, button')) return;
            const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
            if (dist < 6) {
                e.stopPropagation();
                focusNarrativeCard(obj, cfg);
            }
        });

        const t = translations[currentLang] || translations.en;
        cardArticle.setAttribute('title', t.card_click_to_focus || 'Click card to focus camera');
    }

    return obj;
}

function clearPresentationLabels() {
    clearCardFocus();
    presentationLabels.forEach(lbl => {
        if (lbl && lbl.parent) lbl.parent.remove(lbl);
        if (lbl && lbl.element && lbl.element.parentNode) {
            lbl.element.parentNode.removeChild(lbl.element);
        }
    });
    presentationLabels = [];
}

function buildPresentationLabels(parent) {
    clearPresentationLabels();
    const tex = (s) => renderTex(s, true);
    const inl = (s) => renderTex(s, false);
    const t = translations[currentLang] || translations.en;

    const chapters = [
        {
            step: '01', kicker: t.ch01_kicker, title: t.ch01_title,
            accent: '#fbbf24',
            anchor: new THREE.Vector3(-14, 2.3, 0), side: 'up', stemX: 16,
            html: `
                <p>${t.ch01_p1}</p>
                <p>${t.ch01_p2}</p>
                <div class="nc-eq">
                    ${tex('\\mathrm{Ag}:\\;[\\mathrm{Kr}]\\,4d^{10}\\,5s^{1}')}
                    ${tex('l = 0 \\;\\Rightarrow\\; |\\vec L| = \\hbar\\sqrt{l(l+1)} = 0')}
                    ${tex('\\vec\\mu_L = -\\frac{e}{2m_e}\\,\\vec L = \\vec 0')}
                </div>
                <p class="nc-punch">${t.ch01_punch}</p>`
        },
        {
            step: '02', kicker: t.ch02_kicker, title: t.ch02_title,
            accent: '#4ade80',
            anchor: new THREE.Vector3(-7.5, -2.7, 0), side: 'down', stemX: 22,
            html: `
                <p>${t.ch02_p1}</p>
                <p class="nc-punch">${t.ch02_punch}</p>`
        },
        {
            step: '03', kicker: t.ch03_kicker, title: t.ch03_title,
            accent: '#fb7185', accent2: '#60a5fa',
            anchor: new THREE.Vector3(magnetX, 6.2, 0), side: 'up', stemX: 34,
            html: `
                <p>${t.ch03_p1}</p>
                <p>${t.ch03_p2}</p>
                <div class="nc-eq">${tex('F_z = \\mu_z\\,\\frac{\\partial B_z}{\\partial z}')}</div>
                <p class="nc-punch">${t.ch03_punch}</p>`
        },
        {
            step: '04', kicker: t.ch04_kicker, title: t.ch04_title,
            accent: '#38bdf8', accent2: '#ec4899',
            anchor: new THREE.Vector3(screenX, 1.0, -9.5), side: 'up', stemX: 68,
            html: `
                <p>${t.ch04_p1}</p>
                <ul class="nc-list">
                    <li style="--c:#cbd5e1"><b>${t.ch04_classical_name}</b><span>${t.ch04_classical_desc(inl('\\mu_z'))}</span></li>
                    <li style="--c:#a78bfa"><b>${t.ch04_orbital_name(inl('l = 0'))}</b><span>${t.ch04_orbital_desc}</span></li>
                    <li class="is-real"><b>${t.ch04_observed_name}</b><span>${t.ch04_observed_desc}</span></li>
                </ul>
                <div class="nc-eq">${tex('\\mu_z = -g_s\\,\\mu_B\\,m_s, \\qquad m_s = \\pm\\tfrac{1}{2}')}</div>
                <p class="nc-punch">${t.ch04_punch}</p>`
        }
    ];

    chapters.forEach((cfg, index) => {
        const card = createNarrativeCard({ ...cfg, index }, parent);
        // O capítulo 04 (previsões) dá lugar ao card de Resultado quando os feixes se formam
        card.userData.isVerdict = cfg.step === '04';
        presentationLabels.push(card);
    });
}

// Post-Processing (Bloom / Neon Glow)
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 1.5; // Intensidade do neon
bloomPass.radius = 0.8;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 + 0.3; // Permite visualização ligeiramente por baixo
controls.enableZoom = false; // Desabilitamos o zoom nativo para criar um ajuste suave adaptativo
controls.minDistance = 4; // Alcance de aproximação significativamente ampliado para detalhes dos impactos e ímãs
controls.maxDistance = 200; // Limite amplo de afastamento panorâmico

// Variáveis e Controle de Transição Suave de Câmera
let isCameraTransitioning = false;
let cameraTransitionProgress = 0;
let cameraTransitionDuration = 0.85; // Duração ideal em segundos (~850ms)
const cameraStartPos = new THREE.Vector3();
const cameraTargetPos = new THREE.Vector3();
const cameraStartLookAt = new THREE.Vector3();
const cameraTargetLookAt = new THREE.Vector3();
let cameraTransitionCallback = null;

let focusedCard = null; // Referência ao card 3D atualmente em foco

// Curva de interpolação cúbica (aceleração e desaceleração suaves)
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothTransitionCamera(targetPos, targetLookAt, duration = 0.85, onComplete = null) {
    cameraStartPos.copy(camera.position);
    cameraTargetPos.copy(targetPos);
    cameraStartLookAt.copy(controls.target);
    cameraTargetLookAt.copy(targetLookAt);

    cameraTransitionProgress = 0;
    cameraTransitionDuration = Math.max(0.2, duration);
    cameraTransitionCallback = onComplete;
    isCameraTransitioning = true;
}

function cancelCameraTransition() {
    if (isCameraTransitioning) {
        isCameraTransitioning = false;
        cameraTransitionCallback = null;
    }
}

function updateCameraTransition(dt) {
    if (!isCameraTransitioning) return;

    cameraTransitionProgress += dt / cameraTransitionDuration;
    if (cameraTransitionProgress >= 1) {
        cameraTransitionProgress = 1;
        isCameraTransitioning = false;
    }

    const t = easeInOutCubic(cameraTransitionProgress);
    camera.position.lerpVectors(cameraStartPos, cameraTargetPos, t);
    controls.target.lerpVectors(cameraStartLookAt, cameraTargetLookAt, t);

    if (!isCameraTransitioning && typeof cameraTransitionCallback === 'function') {
        const cb = cameraTransitionCallback;
        cameraTransitionCallback = null;
        cb();
    }
}

// Limpa o estado de foco de qualquer card e restaura dicas de interface
function clearCardFocus() {
    if (focusedCard) {
        if (focusedCard.element) {
            focusedCard.element.classList.remove('is-card-focused');
            const art = focusedCard.element.querySelector('.nc-card');
            const t = translations[currentLang] || translations.en;
            if (art) art.setAttribute('title', t.card_click_to_focus || 'Click card to focus camera');
        }
        focusedCard = null;
    }
    document.body.classList.remove('has-card-focused');
}

// Determina o enquadramento perfeito (posição da câmera e alvo) para cada card da simulação
function getCardFocusView(cfg) {
    const panelWidth = window.innerWidth > 768 ? 350 : 0;
    const shift = panelWidth > 0 ? 2.5 : 0;

    const step = cfg.step;
    const isResult = cfg.isResult || (cfg.extraClass && cfg.extraClass.includes('is-result'));

    if (step === '01') {
        return {
            targetLookAt: new THREE.Vector3(-11 + shift, 4.0, 0),
            cameraPos: new THREE.Vector3(-11 + shift, 7.5, 33)
        };
    } else if (step === '02') {
        return {
            targetLookAt: new THREE.Vector3(-5.5 + shift, -3.2, 0),
            cameraPos: new THREE.Vector3(-5.5 + shift, 1.2, 33)
        };
    } else if (step === '03') {
        return {
            targetLookAt: new THREE.Vector3(15.5 + shift, 4.5, 0),
            cameraPos: new THREE.Vector3(15.5 + shift, 8.0, 35)
        };
    } else if (step === '04' || isResult) {
        // Enquadramento com o mesmo ângulo de rotação da câmera padrão da simulação:
        // Câmera padrão: pos (0, 20, 80) olhando para (shift + 18, 0, 0), vetor delta: (-18, 20, 80)
        // Alvo centralizado na região da tela detectora e dos cards (screenX = 49)
        const targetX = 47.0 + shift;
        const targetY = 3.5;
        const targetZ = 0;
        const scale = 0.42; // Fator de escala da distância mantendo o ângulo exato da câmera padrão
        return {
            targetLookAt: new THREE.Vector3(targetX, targetY, targetZ),
            cameraPos: new THREE.Vector3(
                targetX - 18 * scale,
                targetY + 20 * scale,
                targetZ + 80 * scale
            )
        };
    }

    // Fallback dinâmico para eventuais cards adicionais
    const anchor = cfg.anchor || new THREE.Vector3();
    const side = cfg.side || 'up';
    if (side === 'up') {
        return {
            targetLookAt: new THREE.Vector3(anchor.x + 2 + shift, anchor.y + 2, 0),
            cameraPos: new THREE.Vector3(anchor.x + 2 + shift, anchor.y + 5.5, 34)
        };
    } else {
        return {
            targetLookAt: new THREE.Vector3(anchor.x - 2 + shift, anchor.y - 2.5, 0),
            cameraPos: new THREE.Vector3(anchor.x - 2 + shift, anchor.y + 2.5, 34)
        };
    }
}

// Coloca um card narrativo em evidência com transição suave da câmera
function focusNarrativeCard(cardObj, cfg) {
    const t = translations[currentLang] || translations.en;

    // Se já estiver focado no mesmo card, alterna restaurando a visão panorâmica inicial
    if (focusedCard === cardObj) {
        clearCardFocus();
        resetCamera(true);
        return;
    }

    clearCardFocus();

    focusedCard = cardObj;
    if (cardObj.element) {
        cardObj.element.classList.add('is-card-focused');
        const art = cardObj.element.querySelector('.nc-card');
        if (art) art.setAttribute('title', t.card_click_to_reset || 'Click card to restore view');
    }
    document.body.classList.add('has-card-focused');

    const focusView = getCardFocusView(cfg);
    smoothTransitionCamera(focusView.cameraPos, focusView.targetLookAt, 0.85);
}

// Função para aplicar zoom suave e proporcional
function zoomCamera(directionFactor) {
    cancelCameraTransition();
    const distance = camera.position.distanceTo(controls.target);
    // Passo adaptativo: ajuste fino milimétrico quando próximo, mais ágil quando distante
    const zoomStep = Math.max(0.7, Math.min(4.5, distance * 0.055));
    let newDistance = distance + (directionFactor * zoomStep);

    // Respeitar os limites de aproximação e afastamento
    newDistance = Math.max(controls.minDistance, Math.min(controls.maxDistance, newDistance));

    // Atualizar posição da câmera mantendo o vetor de visada
    const directionVector = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).add(directionVector.multiplyScalar(newDistance));
}

// Resetar Câmera para a perspectiva panorâmica inicial (com opção de animação suave)
function resetCamera(smooth = true) {
    clearCardFocus();
    const panelWidth = window.innerWidth > 768 ? 350 : 0;
    const shift = panelWidth > 0 ? 5 : 0;
    const defaultTarget = new THREE.Vector3(shift + 18, 0, 0);
    const defaultPos = new THREE.Vector3(0, 20, 80);

    if (smooth) {
        smoothTransitionCamera(defaultPos, defaultTarget, 0.85);
    } else {
        cancelCameraTransition();
        camera.position.copy(defaultPos);
        controls.target.copy(defaultTarget);
        controls.update();
    }
}

// Cancela a transição se o usuário manipular manualmente o OrbitControls
controls.addEventListener('start', () => {
    cancelCameraTransition();
});

// Lógica de Zoom no Scroll do Mouse e Trackpad
renderer.domElement.addEventListener('wheel', (event) => {
    event.preventDefault();
    cancelCameraTransition();
    const direction = event.deltaY > 0 ? 1 : -1;
    zoomCamera(direction);
}, { passive: false });

// Suporte a Gesto de Pinça (Pinch-to-zoom) em Telas Touch
let touchStartDistance = null;
let touchInitialCameraDistance = null;

renderer.domElement.addEventListener('touchstart', (event) => {
    cancelCameraTransition();
    if (event.touches.length === 2) {
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        touchStartDistance = Math.hypot(dx, dy);
        touchInitialCameraDistance = camera.position.distanceTo(controls.target);
    }
}, { passive: true });

renderer.domElement.addEventListener('touchmove', (event) => {
    if (event.touches.length === 2 && touchStartDistance && touchInitialCameraDistance) {
        cancelCameraTransition();
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        const currentTouchDist = Math.hypot(dx, dy);
        if (currentTouchDist > 0) {
            const factor = touchStartDistance / currentTouchDist;
            let newDistance = touchInitialCameraDistance * factor;
            newDistance = Math.max(controls.minDistance, Math.min(controls.maxDistance, newDistance));
            const directionVector = camera.position.clone().sub(controls.target).normalize();
            camera.position.copy(controls.target).add(directionVector.multiplyScalar(newDistance));
        }
    }
}, { passive: true });

renderer.domElement.addEventListener('touchend', (event) => {
    if (event.touches.length < 2) {
        touchStartDistance = null;
        touchInitialCameraDistance = null;
    }
}, { passive: true });

// Event Listeners dos Botões Flutuantes da Câmera
const btnNavHelp = document.getElementById('btn-nav-help');
const navHelpPanel = document.getElementById('nav-help-panel');
const btnCloseNavHelp = document.getElementById('btn-close-nav-help');

if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => zoomCamera(-2.2));
}
if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => zoomCamera(2.2));
}
if (btnResetView) {
    btnResetView.addEventListener('click', () => resetCamera(true));
}
if (btnNavHelp && navHelpPanel) {
    btnNavHelp.addEventListener('click', (e) => {
        e.stopPropagation();
        navHelpPanel.classList.toggle('visible');
    });
}
if (btnCloseNavHelp && navHelpPanel) {
    btnCloseNavHelp.addEventListener('click', (e) => {
        e.stopPropagation();
        navHelpPanel.classList.remove('visible');
    });
}
document.addEventListener('click', (e) => {
    if (navHelpPanel && navHelpPanel.classList.contains('visible')) {
        if (!navHelpPanel.contains(e.target) && (!btnNavHelp || !btnNavHelp.contains(e.target))) {
            navHelpPanel.classList.remove('visible');
        }
    }
});

// Rastreamento de Teclas para Navegação Contínua da Câmera
const keysPressed = {};

window.addEventListener('keydown', (event) => {
    // Ignorar eventos quando o usuário estiver interagindo com caixas de texto
    if (event.target && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA')) return;

    keysPressed[event.code] = true;

    if (event.key === 'Shift') {
        controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    }

    // Cancelar transição suave quando o usuário assume controle por teclado
    if (event.key !== 'r' && event.key !== 'R') {
        cancelCameraTransition();
    }

    // Ações pontuais imediatas
    if (event.key === '+' || event.key === '=') {
        zoomCamera(-2.0);
    } else if (event.key === '-' || event.key === '_') {
        zoomCamera(2.0);
    } else if (event.key === 'r' || event.key === 'R') {
        resetCamera(true);
    }

    // Prevenir rolagem padrão da página em teclas de navegação
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
        event.preventDefault();
    }
});

window.addEventListener('keyup', (event) => {
    keysPressed[event.code] = false;
    if (event.key === 'Shift') {
        controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    }
});

// Limpar teclas pressionadas caso a janela perca o foco
window.addEventListener('blur', () => {
    for (const code in keysPressed) {
        keysPressed[code] = false;
    }
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
});

// Atualização de Navegação da Câmera (WASD para Translação, Setas para Rotação)
function updateCameraNavigation(dt) {
    if (!dt) return;

    const moveSpeed = 38.0;   // Velocidade de deslocamento (unidades/s)
    const rotateSpeed = 1.7; // Velocidade de rotação angular (radianos/s, ~100°/s)

    // 1. ROTAÇÃO COM SETAS DIRECIONAIS (em torno do alvo controls.target)
    let rotTheta = 0; // Rotação horizontal (azimute)
    let rotPhi = 0;   // Rotação vertical (elevação)

    if (keysPressed['ArrowLeft']) rotTheta += 1;
    if (keysPressed['ArrowRight']) rotTheta -= 1;
    if (keysPressed['ArrowUp']) rotPhi -= 1;
    if (keysPressed['ArrowDown']) rotPhi += 1;

    if (rotTheta !== 0 || rotPhi !== 0) {
        const offset = camera.position.clone().sub(controls.target);
        const spherical = new THREE.Spherical().setFromVector3(offset);

        spherical.theta += rotTheta * rotateSpeed * dt;
        spherical.phi += rotPhi * rotateSpeed * dt;

        // Respeitar os limites de ângulo polar configurados no OrbitControls
        const minPolar = controls.minPolarAngle || 0.05;
        const maxPolar = controls.maxPolarAngle || (Math.PI / 2 + 0.3);
        spherical.phi = Math.max(minPolar, Math.min(maxPolar, spherical.phi));
        spherical.makeSafe();

        camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
        camera.lookAt(controls.target);
    }

    // 2. TRANSLAÇÃO COM WASD (Movimento pelo cenário 3D)
    // Vetor frontal projetado no plano horizontal (X-Z) para navegação fluida
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() > 0.0001) {
        forward.normalize();
    } else {
        forward.set(0, 0, -1);
    }

    // Vetor lateral perpendicular ao frontal
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const moveDelta = new THREE.Vector3();

    // W / S: Frente / Trás
    if (keysPressed['KeyW']) moveDelta.add(forward);
    if (keysPressed['KeyS']) moveDelta.sub(forward);

    // D / A: Direita / Esquerda (strafe)
    if (keysPressed['KeyD']) moveDelta.add(right);
    if (keysPressed['KeyA']) moveDelta.sub(right);

    // E / Q ou Espaço: Elevação vertical (subir / descer)
    if (keysPressed['KeyE'] || keysPressed['Space']) moveDelta.y += 1;
    if (keysPressed['KeyQ']) moveDelta.y -= 1;

    // Aplicar movimento simultâneo na câmera e no alvo do OrbitControls
    if (moveDelta.lengthSq() > 0) {
        moveDelta.normalize().multiplyScalar(moveSpeed * dt);
        camera.position.add(moveDelta);
        controls.target.add(moveDelta);
    }
}

// Adjust canvas for UI panel
function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    composer.setSize(width, height);
    labelRenderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    adjustCameraOffset();
}
window.addEventListener('resize', resize);

// UI Event Listeners
function updateInfoText() {
    if (!infoBoxText) return;
    if (simMode === 'classic') {
        infoBoxText.innerHTML = '<strong>Modo Clássico:</strong> Para um dipolo clássico, o momento magnético pode apontar em qualquer direção, e sua projeção $\\mu_z = |\\vec\\mu|\\cos\\theta$ varia continuamente. Com orientações isotrópicas, a previsão é uma <strong>faixa contínua</strong> de impactos na tela (o "olho" preenchido).';
    } else if (simMode === 'orbital') {
        const numStates = 2 * currentL + 1;
        const letter = ['s', 'p', 'd', 'f'][currentL];
        const mlRange = currentL === 0 ? 'm_l = 0' : `m_l = -${currentL}, \\dots, +${currentL}`;
        infoBoxText.innerHTML = `<strong>Quantização Orbital (mecânica quântica):</strong> Considerando apenas o momento angular orbital, sua projeção no eixo do campo é quantizada: $L_z = m_l\\hbar$. Para o orbital <strong>${letter}</strong> ($l = ${currentL}$), há $2l+1 =$ <strong>${numStates} feixe(s)</strong> ($${mlRange}$) — sempre um número ímpar, com um feixe central ($m_l = 0$) que não sofre desvio.` +
            `<br><br><em>Nota histórica:</em> o modelo de Bohr-Sommerfeld, vigente em 1922, atribuía ao elétron de valência da prata um momento angular orbital $\\hbar$ (número quântico azimutal $k = 1$) e excluía a orientação $m = 0$, prevendo <strong>dois</strong> feixes. Por isso Stern e Gerlach viram no resultado uma confirmação da "quantização espacial": o número de feixes estava certo, mas a explicação não.`;
    } else {
        infoBoxText.innerHTML = '<strong>Spin 1/2 (Stern-Gerlach Real):</strong> O elétron de valência da prata está no orbital 5s ($l = 0$, sem momento orbital). A separação em exatamente <strong>2 feixes</strong> é explicada pelo <strong>spin</strong>, um momento angular intrínseco com $s = 1/2$ e projeções $m_s = \\pm 1/2$. Essa interpretação só surgiu em 1925, com Uhlenbeck e Goudsmit.';
    }
    renderDocumentMath();
}

btnClassic.addEventListener('click', () => {
    simMode = 'classic';
    btnClassic.classList.add('active');
    btnOrbital.classList.remove('active');
    btnQuantum.classList.remove('active');
    orbitalSelectorGroup.style.display = 'none';
    updateInfoText();
    resetSimulation();
});

btnOrbital.addEventListener('click', () => {
    simMode = 'orbital';
    btnOrbital.classList.add('active');
    btnClassic.classList.remove('active');
    btnQuantum.classList.remove('active');
    orbitalSelectorGroup.style.display = 'flex';
    updateInfoText();
    resetSimulation();
});

btnQuantum.addEventListener('click', () => {
    simMode = 'spin';
    btnQuantum.classList.add('active');
    btnClassic.classList.remove('active');
    btnOrbital.classList.remove('active');
    orbitalSelectorGroup.style.display = 'none';
    updateInfoText();
    resetSimulation();
});

orbitalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        orbitalBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentL = parseInt(btn.dataset.l, 10);
        updateInfoText();
        resetSimulation();
    });
});

btnMagnetOn.addEventListener('click', () => {
    isMagnetOn = true;
    btnMagnetOn.classList.add('active');
    btnMagnetOff.classList.remove('active');
    updateMagnetVisuals();
    resetSimulation();
});

btnMagnetOff.addEventListener('click', () => {
    isMagnetOn = false;
    btnMagnetOff.classList.add('active');
    btnMagnetOn.classList.remove('active');
    updateMagnetVisuals();
    resetSimulation();
});

magnetSlider.addEventListener('input', (e) => {
    magnetStrength = parseFloat(e.target.value);
    resetSimulation();
});

function updateNarrativeVisibility() {
    // Cards aparecem apenas com a narrativa ativa e a simulação pausada
    const showCards = isNarrativeOn && !isRunning;
    // Resultados prontos: ímã ligado e feixes já formados na tela
    const resultsReady = isMagnetOn && modeActiveTimer >= LABEL_DELAY_SECONDS;

    presentationLabels.forEach(lbl => {
        const replacedByResult = lbl.userData.isVerdict && resultsReady && isNarrativeOn;
        const isHidden = !showCards || replacedByResult;
        lbl.element.classList.toggle('hidden-narrative', isHidden);
        if (lbl.element.inert !== isHidden) {
            lbl.element.inert = isHidden;
            if (isHidden) {
                lbl.element.setAttribute('aria-hidden', 'true');
            } else {
                lbl.element.removeAttribute('aria-hidden');
            }
        }
        if (isHidden && focusedCard === lbl) {
            clearCardFocus();
        }
    });

    // Card de Resultado: segue o botão de Notas Explicativas e permanece visível mesmo com a simulação pausada
    if (activeResultCard) {
        const isHidden = !(isNarrativeOn && resultsReady);
        activeResultCard.element.classList.toggle('hidden-narrative', isHidden);
        if (activeResultCard.element.inert !== isHidden) {
            activeResultCard.element.inert = isHidden;
            if (isHidden) {
                activeResultCard.element.setAttribute('aria-hidden', 'true');
            } else {
                activeResultCard.element.removeAttribute('aria-hidden');
            }
        }
        if (isHidden && focusedCard === activeResultCard) {
            clearCardFocus();
        }
    }

    // Evita informação duplicada: os rótulos simples saem de cena enquanto os cards estão visíveis
    apparatusNameLabels.forEach(lbl => lbl.element.classList.toggle('is-muted', showCards));
}

function togglePlayPause() {
    isRunning = !isRunning;
    const t = translations[currentLang] || translations.en;
    if (isRunning) {
        playPauseIcon.textContent = '⏸';
        playPauseText.textContent = t.btn_pause;
        btnPlayPause.classList.remove('is-paused');
    } else {
        playPauseIcon.textContent = '▶';
        playPauseText.textContent = t.btn_resume;
        btnPlayPause.classList.add('is-paused');
    }

    updateNarrativeVisibility();
}

btnNarrativeOn.addEventListener('click', () => {
    isNarrativeOn = true;
    btnNarrativeOn.classList.add('active');
    btnNarrativeOff.classList.remove('active');
    updateNarrativeVisibility();
});

btnNarrativeOff.addEventListener('click', () => {
    isNarrativeOn = false;
    btnNarrativeOff.classList.add('active');
    btnNarrativeOn.classList.remove('active');
    updateNarrativeVisibility();
});

btnPlayPause.addEventListener('click', togglePlayPause);
btnReset.addEventListener('click', () => {
    resetSimulation();
    updateNarrativeVisibility();
});

// --- 3D Environment ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
dirLight.position.set(10, 30, 15);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.top = 20;
dirLight.shadow.camera.bottom = -20;
dirLight.shadow.camera.left = -20;
dirLight.shadow.camera.right = 20;
scene.add(dirLight);

// Apparatus Group
const apparatus = new THREE.Group();
scene.add(apparatus);

// Oven
const ovenGeom = new THREE.BoxGeometry(4, 4, 4);
const ovenMat = new THREE.MeshStandardMaterial({ color: 0x8b6508, roughness: 0.8, metalness: 0.2 });
const oven = new THREE.Mesh(ovenGeom, ovenMat);
oven.position.set(-14, 0, 0);
oven.castShadow = true;
oven.receiveShadow = true;
apparatus.add(oven);
const labelOven = createLabel('', 'label', new THREE.Vector3(0, 3.5, 0), oven);
apparatusNameLabels.push(labelOven);

const holeGeom = new THREE.CylinderGeometry(0.2, 0.2, 4.1, 16);
holeGeom.rotateZ(Math.PI / 2);
const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
const hole = new THREE.Mesh(holeGeom, holeMat);
hole.position.copy(oven.position);
apparatus.add(hole);

// Collimators
const colMat = new THREE.MeshStandardMaterial({ color: 0x008000, roughness: 0.6, metalness: 0.1 });
const colGeom = new THREE.BoxGeometry(0.2, 2.5, 6);

const col1Top = new THREE.Mesh(colGeom, colMat);
col1Top.position.set(-9, 1.3, 0);
col1Top.castShadow = true;
apparatus.add(col1Top);

const col1Bottom = new THREE.Mesh(colGeom, colMat);
col1Bottom.position.set(-9, -1.3, 0);
col1Bottom.castShadow = true;
apparatus.add(col1Bottom);

const col2Top = new THREE.Mesh(colGeom, colMat);
col2Top.position.set(-6, 1.3, 0);
col2Top.castShadow = true;
apparatus.add(col2Top);

const col2Bottom = new THREE.Mesh(colGeom, colMat);
col2Bottom.position.set(-6, -1.3, 0);
col2Bottom.castShadow = true;
apparatus.add(col2Bottom);
const labelCollimators = createLabel('', 'label', new THREE.Vector3(-7.5, 3.5, 0), apparatus);
apparatusNameLabels.push(labelCollimators);

// Magnets
const magnetX = 14;
const extrudeSettings = { depth: 10, bevelEnabled: false };
const npoleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4, metalness: 0.2 });
const spoleMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4, metalness: 0.2 });

// Top Pole (N, wedge)
const wedgeShape = new THREE.Shape();
wedgeShape.moveTo(-2.5, 2.5);
wedgeShape.lineTo(2.5, 2.5);
wedgeShape.lineTo(0.5, -2.5);
wedgeShape.lineTo(-0.5, -2.5);
wedgeShape.lineTo(-2.5, 2.5);
const npoleGeom = new THREE.ExtrudeGeometry(wedgeShape, extrudeSettings);
npoleGeom.center();
npoleGeom.rotateY(Math.PI / 2);
const npole = new THREE.Mesh(npoleGeom, npoleMat);
npole.position.set(magnetX, 3.5, 0);
npole.castShadow = true;
npole.receiveShadow = true;
apparatus.add(npole);
const labelN = createLabel('N', 'label magnet-label magnet-n', new THREE.Vector3(0, 0, 2.6), npole);

// Bottom Pole (S, grooved)
const grooveShape = new THREE.Shape();
grooveShape.moveTo(-2.5, -2.5);
grooveShape.lineTo(2.5, -2.5);
grooveShape.lineTo(2.5, 2.5);
grooveShape.lineTo(1.5, 2.5);
grooveShape.quadraticCurveTo(0, 0.5, -1.5, 2.5);
grooveShape.lineTo(-2.5, 2.5);
grooveShape.lineTo(-2.5, -2.5);
const spoleGeom = new THREE.ExtrudeGeometry(grooveShape, extrudeSettings);
spoleGeom.center();
spoleGeom.rotateY(Math.PI / 2);
const spole = new THREE.Mesh(spoleGeom, spoleMat);
spole.position.set(magnetX, -3.5, 0);
spole.castShadow = true;
spole.receiveShadow = true;
apparatus.add(spole);
const labelS = createLabel('S', 'label magnet-label magnet-s', new THREE.Vector3(0, 0, 2.6), spole);
const labelMagnets = createLabel('', 'label', new THREE.Vector3(magnetX, 7, 0), apparatus);
apparatusNameLabels.push(labelMagnets);

function updateMagnetVisuals() {
    if (isMagnetOn) {
        npole.material.color.set(0xef4444);
        spole.material.color.set(0x3b82f6);
        fieldGroup.visible = true;
        if (labelN && labelN.element) labelN.element.style.color = '#ef4444';
        if (labelS && labelS.element) labelS.element.style.color = '#3b82f6';
    } else {
        npole.material.color.set(0x94a3b8);
        spole.material.color.set(0x94a3b8);
        fieldGroup.visible = false;
        if (labelN && labelN.element) labelN.element.style.color = '#94a3b8';
        if (labelS && labelS.element) labelS.element.style.color = '#94a3b8';
    }
}

// Magnetic Field Visualizer (Linhas de campo com setas)
const fieldGroup = new THREE.Group();
fieldGroup.position.set(magnetX, 0, 0);

const lineMat = new THREE.LineBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending
});

const arrowGeom = new THREE.ConeGeometry(0.12, 0.35, 4);
const arrowMat = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});

// Gerar linhas de campo ao longo do ímã
for (let x = -4.5; x <= 4.5; x += 1.0) {
    for (let z = -1; z <= 1; z += 0.5) {
        const startX = x;
        const startY = 1.0;
        const startZ = z * 0.4; // N (topo) é mais focado

        const endX = x;
        const endZ = z * 1.5; // S (base) é mais largo
        // Calcular profundidade para entrar no sulco do ímã S (que é curvo)
        const absZ = Math.abs(endZ) / 1.5;
        const surfaceY = -3.0 + (absZ * 2.0); // O sulco vai de -3.0 (centro) a -1.0 (bordas)
        const endY = surfaceY - 0.3; // Afundar levemente no ímã S

        // Adicionar a curvatura (abaulamento) típica de campos magnéticos
        // As linhas centrais (z=0, x=0) são retas, e as das bordas se curvam para fora
        const ctrlX = x * 1.15;
        const ctrlY = 0;
        const ctrlZ = z * 2.8;

        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(startX, startY, startZ),
            new THREE.Vector3(ctrlX, ctrlY, ctrlZ),
            new THREE.Vector3(endX, endY, endZ)
        );

        const points = curve.getPoints(12);
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geom, lineMat);
        fieldGroup.add(line);

        // Adicionar setinha no meio da curva (t=0.55)
        const t = 0.55;
        const pt = curve.getPoint(t);
        const tangent = curve.getTangent(t).normalize();

        const arrow = new THREE.Mesh(arrowGeom, arrowMat);
        arrow.position.copy(pt);
        // O Cone aponta para Y positivo por padrão. Precisamos alinhá-lo com a tangente
        arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
        fieldGroup.add(arrow);
    }
}
apparatus.add(fieldGroup);

// Screen
const screenX = 49;
const screenGeom = new THREE.PlaneGeometry(40, 60);
const screenMat = new THREE.MeshPhysicalMaterial({
    color: 0x94a3b8,
    transparent: true,
    opacity: 0.4,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 0.5,
    side: THREE.DoubleSide
});
const screen = new THREE.Mesh(screenGeom, screenMat);
screen.position.set(screenX, 0, 0);
screen.rotation.y = -Math.PI / 2;
screen.receiveShadow = true;
apparatus.add(screen);
const labelDetectorScreen = createLabel('', 'label', new THREE.Vector3(screenX, 9, 0), apparatus);
apparatusNameLabels.push(labelDetectorScreen);

function updateApparatusLabels() {
    const t = translations[currentLang] || translations.en;
    if (labelOven && labelOven.element) labelOven.element.innerHTML = t.apparatus_oven;
    if (labelCollimators && labelCollimators.element) labelCollimators.element.innerHTML = t.apparatus_collimators;
    if (labelMagnets && labelMagnets.element) labelMagnets.element.innerHTML = t.apparatus_magnets;
    if (labelDetectorScreen && labelDetectorScreen.element) labelDetectorScreen.element.innerHTML = t.apparatus_screen;
}

// Cards narrativos (precisam de magnetX e screenX já definidos)
buildPresentationLabels(apparatus);

const screenBorderGeom = new THREE.EdgesGeometry(screenGeom);
const screenBorderMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
const screenBorder = new THREE.LineSegments(screenBorderGeom, screenBorderMat);
screenBorder.position.copy(screen.position);
screenBorder.rotation.copy(screen.rotation);
apparatus.add(screenBorder);

// --- Particles System ---
const particleGeom = new THREE.SphereGeometry(0.15, 8, 8);
const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, emissive: 0x475569, metalness: 0.8, roughness: 0.2 });
const quantumUpMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, metalness: 0.8, roughness: 0.2 });
const quantumDownMat = new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xbe185d, metalness: 0.8, roughness: 0.2 });

const impactsGroup = new THREE.Group();
scene.add(impactsGroup);

class Particle {
    constructor() {
        this.mesh = new THREE.Mesh(particleGeom, silverMat);
        scene.add(this.mesh);
        this.reset();
        this.active = false;
        this.mesh.visible = false;
    }

    reset() {
        this.mesh.position.set(-13.5, (Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.25);
        this.vx = baseSpeed * (0.36 + Math.random() * 0.08); // Velocidade mais homogênea para feixes nítidos
        this.vy = (Math.random() - 0.5) * 0.003; // Espalhamento vertical reduzido (linhas bem definidas)
        this.vz = (Math.random() - 0.5) * 0.055; // Espalhamento lateral ~30% menor

        this.spinContinuous = (Math.random() - 0.5) * 2; // -1 to 1
        this.spinDiscrete = Math.random() > 0.5 ? 1 : -1; // +1 or -1

        // Valor de ml para o modo orbital (-l até +l)
        if (currentL === 0) {
            this.ml = 0;
        } else {
            const possibleMl = [];
            for (let m = -currentL; m <= currentL; m++) {
                possibleMl.push(m);
            }
            this.ml = possibleMl[Math.floor(Math.random() * possibleMl.length)];
        }

        this.mesh.material = silverMat;
        this.active = true;
    }

    update() {
        if (!this.active) return;

        this.mesh.position.x += this.vx;
        this.mesh.position.y += this.vy;
        this.mesh.position.z += this.vz;

        // Apply magnetic field
        if (this.mesh.position.x > magnetX - 5 && this.mesh.position.x < magnetX + 5) {
            if (isMagnetOn) {
                // Criação do formato de "olho": a força diminui parabolicamente nas bordas (z maior)
                const zPos = this.mesh.position.z;
                const zFactor = Math.max(0.05, 1 - (zPos * zPos) / 5.5);

                // Reduzindo a força do ímã em 10x (0.015 para 0.0015)
                const force = magnetStrength * 0.0015 * zFactor;

                if (simMode === 'spin') {
                    this.vy += this.spinDiscrete * force;
                    this.mesh.material = this.spinDiscrete > 0 ? quantumUpMat : quantumDownMat;
                } else if (simMode === 'orbital') {
                    // Modo orbital: partículas ficam prateadas (não pintadas)
                    const deflection = currentL === 0 ? 0 : (this.ml / currentL) * force;
                    this.vy += deflection;
                    this.mesh.material = silverMat;
                } else {
                    // Modo clássico: contínuo, prateadas
                    this.vy += this.spinContinuous * force;
                    this.mesh.material = silverMat;
                }
            } else {
                // Quando o imã está desligado, não muda cor nem sofre desvio
                this.mesh.material = silverMat;
            }
        }

        // Hit screen
        if (this.mesh.position.x >= screenX) {
            this.active = false;
            createImpact(this.mesh.position.clone(), this.mesh.material.color);
            this.mesh.visible = false;
        }

        // Off screen bounding box fallback
        if (this.mesh.position.x > screenX + 10 || Math.abs(this.mesh.position.y) > 60) {
            this.active = false;
            this.mesh.visible = false;
        }
    }
}

const particles = [];
for (let i = 0; i < 240; i++) {
    const p = new Particle();
    particles.push(p);
}

const maxImpacts = 4000;
let impactsData = [];

// Geometria global para impactos
const impGeom = new THREE.SphereGeometry(0.25, 8, 8);
const impMatSilver = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
const impMatCyan = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
const impMatMagenta = new THREE.MeshBasicMaterial({ color: 0xec4899 });

function createImpact(pos, color) {
    let mat = impMatSilver;
    if (simMode === 'spin') {
        const hex = color.getHex();
        if (hex === 0x38bdf8) mat = impMatCyan;
        else if (hex === 0xec4899) mat = impMatMagenta;
    }

    const impact = new THREE.Mesh(impGeom, mat);

    // Flatten against screen slightly, but z and y are hit pos
    impact.position.set(screenX - 0.05, pos.y, pos.z);

    // Removido PointLight individual por impacto (causava muita lentidão)

    impactsGroup.add(impact);
    impactsData.push(impact);

    if (impactsData.length > maxImpacts) {
        const old = impactsData.shift();
        impactsGroup.remove(old);
        // Não descartar geometry e material, pois agora são globais
    }
}

function clearImpacts() {
    impactsData.forEach(imp => {
        impactsGroup.remove(imp);
    });
    impactsData = [];
}

// Helper para renderizar expressões matemáticas em LaTeX via KaTeX
function renderTex(tex, isDisplay = false) {
    if (window.katex) {
        try {
            return window.katex.renderToString(tex, {
                displayMode: isDisplay,
                throwOnError: false
            });
        } catch (e) {
            return tex;
        }
    }
    return tex;
}

// Renderizar LaTeX nos textos estáticos da interface
function renderDocumentMath() {
    if (window.renderMathInElement) {
        window.renderMathInElement(document.body, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false }
            ],
            throwOnError: false
        });
    }
}
setTimeout(renderDocumentMath, 400);

// --- Dynamic Detector Screen Labels (Spin, Orbital, Classic) ---
// Dois níveis de informação enquanto a simulação roda:
//  1. Beam tags: etiquetas compactas com haste apontando para cada feixe (sempre visíveis)
//  2. Card de Resultado: explicação física do padrão observado (segue o botão de Notas Explicativas)
const LABEL_DELAY_SECONDS = 4.0; // Tempo em segundos até as etiquetas aparecerem
const BEAM_TAG_Z = 9.0; // Fora da região de impactos (|z| ≲ 5.5), levemente à direita na visão inicial
let activeDetectorLabels = [];
let activeResultCard = null;
let modeActiveTimer = 0;

function removeCSS2DLabel(lbl) {
    if (!lbl) return;
    if (lbl.parent) lbl.parent.remove(lbl);
    if (lbl.element && lbl.element.parentNode) {
        lbl.element.parentNode.removeChild(lbl.element);
    }
}

function clearDetectorLabels() {
    activeDetectorLabels.forEach(removeCSS2DLabel);
    activeDetectorLabels = [];
    if (focusedCard === activeResultCard) {
        clearCardFocus();
    }
    removeCSS2DLabel(activeResultCard);
    activeResultCard = null;
}

// Etiqueta de feixe: ponto + haste curta ancorados no feixe, corpo à direita
function createBeamTag({ main, sub = '', color, color2 = null, y, compact = false, index = 0 }) {
    const el = document.createElement('div');
    el.className = `beam-tag${compact ? ' is-compact' : ''}`;
    el.style.setProperty('--c', color);
    el.style.setProperty('--c2', color2 || color);
    el.style.setProperty('--i', index);
    el.innerHTML = `
        <div class="bt-inner">
            <span class="bt-lead" aria-hidden="true"></span>
            <div class="bt-body">
                <span class="bt-main">${main}</span>
                ${sub ? `<span class="bt-sub">${sub}</span>` : ''}
            </div>
        </div>`;
    const obj = new CSS2DObject(el);
    obj.position.set(screenX, y, BEAM_TAG_Z);
    obj.center.set(0, 0.5); // o ponto da haste fica exatamente na altura do feixe
    apparatus.add(obj);
    return obj;
}

function buildResultCardConfig() {
    const tex = (s) => renderTex(s, true);
    const inl = (s) => renderTex(s, false);
    const t = translations[currentLang] || translations.en;
    const base = {
        step: t.result_step,
        anchor: new THREE.Vector3(screenX, 1.0, -9.5),
        side: 'up', stemX: 68, index: 2,
        extraClass: 'is-result hidden-narrative',
        isResult: true
    };

    if (simMode === 'spin') {
        return {
            ...base,
            kicker: t.res_spin_kicker, title: t.res_spin_title,
            accent: '#38bdf8', accent2: '#ec4899',
            html: `
                <p>${t.res_spin_p1(inl('s = \\tfrac{1}{2}'), inl('2s+1 = 2'))}</p>
                <div class="nc-eq">
                    ${tex('S_z = m_s\\,\\hbar, \\qquad m_s = \\pm\\tfrac{1}{2}')}
                    ${tex('\\mu_z = -g_s\\,\\mu_B\\,m_s \\approx \\mp\\,\\mu_B \\quad (g_s \\approx 2{,}002)')}
                </div>
                <p>${t.res_spin_p2}</p>
                <p class="nc-punch">${t.res_spin_punch}</p>`
        };
    }

    if (simMode === 'orbital') {
        const l = currentL;
        const n = 2 * l + 1;
        const letter = ['s', 'p', 'd', 'f'][l];
        const detail = l === 0
            ? t.res_orbital_l0_detail(inl('l = 0'), inl('m_l = 0'))
            : t.res_orbital_multi_detail(letter, inl(`l = ${l}`), inl(`2l+1 = ${n}`), inl('m_l = 0'));
        const punch = l === 0 ? t.res_orbital_l0_punch : t.res_orbital_multi_punch;
        return {
            ...base,
            kicker: t.res_orbital_kicker(letter),
            title: l === 0 ? t.res_orbital_title_zero : t.res_orbital_title_multi(n),
            accent: '#a78bfa', accent2: '#6366f1',
            html: `
                <p>${t.res_orbital_intro}</p>
                <div class="nc-eq">
                    ${tex('L_z = m_l\\,\\hbar, \\qquad m_l = -l, \\dots, +l')}
                    ${tex('\\mu_z = -\\mu_B\\, m_l')}
                </div>
                ${detail}
                <p class="nc-punch">${punch}</p>`
        };
    }

    // Modo clássico
    return {
        ...base,
        kicker: t.res_classic_kicker, title: t.res_classic_title,
        accent: '#cbd5e1', accent2: '#64748b',
        html: `
            <p>${t.res_classic_p1(inl('\\theta'))}</p>
            <div class="nc-eq">${tex('F_z = |\\vec\\mu|\\cos\\theta\\,\\frac{\\partial B_z}{\\partial z}, \\qquad \\cos\\theta \\in [-1,\\,1]')}</div>
            <p>${t.res_classic_p2(inl('\\vec B'), inl('\\theta'))}</p>
            <p class="nc-punch">${t.res_classic_punch}</p>`
    };
}

function createDetectorLabels() {
    clearDetectorLabels();
    const t = translations[currentLang] || translations.en;

    if (simMode === 'spin') {
        activeDetectorLabels.push(
            createBeamTag({
                main: renderTex('m_s = +\\tfrac{1}{2}'),
                sub: t.beam_spin_up_sub(renderTex('S_z = +\\hbar/2')),
                color: '#38bdf8', y: 3.2, index: 0
            }),
            createBeamTag({
                main: renderTex('m_s = -\\tfrac{1}{2}'),
                sub: t.beam_spin_down_sub(renderTex('S_z = -\\hbar/2')),
                color: '#ec4899', y: -3.2, index: 1
            })
        );
    } else if (simMode === 'orbital') {
        if (currentL === 0) {
            activeDetectorLabels.push(createBeamTag({
                main: renderTex('m_l = 0'),
                sub: t.beam_orbital_no_deflection(renderTex('L_z = 0')),
                color: '#a78bfa', y: 0
            }));
        } else {
            // Espaçamento vertical dinâmico para garantir ótima legibilidade sem sobreposição
            // p (l=1): 3.2 por nível | d (l=2): 2.4 por nível | f (l=3): 2.2 por nível
            const stepSpacing = currentL === 1 ? 3.2 : (currentL === 2 ? 2.4 : 2.2);
            const compact = currentL >= 2;
            let index = 0;

            for (let m = currentL; m >= -currentL; m--) {
                const sign = m > 0 ? '+' : (m < 0 ? '-' : '');
                const abs = Math.abs(m);
                const lz = m === 0 ? '0' : `${sign}${abs === 1 ? '' : abs}\\hbar`;
                activeDetectorLabels.push(createBeamTag({
                    main: renderTex(`m_l = ${sign}${abs}`),
                    sub: compact ? '' : renderTex(`L_z = ${lz}`),
                    color: '#a78bfa', y: m * stepSpacing, compact, index: index++
                }));
            }
        }
    } else if (simMode === 'classic') {
        activeDetectorLabels.push(createBeamTag({
            main: t.beam_classic_main(renderTex('\\mu_z')),
            sub: renderTex('-|\\vec\\mu| \\le \\mu_z \\le +|\\vec\\mu|'),
            color: '#cbd5e1', y: 0
        }));
    }

    activeResultCard = createNarrativeCard(buildResultCardConfig(), apparatus);
}

function updateDetectorLabels(dt) {
    if (isMagnetOn) {
        if (isRunning) modeActiveTimer += dt;
    } else {
        modeActiveTimer = 0;
    }

    const ready = isMagnetOn && modeActiveTimer >= LABEL_DELAY_SECONDS;
    activeDetectorLabels.forEach(lbl => {
        if (lbl && lbl.element) lbl.element.classList.toggle('visible', ready);
    });

    // Sincroniza cards narrativos e card de Resultado com o estado atual
    updateNarrativeVisibility();
}

function resetSimulation() {
    clearCardFocus();
    clearImpacts();
    modeActiveTimer = 0;
    createDetectorLabels();
    particles.forEach(p => {
        p.active = false;
        p.mesh.visible = false;
    });
}

// Center view logic for initial presentation
function adjustCameraOffset() {
    const panelWidth = window.innerWidth > 768 ? 350 : 0;
    // Shift the target slightly to the right so it centers better with the UI panel
    const shift = panelWidth > 0 ? 5 : 0;
    controls.target.set(shift + 18, 0, 0);
}
adjustCameraOffset();

// Animation Loop
let lastTime = 0;
let lastFrameTimestamp = 0;

function animate(timestamp) {
    requestAnimationFrame(animate);

    const dt = lastFrameTimestamp ? Math.min((timestamp - lastFrameTimestamp) / 1000, 0.1) : 0;
    lastFrameTimestamp = timestamp;

    if (isCameraTransitioning) {
        updateCameraTransition(dt);
    } else {
        updateCameraNavigation(dt);
    }
    controls.update();

    if (isRunning) {
        if (timestamp - lastTime > 15) {
            for (let k = 0; k < 3; k++) {
                let inactive = particles.find(p => !p.active);
                if (inactive) {
                    inactive.reset();
                    inactive.mesh.visible = true;
                }
            }
            lastTime = timestamp;
        }

        particles.forEach(p => p.update());
    }

    updateDetectorLabels(dt);

    // Ajustar opacidade das labels baseado na distância da câmera (simulando Fog 3D)
    // Se algum card estiver em foco, mantemos opacidade máxima (1.0) para legibilidade cristalina
    const dist = camera.position.distanceTo(controls.target);
    const fogDensity = 0.0125;
    const fogFactor = Math.max(0, Math.exp(-Math.pow((Math.max(0, dist - 20)) * fogDensity, 2)));
    labelRenderer.domElement.style.opacity = focusedCard ? 1.0 : fogFactor;

    // Scale para os cards narrativos: tamanho cheio na visão inicial (~86 u), encolhem ao afastar
    // e se ajustam a telas mais baixas (notebooks/projetores)
    const viewportFactor = Math.min(1, window.innerHeight / 900);
    const scaleFactor = Math.max(0.6, Math.min(1, 1.0 - (dist - 90) / 150)) * viewportFactor;
    document.documentElement.style.setProperty('--narrative-scale', scaleFactor.toFixed(3));

    composer.render();
    labelRenderer.render(scene, camera);
}

// Internacionalização: Função para alternar o idioma
function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('sg_sim_lang', lang);

    // Atualiza estado dos botões de idioma
    if (btnLangEn) btnLangEn.classList.toggle('active', lang === 'en');
    if (btnLangPt) btnLangPt.classList.toggle('active', lang === 'pt');

    const t = translations[lang];

    // Atualiza metadados HTML
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    if (t.page_title) document.title = t.page_title;

    // Atualiza todos os elementos com data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) {
            el.innerHTML = t[key];
        }
    });

    // Atualiza elementos com data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (t[key] !== undefined) {
            el.setAttribute('title', t[key]);
        }
    });

    // Atualiza elementos com data-i18n-aria
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        if (t[key] !== undefined) {
            el.setAttribute('aria-label', t[key]);
        }
    });

    // Atualiza texto do botão Play/Pause respeitando o estado
    if (playPauseText) {
        playPauseText.textContent = isRunning ? t.btn_pause : t.btn_resume;
    }

    // Atualiza rótulos 3D do aparato
    updateApparatusLabels();

    // Reconstrói cards narrativos e etiquetas detectoras no novo idioma
    buildPresentationLabels(apparatus);
    createDetectorLabels();
    updateNarrativeVisibility();

    // Re-renderiza o LaTeX em toda a interface
    renderDocumentMath();
}

// Event Listeners dos Botões de Idioma
if (btnLangEn) {
    btnLangEn.addEventListener('click', () => setLanguage('en'));
}
if (btnLangPt) {
    btnLangPt.addEventListener('click', () => setLanguage('pt'));
}

// Navegação suave e destaque visual ao clicar em citações de referência (#ref-1, etc.)
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#ref-"]');
    if (!link) return;

    // Se o link pertencer a um card narrativo oculto, previne qualquer interação
    const cardAnchor = link.closest('.narrative-anchor');
    if (cardAnchor && cardAnchor.classList.contains('hidden-narrative')) {
        e.preventDefault();
        e.stopPropagation();
        return;
    }

    const targetId = link.getAttribute('href').slice(1);
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
        e.preventDefault();
        e.stopPropagation();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetEl.classList.remove('ref-highlight');
        void targetEl.offsetWidth; // força reflow para reiniciar animação
        targetEl.classList.add('ref-highlight');
        setTimeout(() => targetEl.classList.remove('ref-highlight'), 2500);
    }
});

// Inicializar idioma, visual dos ímãs, textos explicativos, etiquetas e loop
setLanguage(currentLang);
updateMagnetVisuals();
updateInfoText();
createDetectorLabels();
updateNarrativeVisibility();
resize();
animate(0);
