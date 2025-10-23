// Modelo de dados para o Sistema REGINA

export interface Escola {
  id: string;
  nome: string;
  tipo: 'PEI' | 'Regular';
  frequencia_1bi: number;
  frequencia_2bi: number;
  rendimento_1bi: number;
  rendimento_2bi: number;
  aprovacao: number;
  uso_plataformas: number;
  engajamento_docente: number;
  score_super_bi: number;
  classificacao: string;
  evolucao_freq?: string;
  evolucao_rend?: string;
  tendencia?: string;
}

export interface ResumoRede {
  total_escolas: number;
  escolas_pei: number;
  escolas_regulares: number;
  score_medio_geral: number;
  score_medio_pei: number;
  score_medio_regular: number;
  frequencia_media_rede: number;
  rendimento_medio_rede: number;
  aprovacao_media_rede: number;
  uso_plataformas_medio: number;
  engajamento_medio: number;
}

export interface DadosEscolas {
  resumo_rede: ResumoRede;
  escolas: Escola[];
}

export interface MediasPorTipo {
  pei: {
    count: number;
    total: number;
    escolas: Escola[];
    frequencia_media: number;
    rendimento_medio: number;
    aprovacao_media: number;
    plataformas_media: number;
    score_medio: number;
  };
  regular: {
    count: number;
    total: number;
    escolas: Escola[];
    frequencia_media: number;
    rendimento_medio: number;
    aprovacao_media: number;
    plataformas_media: number;
    score_medio: number;
  };
}
