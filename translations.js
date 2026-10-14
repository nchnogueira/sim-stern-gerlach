// Dicionário bilíngue de Internacionalização (Inglês e Português)
export const translations = {
    en: {
        // Metadados da página
        page_title: "Stern-Gerlach Simulator",

        // Cabeçalho e Introdução
        title: "Stern-Gerlach Simulator",
        desc1: `When Otto Stern and Walther Gerlach shot silver atoms through an inhomogeneous magnetic field<sup class="ref-cite"><a href="#ref-1">[1]</a></sup>, they aimed to test the limits of the classical atomic model, which predicted a continuous smear of impacts on the detector plate. The observed pattern — two sharply separated traces — proved that atoms did not obey classical mechanics, but rather the discrete principles of the quantum world. Modern numerical reconstructions<sup class="ref-cite"><a href="#ref-2">[2]</a></sup> have modeled the full trajectory and field dynamics with high precision.`,
        desc2: `Yet the experiment carries a historical irony: in 1922, not even the scientists themselves grasped what they had discovered. Stern and Gerlach interpreted the deflection as direct confirmation of "spatial quantization" of Bohr-Sommerfeld orbits, whereas the valence electron of silver has zero orbital angular momentum ($L = 0$). Lacking the conceptual vocabulary to name it, they had pioneered the demonstration of spin — the intrinsic angular momentum of matter —, a theoretical concept formulated only in 1925 by Uhlenbeck and Goudsmit.`,

        // Controles de Simulação
        sim_mode: "Simulation Mode",
        mode_classic: "Classic",
        mode_orbital: "Orbital",
        mode_spin: "Spin",

        orbital_quantum: "Quantum Orbital (Momentum L)",

        magnet_state: "Magnet State",
        state_on: "On",
        state_off: "Off",
        magnet_strength: "Magnet Intensity",

        sim_controls: "Simulation Control",
        btn_resume: "Resume",
        btn_pause: "Pause",
        btn_reset: "Reset",

        explanatory_notes: "Explanatory Notes",
        notes_show: "Show",
        notes_hide: "Hide",

        // Autoria e Créditos
        authorship: "Authorship",
        affiliation: "Graduate Students in Natural Sciences at UENF, Rio de Janeiro, Brazil",
        references_title: "References",
        ref1_title: "Experimental proof of directional quantization in a magnetic field",
        ai_badge: "AI Usage Notice",
        ai_disclaimer: "This simulation was developed with the assistance of Google artificial intelligence tools (Antigravity). The authors affirm that all physical content, mathematical formalism, and computational code were comprehensively reviewed and validated, assuming full responsibility for the project.",

        // Controles de Câmera e Viewport
        aria_viewport_controls: "Camera and Zoom Controls",
        zoom_in: "Zoom In (+)",
        zoom_out: "Zoom Out (-)",
        reset_view: "Reset Camera View (R)",
        nav_help: "Navigation Guide (Keyboard & Camera)",
        nav_title: "3D Navigation",
        close_guide: "Close guide",
        nav_move: "Move camera",
        nav_rotate: "Rotate view",
        nav_elevate: "Descend / Ascend",
        nav_zoom: "Linear zoom",
        nav_reset: "Reset view",
        card_click_to_focus: "Click card to focus camera",
        card_click_to_reset: "Click card to restore view",

        // Rótulos 3D do Aparato
        apparatus_oven: "Oven with Ag atoms",
        apparatus_collimators: "Collimators",
        apparatus_magnets: "Magnets",
        apparatus_screen: "Detector Screen",

        // Rótulos dos Feixes (Detector Screen)
        beam_spin_up_sub: (Sz) => `spin ↑ · ${Sz}`,
        beam_spin_down_sub: (Sz) => `spin ↓ · ${Sz}`,
        beam_orbital_no_deflection: (Lz) => `${Lz} · no deflection`,
        beam_classic_main: (muz) => `${muz} continuous`,

        // Cards Narrativos (Capítulos 01 a 04)
        ch01_kicker: "The source",
        ch01_title: "A silver jet",
        ch01_p1: `In the oven, at ~1000 °C (1323 K), silver vaporizes and effuses through a pinhole as a beam of <b>neutral atoms</b><sup class="ref-cite"><a href="#ref-2">[2]</a></sup> governed by a Maxwellian velocity distribution.`,
        ch01_p2: "Of its 47 electrons, 46 fill closed shells and cancel out. The entire magnetism of the atom rests on <b>a single electron</b>, in the 5s orbital:",
        ch01_punch: "If only orbital angular momentum existed, this atom would be magnetically silent.",

        ch02_kicker: "The beam",
        ch02_title: "Apertures & Collimation",
        ch02_p1: `A circular aperture ($A_1$) and an eye-shaped slit ($A_2$, $0.8\\text{ mm} \\times 35\\;\\mu\\text{m}$)<sup class="ref-cite"><a href="#ref-2">[2]</a></sup> collimate the beam. Without magnetic field ($B = 0$), the deposited pattern is the direct geometric projection of $A_2$.`,
        ch02_punch: "This aperture geometry sets the characteristic eye/lip baseline shape of the beam.",

        ch03_kicker: "The test",
        ch03_title: "A pushing field",
        ch03_p1: `The knife-edge pole (N) and grooved trench (S) produce strong transverse field lines: the field is <b>inhomogeneous</b><sup class="ref-cite"><a href="#ref-1">[1]</a></sup>,<sup class="ref-cite"><a href="#ref-2">[2]</a></sup>.`,
        ch03_p2: "A uniform field would merely cause the atomic magnetic dipole to precess without deflecting it. What exerts a net force is the <b>gradient</b>:",
        ch03_punch: "The spatial orientation of each atom is translated into a vertical position on the screen.",

        ch04_kicker: "The verdict",
        ch04_title: "Neither continuous nor one: two",
        ch04_p1: "Each atom marks a dot on the plate. Three theoretical predictions:",
        ch04_classical_name: "Classical",
        ch04_classical_desc: (muz) => `continuous smear — ${muz} takes any value`,
        ch04_orbital_name: (l0) => `Orbital (${l0})`,
        ch04_orbital_desc: "a single central dot, no deflection",
        ch04_observed_name: "Observed",
        ch04_observed_desc: "two symmetric lines, empty center",
        ch04_punch: `Frankfurt, 1922<sup class="ref-cite"><a href="#ref-1">[1]</a></sup>. Nature answered "two" — revealed when sulfurous cigar smoke reacted with the invisible silver traces to form black silver sulfide<sup class="ref-cite"><a href="#ref-3">[3]</a></sup>.`,

        // Card de Resultado
        result_step: "Result",
        res_spin_kicker: "Spin ½",
        res_spin_title: "Two beams, empty center",
        res_spin_p1: (s, n) => `The 5s electron carries an <b>intrinsic</b> angular momentum, spin, with ${s}. Its projection allows only ${n} values:`,
        res_spin_p2: `Atoms enter with random orientations, but measurement yields only two outcomes: <b>half deflect upward, half downward</b>. The lip-shaped splitting stems from the $A_2$ slit geometry convolved with thermal velocities<sup class="ref-cite"><a href="#ref-2">[2]</a></sup>.`,
        res_spin_punch: "Spin is not a tiny spinning sphere: it is a quantum property with no classical counterpart.",

        res_orbital_kicker: (letter) => `Orbital quantization · ${letter}`,
        res_orbital_title_zero: "A single beam, no deflection",
        res_orbital_title_multi: (n) => `${n} beams, one in the center`,
        res_orbital_intro: "If only <b>orbital</b> angular momentum mattered, its projection along the field axis would be quantized:",
        res_orbital_l0_detail: (l0, ml0) => `<p>In the s orbital (${l0}), only ${ml0} exists: zero magnetic dipole, and the atom travels <b>in a straight line</b>.</p>`,
        res_orbital_multi_detail: (letter, lVal, nVal, ml) => `<p>In the ${letter} orbital (${lVal}), there are <b>${nVal}</b> equally spaced values of ${ml} — and the ${ml} beam passes undeflected.</p>`,
        res_orbital_l0_punch: "This is the prediction for ground-state silver (5s¹). The experiment revealed two beams.",
        res_orbital_multi_punch: "Always an odd number of beams. Silver revealed an even number: two.",

        res_classic_kicker: "Classical model",
        res_classic_title: "A continuous smear",
        res_classic_p1: (theta) => `A classical magnetic dipole can point in any direction. In hot oven vapor, orientations are <b>isotropic</b>, and force depends on angle ${theta} with the field:`,
        res_classic_p2: (vecB, theta) => `Precession around ${vecB} conserves ${theta}: each atom experiences a constant deflection — and every angle is allowed. Impacts form a continuous band <b>without gaps</b>, tapering at edges where gradient weakens.`,
        res_classic_punch: "No value is forbidden. In 1922, the detector plate disagreed."
    },

    pt: {
        // Metadados da página
        page_title: "Simulador de Stern-Gerlach",

        // Cabeçalho e Introdução
        title: "Simulador de Stern-Gerlach",
        desc1: `Quando Otto Stern e Walther Gerlach dispararam átomos de prata através de um campo magnético não uniforme<sup class="ref-cite"><a href="#ref-1">[1]</a></sup>, esperavam testar os limites do modelo atômico clássico, que previa uma mancha contínua de impactos na placa detectora. O padrão observado — dois traços nitidamente separados — provou que os átomos obedeciam aos princípios discretos do mundo quântico. Reconstruções numéricas modernas<sup class="ref-cite"><a href="#ref-2">[2]</a></sup> modelam com precisão de elementos finitos a trajetória atômica e a geometria do campo.`,
        desc2: `No entanto, o experimento guarda uma ironia histórica: em 1922, nem os próprios cientistas dimensionaram o que haviam descoberto. Stern e Gerlach interpretaram o desvio como confirmação da "quantização espacial" das órbitas no modelo atômico de Bohr-Sommerfeld, quando, na verdade, o elétron de valência da prata possui momento angular orbital nulo ($L = 0$). Sem dispor de vocabulário para nomeá-lo, haviam demonstrado pioneiramente os efeitos do spin — o momento angular intrínseco da matéria —, formulado teoricamente em 1925 por Uhlenbeck e Goudsmit.`,

        // Controles de Simulação
        sim_mode: "Modo de Simulação",
        mode_classic: "Clássico",
        mode_orbital: "Orbital",
        mode_spin: "Spin",

        orbital_quantum: "Orbital Quântico (Momento L)",

        magnet_state: "Estado do Ímã",
        state_on: "Ligado",
        state_off: "Desligado",
        magnet_strength: "Intensidade do Imã",

        sim_controls: "Controle da Simulação",
        btn_resume: "Continuar",
        btn_pause: "Pausar",
        btn_reset: "Reiniciar",

        explanatory_notes: "Notas Explicativas",
        notes_show: "Exibir",
        notes_hide: "Ocultar",

        // Autoria e Créditos
        authorship: "Autoria",
        affiliation: "Discentes do Programa de Pós-Graduação em Ciências Naturais da UENF, Rio de Janeiro, Brasil",
        references_title: "Referências",
        ref1_title: "Comprovação experimental da quantização espacial em campo magnético",
        ai_badge: "Nota de Uso de IA",
        ai_disclaimer: "Esta simulação foi desenvolvida com auxílio de ferramentas de inteligência artificial da Google (Antigravity). Os autores afirmam que todo o conteúdo físico, formalismo matemático e código computacional foram integralmente revisados e validados, assumindo responsabilidade pelo projeto.",

        // Controles de Câmera e Viewport
        aria_viewport_controls: "Controles de Câmera e Zoom",
        zoom_in: "Aproximar Zoom (+)",
        zoom_out: "Afastar Zoom (-)",
        reset_view: "Redefinir Visão da Câmera (R)",
        nav_help: "Guia de Navegação (Teclado e Câmera)",
        nav_title: "Navegação 3D",
        close_guide: "Fechar guia",
        nav_move: "Mover câmera",
        nav_rotate: "Girar visão",
        nav_elevate: "Descer / Subir",
        nav_zoom: "Zoom linear",
        nav_reset: "Redefinir visão",
        card_click_to_focus: "Clique no card para focar a câmera",
        card_click_to_reset: "Clique no card para restaurar a visão",

        // Rótulos 3D do Aparato
        apparatus_oven: "Forno com átomos de Ag",
        apparatus_collimators: "Colimadores",
        apparatus_magnets: "Ímãs",
        apparatus_screen: "Tela Detectora",

        // Rótulos dos Feixes (Detector Screen)
        beam_spin_up_sub: (Sz) => `spin ↑ · ${Sz}`,
        beam_spin_down_sub: (Sz) => `spin ↓ · ${Sz}`,
        beam_orbital_no_deflection: (Lz) => `${Lz} · sem desvio`,
        beam_classic_main: (muz) => `${muz} contínuo`,

        // Cards Narrativos (Capítulos 01 a 04)
        ch01_kicker: "A fonte",
        ch01_title: "Um jato de prata",
        ch01_p1: `No forno, a ~1000 °C (1323 K), a prata evapora e escapa por um orifício como um jato de <b>átomos neutros</b><sup class="ref-cite"><a href="#ref-2">[2]</a></sup> regido pela distribuição de velocidades térmicas.`,
        ch01_p2: "Dos seus 47 elétrons, 46 fecham camadas e se cancelam. Todo o magnetismo do átomo fica nas mãos de <b>um único elétron</b>, no orbital 5s:",
        ch01_punch: "Se só existisse o momento orbital, este átomo seria magneticamente mudo.",

        ch02_kicker: "O feixe",
        ch02_title: "Fendas e Colimação",
        ch02_p1: `Um orifício circular ($A_1$) e uma fenda em forma de olho ($A_2$, $0,8\\text{ mm} \\times 35\\;\\mu\\text{m}$)<sup class="ref-cite"><a href="#ref-2">[2]</a></sup> colimam o feixe. Sem campo magnético ($B = 0$), o padrão depositado projeta a silhueta geométrica exata de $A_2$.`,
        ch02_punch: "A geometria dessa fenda é a base física que dá a silhueta em lábio/olho ao feixe.",

        ch03_kicker: "O teste",
        ch03_title: "Um campo que empurra",
        ch03_p1: `O polo em cunha afiada (N) e o polo inferior em sulco (S) concentram linhas de campo: a região é <b>não uniforme</b><sup class="ref-cite"><a href="#ref-1">[1]</a></sup>,<sup class="ref-cite"><a href="#ref-2">[2]</a></sup>.`,
        ch03_p2: "Um campo uniforme só faria o ímã atômico precessar, sem desviá-lo. Quem empurra é o <b>gradiente</b>:",
        ch03_punch: "A orientação de cada átomo se converte em posição na tela.",

        ch04_kicker: "O veredito",
        ch04_title: "Nem contínuo, nem um: dois",
        ch04_p1: "Cada átomo deixa um ponto na placa. Três teorias, três apostas:",
        ch04_classical_name: "Clássica",
        ch04_classical_desc: (muz) => `faixa contínua — ${muz} assume qualquer valor`,
        ch04_orbital_name: (l0) => `Orbital (${l0})`,
        ch04_orbital_desc: "um único ponto central, sem desvio",
        ch04_observed_name: "Observado",
        ch04_observed_desc: "duas manchas simétricas, nada no meio",
        ch04_punch: `Frankfurt, 1922<sup class="ref-cite"><a href="#ref-1">[1]</a></sup>. A natureza respondeu "dois" — revelados quando a fumaça de um charuto barato rico em enxofre converteu os traços invisíveis de prata em sulfeto de prata preto<sup class="ref-cite"><a href="#ref-3">[3]</a></sup>.`,

        // Card de Resultado
        result_step: "Resultado",
        res_spin_kicker: "Spin ½",
        res_spin_title: "Dois feixes, nada no meio",
        res_spin_p1: (s, n) => `O elétron 5s carrega um momento angular <b>intrínseco</b>, o spin, com ${s}. Sua projeção admite só ${n} valores:`,
        res_spin_p2: `Os átomos chegam com orientações aleatórias, mas a medida só encontra dois resultados: <b>metade sobe, metade desce</b>. O padrão em lábios resulta da abertura $A_2$ convolvida com as velocidades térmicas<sup class="ref-cite"><a href="#ref-2">[2]</a></sup>.`,
        res_spin_punch: "O spin não é uma esfera girando: é uma propriedade quântica sem análogo clássico.",

        res_orbital_kicker: (letter) => `Quantização orbital · ${letter}`,
        res_orbital_title_zero: "Um único feixe, sem desvio",
        res_orbital_title_multi: (n) => `${n} feixes, um no centro`,
        res_orbital_intro: "Se apenas o momento angular <b>orbital</b> contasse, sua projeção no eixo do campo seria quantizada:",
        res_orbital_l0_detail: (l0, ml0) => `<p>No orbital s (${l0}) só existe ${ml0}: não há momento magnético, e o átomo atravessa o ímã <b>em linha reta</b>.</p>`,
        res_orbital_multi_detail: (letter, lVal, nVal, ml) => `<p>No orbital ${letter} (${lVal}) há <b>${nVal}</b> valores de ${ml}, igualmente espaçados — e o feixe ${ml} passa sem desvio.</p>`,
        res_orbital_l0_punch: "É a previsão para a prata no estado fundamental (5s¹). A placa mostrou dois feixes.",
        res_orbital_multi_punch: "Sempre um número ímpar de feixes. A prata mostrou um número par: dois.",

        res_classic_kicker: "Modelo clássico",
        res_classic_title: "Uma faixa contínua",
        res_classic_p1: (theta) => `Um ímã clássico pode apontar em qualquer direção. No vapor quente do forno, as orientações são <b>isotrópicas</b>, e a força depende do ângulo ${theta} com o campo:`,
        res_classic_p2: (vecB, theta) => `A precessão em torno de ${vecB} conserva ${theta}: cada átomo sofre uma deflexão fixa — e todas são possíveis. Os impactos preenchem a faixa <b>sem lacunas</b>; as bordas afinam onde o gradiente enfraquece.`,
        res_classic_punch: "Nenhum valor é proibido. Em 1922, a placa discordou."
    }
};
