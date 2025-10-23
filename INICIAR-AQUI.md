# 🚀 Guia Rápido - Executar Aplicação Angular REGINA

## Pré-requisitos
- Node.js 18+ instalado
- npm (vem com Node.js)

## Passos para rodar

### 1️⃣ Copiar os assets
```powershell
.\copiar-assets.ps1
```

### 2️⃣ Instalar dependências
```powershell
npm install
```

### 3️⃣ Iniciar aplicação
```powershell
npm start
```

A aplicação abrirá automaticamente em http://localhost:4200

## 📱 Rotas disponíveis

- **/** ou **/comparativo** - Página de Análise Comparativa (Angular)
- **/page/index** - Páginas legadas (via LegacyPageComponent)

## ✨ O que foi transformado

### Componente Comparativo (Angular nativo)
✅ **comparativo.html** → **ComparativoComponent**
- Template Angular com data binding
- Lógica TypeScript
- Chart.js integrado via npm
- Serviço de dados com HttpClient
- Modelos TypeScript tipados
- Gerenciamento de lifecycle

### Arquitetura
- ✅ Serviço `EscolaService` - Carrega e gerencia dados
- ✅ Models TypeScript - Interfaces tipadas
- ✅ Componentes modulares
- ✅ Routing configurado
- ✅ Build otimizado

## 🎯 Próximos componentes a migrar

Para converter outras páginas (index.html, visao-geral.html, etc.), use o ComparativoComponent como referência:

1. Criar componente: `ng generate component nome-componente`
2. Criar template HTML Angular (sem scripts inline)
3. Implementar lógica no TypeScript
4. Adicionar rota no `app-routing.module.ts`
5. Importar no `app.module.ts`

## 🐛 Problemas comuns

### Erro: comando 'ng' não encontrado
```powershell
npx ng serve
```

### JSON não carrega
Verifique se existe: `src/assets/static/dados_escolas.json`

### Gráficos não aparecem
- Abra o console do navegador (F12)
- Verifique se há erros de carregamento
- Confirme que os dados foram carregados

## 📚 Documentação completa
Veja `README-Angular.md` para detalhes técnicos completos.
