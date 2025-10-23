# Regina - Aplicação Angular

Este projeto transforma o sistema REGINA em uma aplicação Angular moderna com componentes reutilizáveis, serviços e tipagem TypeScript.

## 🎯 O que foi implementado

### Arquitetura Angular
- **Scaffold completo** - package.json, angular.json, tsconfig.json, estrutura src/
- **Serviço de dados** (`escola.service.ts`) - Carrega dados do JSON e fornece métodos para consultas
- **Modelos TypeScript** (`escola.model.ts`) - Interfaces tipadas para Escola, ResumoRede, etc.
- **Componente Comparativo** - Transformação completa da página `comparativo.html` em componente Angular com:
  - Template Angular (sem innerHTML)
  - Lógica TypeScript (substituindo JavaScript legado)
  - Integração com Chart.js via npm
  - Estilos componentizados
  - Gerenciamento de lifecycle hooks

### Componentes criados
1. **ComparativoComponent** - Análise comparativa PEI vs Regular (totalmente refatorado)
2. **LegacyPageComponent** - Para carregar páginas HTML legadas temporariamente

## 🚀 Como usar

### 1. Instale as dependências

```powershell
cd "c:\Users\davi.silva\Downloads\Analise-REGINA-main"
npm install
```

### 2. Copie os assets

Execute o script PowerShell para copiar o arquivo JSON:

```powershell
.\copiar-assets.ps1
```

Ou manualmente:

```powershell
# Criar pastas
md src\assets\static

# Copiar dados
Copy-Item "Analise-REGINA-main\dados_escolas.json" "src\assets\static\dados_escolas.json"
```

### 3. Rodar a aplicação

```powershell
npm start
```

A aplicação será aberta automaticamente em `http://localhost:4200`

## 📂 Estrutura do projeto

```
src/
├── app/
│   ├── models/
│   │   └── escola.model.ts          # Interfaces TypeScript
│   ├── services/
│   │   └── escola.service.ts        # Serviço de dados
│   ├── comparativo/
│   │   ├── comparativo.component.ts      # Lógica do componente
│   │   ├── comparativo.component.html    # Template
│   │   └── comparativo.component.css     # Estilos
│   ├── legacy-page/
│   │   └── legacy-page.component.*  # Componente para páginas legadas
│   ├── app.module.ts
│   ├── app-routing.module.ts
│   └── app.component.*
├── assets/
│   ├── pages/      # HTMLs legados (opcional)
│   └── static/     # JSON e recursos estáticos
├── index.html
├── main.ts
├── polyfills.ts
└── styles.css
```

## 🎨 Rotas disponíveis

- `/` ou `/comparativo` - Componente Comparativo (Angular nativo)
- `/page/:name` - Páginas legadas via LegacyPageComponent

## 🔧 Tecnologias utilizadas

- **Angular 16** - Framework
- **TypeScript** - Linguagem
- **RxJS** - Programação reativa
- **Chart.js 4** - Gráficos interativos
- **HttpClient** - Requisições HTTP

## 📊 Componente Comparativo - Detalhes técnicos

O componente `ComparativoComponent` demonstra as melhores práticas Angular:

### Gestão de estado
- Usa `Observable` e `BehaviorSubject` do RxJS
- Implementa `OnInit`, `OnDestroy`, `AfterViewInit`
- Gerencia subscrições com `takeUntil` para evitar memory leaks

### Gráficos Chart.js
- Registra componentes do Chart.js no módulo
- Cria gráficos após a view inicializar (`AfterViewInit`)
- Destrói gráficos no `ngOnDestroy`
- 4 tipos de gráficos: bar, radar, line, scatter

### Template
- Data binding com `{{ }}` e `*ngFor`
- Diretivas estruturais `*ngIf` para loading/conteúdo
- Métodos auxiliares (`formatarNumero`, `ordenarEscolas`)
- Sem uso de `[innerHTML]` (segurança)

## 🔄 Próximos passos recomendados

### Migração incremental
1. **Converter outras páginas** - Transformar `index.html`, `visao-geral.html`, etc. em componentes Angular
2. **Criar serviços especializados** - Separar lógica de negócio em serviços reutilizáveis
3. **Implementar lazy loading** - Carregar módulos sob demanda para melhor performance

### Melhorias
- **Testes unitários** - Adicionar testes com Jasmine/Karma
- **Testes E2E** - Implementar testes end-to-end com Protractor/Cypress
- **Interceptors HTTP** - Para tratamento centralizado de erros
- **State management** - Considerar NgRx para estado complexo
- **PWA** - Transformar em Progressive Web App

### Qualidade
- **ESLint** - Adicionar linting de código
- **Prettier** - Formatação automática
- **Husky** - Git hooks para validação pré-commit

## 📝 Diferenças do código legado

| Aspecto | Legado | Angular |
|---------|--------|---------|
| Carregamento de dados | Fetch API + variáveis globais | HttpClient + Observable |
| Manipulação DOM | `document.getElementById` | Data binding + diretivas |
| Gráficos | Chart.js via CDN | Chart.js via npm (tipado) |
| Estilos | Tailwind CDN + inline | CSS componentizado |
| Organização | HTML monolítico | Componentes modulares |
| Tipagem | JavaScript (sem tipos) | TypeScript (tipado) |

## 🐛 Troubleshooting

### Erro: "Cannot find module '@angular/core'"
Execute `npm install` para instalar as dependências.

### Gráficos não aparecem
Certifique-se de que:
1. Os dados foram carregados (`mediasPorTipo` não é null)
2. Os canvas existem no DOM
3. Chart.js foi importado corretamente

### JSON não carrega
Verifique se o arquivo `src/assets/static/dados_escolas.json` existe e está no formato correto.

## 📚 Recursos

- [Documentação Angular](https://angular.io/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

