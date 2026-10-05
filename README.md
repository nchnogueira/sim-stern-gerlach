# Simulador 3D do Experimento de Stern-Gerlach

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Three.js](https://img.shields.io/badge/Three.js-r160-black?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![KaTeX](https://img.shields.io/badge/KaTeX-LaTeX_Math-green?style=flat-square)](https://katex.org/)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)

Aplicação web interativa em **Three.js** que recria o histórico **Experimento de Stern-Gerlach (1922)** em um ambiente 3D imersivo. O simulador permite comparar a previsão clássica contínua, a interpretação histórica da quantização orbital de Bohr-Sommerfeld e a manifestação real do momento angular intrínseco (spin 1/2) do elétron.

---

## 📌 Sumário

1. [Visão Geral e Contexto Físico](#-visão-geral-e-contexto-físico)
2. [Modos de Simulação](#-modos-de-simulação)
3. [Recursos e Destaques Visuais](#-recursos-e-destaques-visuais)
4. [Aparato Experimental 3D](#-aparato-experimental-3d)
5. [Controles de Câmera e Atalhos](#-controles-de-câmera-e-atalhos)
6. [Estrutura do Repositório](#-estrutura-do-repositório)
7. [Como Executar](#-como-executar)
8. [Autoria e Declaração Acadêmica](#-autoria-e-declaração-acadêmica)

---

## 🔬 Visão Geral e Contexto Físico

Em 1922, **Otto Stern** e **Walther Gerlach** dispararam um feixe de átomos de prata através de um campo magnético fortemente não uniforme ($\nabla B$). 

* **Previsão Clássica:** O momento magnético atômico $\vec{\mu}$ poderia apontar em qualquer direção contínua no espaço. A força $\vec{F} = \nabla(\vec{\mu} \cdot \vec{B})$ deveria dispersar os átomos continuamente, formando uma mancha alongada ininterrupta na placa detectora.
* **Resultado Real:** O feixe se dividiu em **duas linhas discretas**, sem impactos na região central.
* **A Ironia Histórica:** Stern e Gerlach acreditaram ter confirmado a "quantização espacial" das órbitas da teoria atômica de Bohr-Sommerfeld. Entretanto, os átomos de prata possuem 46 elétrons emparelhados e apenas 1 elétron de valência no orbital $5s$ com momento angular orbital nulo ($L = 0$). O desvio observado decorria exclusivamente do **spin eletrônico** ($S = 1/2$), propriedade quântica fundamental proposta por Samuel Goudsmit e George Uhlenbeck apenas em 1925.

---

## 🎛️ Modos de Simulação

O simulador oferece 3 modos fundamentais para fins didáticos e demonstrativos:

| Modo | Comportamento Físico | Feixes Observados | Cores dos Feixes |
| :--- | :--- | :---: | :---: |
| **Clássico** | Momento dipolar magnético contínuo $\mu_z \in [-1, +1]$. | Mancha contínua ("olho" preenchido) | Prateado |
| **Orbital (Bohr-Sommerfeld)** | Momento angular orbital discreto com $l \in \{0, 1, 2, 3\}$ ($s, p, d, f$). Cada nível gera $2l+1$ projeções $m_l \in \{-l, \dots, +l\}$. | $s$: 1 feixe<br>$p$: 3 feixes<br>$d$: 5 feixes<br>$f$: 7 feixes | Prateado (com feixe central neutro $m_l = 0$) |
| **Spin (Stern-Gerlach Real)** | Momento angular intrínseco quantizado com $s = 1/2$, projeções discretas $m_s = \pm 1/2$. | Exatamente 2 feixes | $\uparrow$ Ciano ($+1/2$)<br>$\downarrow$ Magenta ($-1/2$) |

---

## ✨ Recursos e Destaques Visuais

* **Pós-Processamento com UnrealBloomPass:** Partículas quânticas, lasers e impactos emitem brilho em neon customizado.
* **Dinâmica de Feixe Parabólica (Formato em "Lábios"):** O gradiente do campo magnético não uniforme varia ao longo da largura da fenda, reproduzindo a geometria curva observada nos artigos originais de Stern e Gerlach.
* **Sistema de Impactos Persistentes:** Placa detectora que registra até 4.000 pontos com acúmulo gradual e taxa de decaimento para visualização límpida dos feixes.
* **Etiquetas Flutuantes com KaTeX:** Rótulos integrados em 3D via `CSS2DRenderer` com fórmulas em LaTeX renderizadas dinamicamente após 4 segundos de detecção contínua.
* **Interface Glassmorphism:** Painel translúcido estilizado com efeito de desfoque (*backdrop-filter*), sliders de precisão e seletores responsivos.
* **Estado Inicial Controlado:** A aplicação carrega no Modo Clássico, com ímã desligado e simulação pausada para apresentação didática passo a passo.

---

## 🏛️ Aparato Experimental 3D

1. **Forno de Emissão:** Câmara cúbica com forno emissor que aquece a prata e dispara átomos térmicos.
2. **Colimadores Duplos:** Placas com fendas micrimétricas que colimam e alinham o feixe atômico.
3. **Pólos Magnéticos Não Uniformes:**
   * **Pólo Norte (Superior):** Geometria afiada em cunha (*knife-edge/wedge*), concentrando as linhas de campo.
   * **Pólo Sul (Inferior):** Geometria com calha/sulco côncavo (*grooved*), estabelecendo alto gradiente $\partial B_y / \partial y$.
   * **Visualização de Campo:** Linhas de fluxo magnético que acendem dinamicamente ao ligar o ímã.
4. **Placa Detectora:** Alvo receptor que acumula os impactos atômicos ao longo do tempo.

---

## 🎮 Controles de Câmera e Atalhos

A cena 3D conta com navegação fluida, zoom adaptativo linear e botões de atalho no canto superior esquerdo:

### Mouse e Touch
* **Girar Visão:** Botão esquerdo do mouse + arrastar.
* **Transladar (Pan):** Botão direito do mouse + arrastar.
* **Zoom Adaptativo:** Roda do mouse (*scroll*) ou gesto de pinça (*pinch-to-zoom*) em telas sensíveis ao toque. O zoom possui ajuste milimétrico quando próximo e amplo quando distante (`minDistance = 4`, `maxDistance = 200`).

### Teclado
| Tecla | Função |
| :---: | :--- |
| <kbd>W</kbd> / <kbd>S</kbd> | Mover câmera para frente / para trás |
| <kbd>A</kbd> / <kbd>D</kbd> | Mover câmera para esquerda / para direita |
| <kbd>Q</kbd> / <kbd>E</kbd> | Descer / Subir altura da câmera |
| <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> | Rotacionar ângulo de visão da cena |
| <kbd>+</kbd> ou <kbd>=</kbd> | Aproximar zoom linear |
| <kbd>-</kbd> ou <kbd>_</kbd> | Afastar zoom linear |
| <kbd>R</kbd> | Redefinir câmera para a perspectiva inicial |

---

## 📁 Estrutura do Repositório

```plaintext
SimulacaoSternGerlach/
│
├── index.html          # Estrutura da página, marcação do painel e importmaps
├── style.css           # Estilos em CSS3 puro (Glassmorphism, responsividade, HUD)
├── script.js           # Lógica principal, cena Three.js, partículas e KaTeX
├── run.bat             # Script para inicialização local no Windows
├── DOCUMENTACAO.md     # Documentação técnica e notas de desenvolvimento
└── README.md           # Apresentação do projeto e instruções de uso
```

---

## 🚀 Como Executar

Por utilizar **ES6 Modules** e **Three.js via importmap**, a aplicação deve ser servida através de um servidor HTTP local (para evitar restrições de CORS ao carregar arquivos locais via protocolo `file:///`).

### Opção 1: Inicialização Rápida no Windows (Recomendado)
Dê um duplo clique no arquivo:
```cmd
run.bat
```
O script iniciará automaticamente o servidor embutido do Python e abrirá a aplicação em seu navegador em `http://localhost:8080`.

### Opção 2: Linha de Comando (Qualquer Sistema Operacional)

Caso prefira utilizar o terminal:

1. **Python 3:**
   ```bash
   python -m http.server 8080
   ```
2. **Node.js (npx serve / http-server):**
   ```bash
   npx serve .
   ```
3. Abra o navegador e acesse:
   ```text
   http://localhost:8080
   ```

---

## 👥 Autoria e Declaração Acadêmica

* **Nícolas Chenquel Nogueira**
* **Analice Andretti Gomes**
* **Caroline Lima da Costa Silvestre**
* **Glendha Ribeiro Fonseca**

*Discentes do Programa de Pós-Graduação em Ciências Naturais (PPGCN)*  
**Universidade Estadual do Norte Fluminense Darcy Ribeiro (UENF) — Rio de Janeiro, Brasil**  
*Ano: 2026*

### 🎓 Apoio Institucional e Financiamento
O presente trabalho foi realizado com apoio da **Coordenação de Aperfeiçoamento de Pessoal de Nível Superior - Brasil (CAPES)** — Código de Financiamento 001.

### 🤖 Declaração de Uso de Inteligência Artificial e Responsabilidade
Esta simulação interativa e seus materiais textuais foram desenvolvidos com o auxílio de ferramentas de inteligência artificial da **Google (Antigravity)**. 

Os autores declaram que todos os conceitos físicos, modelos matemáticos, formalismo de spin e quantização orbital, bem como a implementação computacional (Three.js/JavaScript/CSS) e estruturação do projeto, foram integralmente **revisados, validados e supervisionados**, assumindo total responsabilidade acadêmica e científica pelo material apresentado.