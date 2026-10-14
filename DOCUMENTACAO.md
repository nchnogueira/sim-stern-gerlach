# Documentação: Simulação do Experimento de Stern-Gerlach

---

## 👥 Autoria e Vinculação Institucional

- **Nícolas Chenquel Nogueira**
- **Analice Andretti Gomes**
- **Caroline Lima da Costa Silvestre**
- **Glendha Ribeiro Fonseca**

*Discentes do Programa de Pós-Graduação em Ciências Naturais (PPGCN)*  
*Universidade Estadual do Norte Fluminense Darcy Ribeiro (UENF) — Rio de Janeiro, Brasil*  
*Ano: 2026*

### 🎓 Apoio Institucional e Financiamento
O presente trabalho foi realizado com apoio da **Coordenação de Aperfeiçoamento de Pessoal de Nível Superior - Brasil (CAPES)** — Código de Financiamento 001.

### 🤖 Declaração de Uso de Inteligência Artificial e Responsabilidade
Esta simulação interativa e sua respectiva documentação foram desenvolvidas com o auxílio de ferramentas de inteligência artificial da **Google (Antigravity)**. 

Os autores declaram que todos os conceitos físicos, modelos matemáticos, formalismo de spin e quantização orbital, bem como a implementação computacional (Three.js/JavaScript/CSS) e estruturação do projeto, foram integralmente **revisados, validados e supervisionados**, assumindo total responsabilidade acadêmica e científica pelo material e conteúdo apresentado.

---

## Como Navegar pelo Projeto e por esta Documentação

**Instruções iniciais:**
- Este arquivo (`DOCUMENTACAO.md`) serve como um guia rápido e um bloco de notas técnico sobre a arquitetura e funcionamento da simulação. 
- Para rodar o projeto, basta executar o arquivo `run.bat` que está na raiz. Ele iniciará um servidor local em Python e abrirá o navegador na página correta (`http://localhost:8000`).
- Se você quiser modificar a lógica 3D ou o comportamento físico, o arquivo principal a ser editado é o `script.js`.
- Se o objetivo for alterar o visual da interface, acesse `style.css` e `index.html`.

---

## 1. Visão Geral do Projeto

Este projeto é uma simulação interativa 3D do clássico **Experimento de Stern-Gerlach**, construída para demonstrar a quantização do momento angular (spin). A aplicação foi desenvolvida utilizando **HTML5, CSS3 (Vanilla) e JavaScript com a biblioteca Three.js** para a renderização 3D.

### Tecnologias Utilizadas:
- **HTML/CSS:** Estruturação da interface sobreposta ao canvas 3D. Utiliza um design moderno com efeito "Glassmorphism" e design responsivo.
- **JavaScript (ES6 Modules):** Lógica da aplicação e manipulação da interface.
- **Three.js:** Biblioteca principal para renderizar os gráficos 3D. É carregada via `importmap` no HTML, sem necessidade de bundlers complexos como Webpack ou Vite.
- **Python (Servidor Local):** O script `run.bat` usa o módulo `http.server` do Python para contornar políticas de CORS do navegador ao carregar módulos ES6.

## 2. Estrutura de Arquivos

* `index.html`: Ponto de entrada do projeto. Contém a marcação da interface do usuário (painel de controle lateral) e o `<canvas>` onde a cena 3D é renderizada. Configura o importmap do Three.js.
* `style.css`: Arquivo de estilos contendo variáveis de cor, regras para a interface envidraçada, estilização dos controles (sliders, botões de alternância) e design responsivo.
* `script.js`: O coração da simulação. Configura o Three.js (Cena, Câmera, Renderizador), efeitos de pós-processamento (Bloom), construção do aparato experimental e sistema de partículas.
* `run.bat`: Um script batch para Windows que facilita o início do ambiente de desenvolvimento/visualização. Inicia o Python na porta 8000 e abre o navegador.

## 3. Análise Técnica do `script.js`

### 3.1. Configuração do Three.js
- **Cena e Câmera:** Configurações com perspectiva, neblina (`FogExp2`) e cor de fundo escura.
- **Renderização e Efeitos:** Usa o `WebGLRenderer` com sombras e mapeamento de tons. Inclui `CSS2DRenderer` para colocar labels de texto HTML no ambiente 3D. Também aplica o `UnrealBloomPass` para dar um efeito de brilho (neon) nas partículas quânticas e lasers/impactos.

