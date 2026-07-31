# MindFlow 🧘⚡

O **MindFlow** é um web-app mobile-first focado no registro diário de pensamentos, controle de hábitos e insights comportamentais. Com um sistema de design premium baseado em *Glassmorphism* e uma paleta de cores pasteis em tons de **Ameixa (Plum)** e **Menta (Mint)**, ele oferece uma experiência visual limpa, fluida e relaxante.

O aplicativo é 100% responsivo para dispositivos móveis, podendo ser instalado diretamente na tela inicial do celular como um aplicativo de sistema (PWA).

---

## 🌟 Principais Funcionalidades

1. **Diário de Pensamentos Granular**:
   * Registro diário de pensamentos e reflexões livres com suporte a `#tags`.
   * **Controle de Humor Multidimensional**: Em vez de selecionar apenas uma emoção, avalie a intensidade de 6 emoções fundamentais (Feliz, Calmo, Produtivo, Ansioso, Cansado, Triste) em uma escala de 0 a 10 usando controles deslizantes (sliders).
2. **Rastreador de Hábitos (Habit Tracker)**:
   * Cadastro de hábitos personalizados com cores e ícones dedicados.
   * Calendário horizontal de progresso rápido para marcar a conclusão.
   * Cálculo de sequências ativa (*streak* de dias seguidos).
3. **Métricas & Insights**:
   * Gráfico visual de flutuação semanal de humor predominante.
   * Análise estatística de correlação automática indicando qual hábito mais melhora o seu estado emocional.
4. **Painel de Controle Minimalista**:
   * Tela inicial limpa com data formatada e acesso rápido por abas.
   * Resumo de consistência dos últimos 10 dias (taxa de conclusão, humor mais frequente, notas salvas e maior streak).
5. **Persistência de Dados**:
   * Todos os dados são salvos local e com segurança no `LocalStorage` do próprio aparelho, sem necessidade de logins complexos ou servidores externos de banco de dados.

---

## 🛠️ Tecnologias Utilizadas

* **Framework**: [Vue 3](https://vuejs.org/) (Composition API)
* **Gerenciador de Build**: [Vite](https://vite.dev/)
* **Biblioteca de Ícones**: [Lucide Vue Next](https://lucide.dev/)
* **Estilização**: Vanilla CSS com variáveis dinâmicas e design system com efeito de vidro (*glassmorphism*).
* **Deploy**: [Vercel](https://vercel.com/)

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* Ter o [Node.js](https://nodejs.org/) instalado em sua máquina.

### Instalação
1. Clone o seu repositório Git:
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO>
   cd journaling
   ```
2. Instale as dependências do projeto:
   ```bash
   npm install
   ```

### Executando em Desenvolvimento
1. Inicie o servidor local:
   ```bash
   npm run dev
   ```
2. Abra no seu navegador o endereço indicado (geralmente `http://localhost:5173/`).

### Testando no Celular (Rede Local)
Para abrir o aplicativo no seu telefone físico pela rede Wi-Fi da sua casa:
```bash
npm run dev -- --host
```
Depois, acesse no navegador do celular a URL listada em `Network` (ex: `http://192.168.1.XX:5173`).

---

## 📦 Compilação e Deploy (Produção)

### Build
Para gerar a pasta estática otimizada de produção (`dist/`):
```bash
npm run build
```

### Publicar na Vercel
Para atualizar a versão de produção na nuvem diretamente pelo terminal:
```bash
npx vercel --prod
```
