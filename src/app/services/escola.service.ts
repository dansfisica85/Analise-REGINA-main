import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { DadosEscolas, Escola, ResumoRede, MediasPorTipo } from '../models/escola.model';

@Injectable({
  providedIn: 'root'
})
export class EscolaService {
  private dadosCarregados$ = new BehaviorSubject<DadosEscolas | null>(null);
  private readonly DATA_URL = 'assets/static/dados_escolas.json';

  // Observables públicos
  escolas$ = this.dadosCarregados$.pipe(
    map(dados => dados?.escolas || [])
  );

  resumo$ = this.dadosCarregados$.pipe(
    map(dados => dados?.resumo_rede || null)
  );

  mediasPorTipo$ = this.calcularMediasPorTipo();

  constructor(private http: HttpClient) {
    this.carregarDados();
  }

  /**
   * Carrega dados do JSON
   */
  carregarDados(): void {
    this.http.get<DadosEscolas>(this.DATA_URL).pipe(
      tap(dados => console.log('✅ Dados carregados:', dados)),
      catchError(error => {
        console.warn('⚠️ Erro ao carregar JSON, usando fallback:', error);
        return of(this.getDadosFallback());
      })
    ).subscribe(dados => {
      this.dadosCarregados$.next(dados);
    });
  }

  /**
   * Retorna observable dos dados
   */
  getDados(): Observable<DadosEscolas | null> {
    return this.dadosCarregados$.asObservable();
  }

  /**
   * Retorna escolas por tipo
   */
  getEscolasPorTipo(tipo?: 'PEI' | 'Regular'): Observable<Escola[]> {
    return this.dadosCarregados$.pipe(
      map(dados => {
        if (!dados) return [];
        if (!tipo) return dados.escolas;
        return dados.escolas.filter(escola => escola.tipo === tipo);
      })
    );
  }

  /**
   * Calcula médias por tipo
   */
  calcularMediasPorTipo(): Observable<MediasPorTipo | null> {
    return this.dadosCarregados$.pipe(
      map(dados => {
        if (!dados || !dados.escolas) return null;

        const pei = dados.escolas.filter(e => e.tipo === 'PEI');
        const regular = dados.escolas.filter(e => e.tipo === 'Regular');

        const calcularMedia = (escolas: Escola[], campo: keyof Escola): number => {
          const valores = escolas
            .map(e => e[campo] as number)
            .filter(v => v !== undefined && !isNaN(v));
          return valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
        };

        return {
          pei: {
            count: pei.length,
            total: pei.length,
            escolas: pei,
            frequencia_media: calcularMedia(pei, 'frequencia_2bi'),
            rendimento_medio: calcularMedia(pei, 'rendimento_2bi'),
            aprovacao_media: calcularMedia(pei, 'aprovacao'),
            plataformas_media: calcularMedia(pei, 'uso_plataformas'),
            score_medio: calcularMedia(pei, 'score_super_bi')
          },
          regular: {
            count: regular.length,
            total: regular.length,
            escolas: regular,
            frequencia_media: calcularMedia(regular, 'frequencia_2bi'),
            rendimento_medio: calcularMedia(regular, 'rendimento_2bi'),
            aprovacao_media: calcularMedia(regular, 'aprovacao'),
            plataformas_media: calcularMedia(regular, 'uso_plataformas'),
            score_medio: calcularMedia(regular, 'score_super_bi')
          }
        };
      })
    );
  }

  /**
   * Retorna resumo da rede
   */
  getResumoRede(): Observable<ResumoRede | null> {
    return this.dadosCarregados$.pipe(
      map(dados => dados?.resumo_rede || null)
    );
  }

  /**
   * Dados de fallback caso o JSON não carregue
   */
  private getDadosFallback(): DadosEscolas {
    return {
      resumo_rede: {
        total_escolas: 2,
        escolas_pei: 1,
        escolas_regulares: 1,
        score_medio_geral: 83.3,
        score_medio_pei: 86.7,
        score_medio_regular: 79.8,
        frequencia_media_rede: 90.0,
        rendimento_medio_rede: 7.2,
        aprovacao_media_rede: 84.3,
        uso_plataformas_medio: 83.4,
        engajamento_medio: 4.2
      },
      escolas: [
        {
          id: 'pei_edith_silveira',
          nome: 'PEI EE Profª Edith Silveira Dalmaso',
          tipo: 'PEI',
          frequencia_1bi: 91.9,
          frequencia_2bi: 93.0,
          rendimento_1bi: 7.7,
          rendimento_2bi: 7.6,
          aprovacao: 87.8,
          uso_plataformas: 90.0,
          engajamento_docente: 4.5,
          score_super_bi: 86.7,
          classificacao: 'MUITO BOM'
        },
        {
          id: 'ee_plinio_berardo',
          nome: 'EE Profº Plínio Berardo',
          tipo: 'Regular',
          frequencia_1bi: 84.8,
          frequencia_2bi: 87.0,
          rendimento_1bi: 6.9,
          rendimento_2bi: 6.8,
          aprovacao: 80.9,
          uso_plataformas: 76.7,
          engajamento_docente: 3.8,
          score_super_bi: 79.8,
          classificacao: 'BOM'
        }
      ]
    };
  }
}