### 3.2. O Aparato Experimental (Ambiente 3D)
O equipamento é construído usando geometrias básicas do Three.js:
- **Forno:** (`BoxGeometry`) - A origem dos átomos de prata.
- **Colimadores:** Barreiras para alinhar o feixe de partículas, criando um buraco estreito para passagem.
- **Ímãs:** Representam o campo magnético não uniforme. O pólo Norte possui uma ponta ("wedge") e o pólo Sul possui um sulco ("grooved"), modelados usando `ExtrudeGeometry` e `Shape`.
- **Tela Detectora:** (`PlaneGeometry`) - A tela ao final onde as colisões são registradas.

### 3.3. Sistema de Partículas (Átomos)
- A classe `Particle` gerencia cada átomo na simulação.
- **Física:** Cada partícula tem um componente `vx` (velocidade horizontal), e quando passa pelo campo magnético, uma força é aplicada no eixo `y`.
- **Diferença entre os 3 Modos de Simulação:**
  - **Modo Clássico:** O momento magnético é contínuo (`spinContinuous` de -1 a +1), resultando em um padrão de olho preenchido na tela (com partículas prateadas).
  - **Modo Quantização Orbital (Bohr-Sommerfeld):** O momento angular orbital $L$ assume valores inteiros $l \in \{0, 1, 2, 3\}$ ($s, p, d, f$). Cada orbital possui $2l+1$ orientações discretas ($m_l = -l, \dots, +l$), gerando um número ímpar de feixes ($s=1$, $p=3$, $d=5$, $f=7$) com feixe central neutro, mantendo as partículas na cor prateada.
  - **Modo Spin 1/2 (Stern-Gerlach Real):** O spin assume apenas valores discretos $m_s = \pm 1/2$ (`spinDiscrete`), resultando em exatamente 2 feixes separados (Spin Up ciano e Spin Down magenta), formando os arcos superior e inferior do "olho".

### 3.4. Etiquetas Dinâmicas de Identificação na Tela Detectora
- **Temporização e Transição:** Após ~4 segundos de simulação contínua com o ímã ativo, as etiquetas descritivas surgem suavemente ao lado da tela detectora através de uma animação CSS de opacidade e deslocamento.
- **Tipografia e Renderização em LaTeX (KaTeX):** Todas as legendas e notações físicas utilizam renderização matemática real via KaTeX, garantindo símbolos precisos ($\uparrow$, $\downarrow$, $m_s = \pm \frac{1}{2}$, $m_l = -l, \dots, +l$, $\mu$, etc.).
- **Posicionamento e Espaçamento Responsivo:** Os rótulos foram deslocados para a direita da tela ($Z = 12.0$), evitando qualquer sobreposição com o padrão de impactos. Para os orbitais $d$ ($5$ feixes) e $f$ ($7$ feixes), o espaçamento vertical entre os níveis é ajustado dinamicamente para manter 100% de legibilidade sem sobreposição entre as linhas.
- **Identificação por Modo:**
  - **Modo Spin:** Identifica o feixe superior como $\uparrow \text{Spin } +\frac{1}{2} \; (m_s = +\frac{1}{2})$ (ciano) e o feixe inferior como $\downarrow \text{Spin } -\frac{1}{2} \; (m_s = -\frac{1}{2})$ (magenta).
  - **Modo Orbital:** Identifica cada um dos $2l+1$ feixes discretos com seu respectivo número quântico magnético orbital $m_l$ (de $+l$ a $-l$, como $m_l = 0$ para $s$; $m_l = \pm 1, 0$ para $p$; $m_l = \pm 2, \pm 1, 0$ para $d$; e $m_l = \pm 3, \pm 2, \pm 1, 0$ para $f$).
  - **Modo Clássico:** Exibe etiqueta indicando a previsão clássica de **Distribuição Contínua** para qualquer orientação do momento magnético ($\mu$).
- **Reset e Desativação:** Ao reiniciar a simulação, desligar o ímã ou alternar de modo/orbital, as etiquetas são ocultadas instantaneamente e o contador de tempo é reiniciado.

## 4. Notas Físicas, Auditoria do Modelo e Referências Acadêmicas

