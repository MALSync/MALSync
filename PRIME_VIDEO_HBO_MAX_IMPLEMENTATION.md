# Prime Video & HBO Max Implementation

## Overview

Adicionado suporte para monitoramento de Prime Video e HBO Max na extensão MALSync.

## Arquivos Criados

### Prime Video
- `src/pages/PrimeVideo/main.ts` - Lógica principal de sincronização
- `src/pages/PrimeVideo/meta.json` - Metadados e URLs
- `src/pages/PrimeVideo/style.less` - Estilos CSS

### HBO Max
- `src/pages/HBOMax/main.ts` - Lógica principal de sincronização
- `src/pages/HBOMax/meta.json` - Metadados e URLs
- `src/pages/HBOMax/style.less` - Estilos CSS

## Arquivos Modificados

### `src/pages/list.json`
- Adicionado entrada para Prime Video: `https://www.primevideo.com` (type: anime)
- Adicionado entrada para HBO Max: `https://www.max.com` (type: anime)

### `src/pages/pages.ts`
- Importado `PrimeVideo` do módulo `PrimeVideo/main`
- Importado `HBOMax` do módulo `HBOMax/main`
- Adicionado ambos ao objeto exportado `pages`

## Funcionalidade

### Prime Video
- **URL Match**: `*://www.primevideo.com/*`, `*://primevideo.com/*`
- **Watch Page**: `/watch/[ID]`
- **Detecta**: Título, episódio, temporada, ID do vídeo
- **Search Database**: PrimeVideo
- **Linguagens**: Muitas

### HBO Max
- **URL Match**: `*://www.max.com/*`, `*://www.hbomax.com/*`
- **Watch Page**: `/video/[ID]` ou `/watch/[ID]`
- **Detecta**: Título, episódio, temporada, ID do vídeo
- **Search Database**: HBOMax
- **Linguagens**: Muitas

## Seletores DOM Utilizados

### Prime Video
- Título: `[data-automation-id="title"]`
- Episódio: `[data-automation-id="episode"]`
- Temporada: `[data-automation-id="season"]`
- Metadados: `[data-automation-id="meta-info"]`

### HBO Max
- Título: `[data-testid="title"]`
- Episódio: `[data-testid="episodeNumber"]`
- Temporada: `[data-testid="seasonSelect"]`
- Tipo de vídeo: `[data-testid="videoType"]`

## Recursos Implementados

✅ Detecção automática de anime ao assistir
✅ Suporte para séries e filmes
✅ Sincronização de episódio e temporada
✅ URLs de próximo episódio (estrutura preparada)
✅ Integração com sistema de busca da extensão

## Notas de Desenvolvimento

- Ambos providers seguem o padrão das páginas existentes (Netflix, Hulu)
- Implementado detecção de tipo de conteúdo (série vs filme)
- Tratamento de erros com logging para debug
- Compatível com sistema de sincronização local da extensão

## Build

O projeto foi testado e compilado com sucesso:
```bash
npm run build
```

Sem erros críticos, apenas warnings padrão do webpack.

## Próximos Passos Possíveis

1. Melhorar detecção de seletores DOM em mudanças de layout
2. Adicionar suporte para next episode links
3. Implementar cache para informações de episódio
4. Adicionar mais detalhes de sincronização (data assistida, rating)