### 4.1. Auditoria Conceitual Baseada em Mostafaeipour et al. (2025)
Com base no estudo de elementos finitos e Monte Carlo publicado em *Physica Scripta* (100, 045410, 2025):
- **Origem do Formato de Olho (Lábios):**  
  No simulador clássico/escolar, frequentemente atribui-se o formato de lábios unicamente à variação espacial do campo magnético. No entanto, o artigo de 2025 demonstra que a fenda colimadora $A_2$ pré-ímã já possuía geometria lenticular em formato de olho ($l = 0,8\text{ mm} \times w = 35\ \mu\text{m}$). Sem campo ($B = 0$), o padrão resultante já projeta essa fenda parabólica. Com $B \neq 0$, o gradiente não uniforme $\frac{\partial B_z}{\partial z}$ bifurca esse contorno inicial em dois arcos simétricos.
- **Distribuição Térmica de Velocidades de Maxwell-Boltzmann:**  
  O forno opera a $T \approx 1323\text{ K}$ ($~1000\text{ }^\circ\text{C}$). Os átomos ejetados possuem distribuição de velocidades onde o tempo de trânsito pelo ímã ($t = L/v_x$) faz com que partículas mais lentas sofram deflexão vertical sensivelmente maior do que partículas velozes. Essa dispersão longitudinal gera a espessura realista observada nas linhas prateadas da chapa original.

### 4.2. O Episódio Histórico do "Mau Charuto" (Friedrich & Herschbach, 2003)
Conforme documentado por Friedrich & Herschbach no artigo *Physics Today* (56, 53–59, 2003):
- A camada de prata atômica depositada sobre a chapa de vidro/metal era extremamente fina (ordem de uma única camada monoatômica, $\sim 10^{16}\text{ átomos/cm}^2$), tornando o padrão inicialmente **invisível a olho nu**.
- Otto Stern recebia baixos salários como professor assistente e fumava charutos baratos com elevado teor de enxofre. Ao examinar a placa de perto junto a Walther Gerlach, o sopro ou a fumaça sulfurosa reagiu com a prata:
  $$\mathrm{2\,Ag + S \longrightarrow Ag_2S} \quad (\text{sulfeto de prata, de coloração preta intensa})$$
- Essa reação química fortuita agiu como a revelação de um filme fotográfico, permitindo visualizar os dois traços nítidos que confirmaram a quantização espacial e mudaram o curso da física atômica.

### 4.3. Referências Bibliográficas
1. **Gerlach, W., & Stern, O. (1922).** *Der experimentelle Nachweis der Richtungsquantelung im Magnetfeld.* Zeitschrift für Physik, 9(1), 349–352.
2. **Gerlach, W., & Stern, O. (1922).** *Das magnetische Moment des Silberatoms.* Zeitschrift für Physik, 9(1), 353–355.
3. **Mostafaeipour, F., et al. (2025).** *Simulation of atom trajectories in the original Stern–Gerlach experiment.* Physica Scripta, 100(4), 045410. [DOI: 10.1088/1402-4896/adbf6c](https://doi.org/10.1088/1402-4896/adbf6c).
4. **Friedrich, B., & Herschbach, D. (2003).** *Stern and Gerlach: How a Bad Cigar Helped Reorient Atomic Physics.* Physics Today, 56(12), 53–59. [DOI: 10.1063/1.1650229](https://doi.org/10.1063/1.1650229).

## 5. Notas Futuras e Pontos de Manutenção

- **Performance e Impactos:** O número máximo de impactos na tela está configurado em 4000 (`maxImpacts = 4000`) com 240 partículas ativas para garantir alta densidade, feixes nítidos e maior duração do padrão desenhado.
- **Alteração de Parâmetros:** A velocidade base (`baseSpeed = 0.8`) é modulada termicamente por partícula, e a intensidade magnética (`magnetStrength = 0.5`) é controlada pelo slider. O estado do ímã (Ligado/Desligado) altera as cores dos polos e oculta as linhas de campo.
- **Estado Inicial da Aplicação:** A simulação abre por padrão no **Modo Clássico**, com o **Ímã Desligado** (polos em cinza fosco e sem linhas de campo magnético) e com a animação **Pausada** (botão exibindo "Continuar").
- **Câmera e Controles de Zoom:** O zoom nativo do `OrbitControls` utiliza lógica linear adaptativa e suave (`zoomCamera`), com limite mínimo de aproximação em `minDistance = 4` e limite máximo de `maxDistance = 200`, com suporte a teclado (`+`/`-`/`R`), botões HUD flutuantes e gestos touch.
- **Foco Interativo nos Cards 3D:** Todos os cards narrativos contam com transição amortecida (`easeInOutCubic`, ~850ms) ao clique, enquadrando o card e preservando a visualização dos componentes do aparato.
- **Atualização do Three.js:** O projeto utiliza a versão fixa `0.160.0` hospedada na Unpkg.

