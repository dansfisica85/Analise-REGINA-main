import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart } from 'chart.js/auto';
import { EscolaService } from '../services/escola.service';
import { Escola, ResumoRede, MediasPorTipo } from '../models/escola.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  
  // Dados
  escolas: Escola[] = [];
  resumo?: ResumoRede;
  mediasPorTipo?: MediasPorTipo;
  loading = true;
  
  // KPIs
  totalEscolas = 0;
  frequenciaMedia = 0;
  scoreMedio = 0;
  melhoriaGeral = 0;
  
  // Charts
  private performanceChart?: Chart;
  private evolutionChart?: Chart;
  
  // Tabela
  escolasOrdenadas: Escola[] = [];
  sortColumn: string = 'score_3bim';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(private escolaService: EscolaService) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  ngAfterViewInit(): void {
    // Charts serão criados após os dados serem carregados
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.performanceChart) {
      this.performanceChart.destroy();
    }
    if (this.evolutionChart) {
      this.evolutionChart.destroy();
    }
  }

  private carregarDados(): void {
    this.escolaService.escolas$
      .pipe(takeUntil(this.destroy$))
      .subscribe(escolas => {
        this.escolas = escolas;
        this.escolasOrdenadas = [...escolas];
        this.calcularKPIs();
        this.ordenarTabela(this.sortColumn);
        this.loading = false;
        
        // Criar gráficos após dados carregados
        setTimeout(() => {
          this.criarGraficos();
        }, 100);
      });

    this.escolaService.resumo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(resumo => {
        this.resumo = resumo;
      });

    this.escolaService.mediasPorTipo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(medias => {
        this.mediasPorTipo = medias;
      });
  }

  private calcularKPIs(): void {
    if (this.escolas.length === 0) return;

    this.totalEscolas = this.escolas.length;
    
    // Frequência média do 3º bimestre
    const somaFreq = this.escolas.reduce((sum, e) => sum + (e.frequencia_3bim || 0), 0);
    this.frequenciaMedia = somaFreq / this.totalEscolas;
    
    // Score médio do 3º bimestre
    const somaScore = this.escolas.reduce((sum, e) => sum + (e.score_3bim || 0), 0);
    this.scoreMedio = somaScore / this.totalEscolas;
    
    // Melhoria geral (1º vs 3º bimestre)
    const somaScore1 = this.escolas.reduce((sum, e) => sum + (e.score_1bim || 0), 0);
    const mediaScore1 = somaScore1 / this.totalEscolas;
    this.melhoriaGeral = this.scoreMedio - mediaScore1;
  }

  private criarGraficos(): void {
    this.criarGraficoPerformance();
    this.criarGraficoEvolution();
  }

  private criarGraficoPerformance(): void {
    const canvas = document.getElementById('graficoPerformanceGeral') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ordenar escolas por nome para visualização consistente
    const escolasOrdenadas = [...this.escolas].sort((a, b) => a.nome.localeCompare(b.nome));

    this.performanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: escolasOrdenadas.map(e => e.nome),
        datasets: [
          {
            label: '1º Bimestre',
            data: escolasOrdenadas.map(e => e.score_1bim),
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          },
          {
            label: '2º Bimestre',
            data: escolasOrdenadas.map(e => e.score_2bim),
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          },
          {
            label: '3º Bimestre',
            data: escolasOrdenadas.map(e => e.score_3bim),
            backgroundColor: 'rgba(139, 92, 246, 0.7)',
            borderColor: 'rgba(139, 92, 246, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Performance Geral - 26 Escolas (Evolução por Bimestre)',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const escola = escolasOrdenadas[context.dataIndex];
                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} (${escola.tipo})`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            title: {
              display: true,
              text: 'Score Super BI'
            }
          },
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 90,
              minRotation: 45,
              font: { size: 9 }
            }
          }
        }
      }
    });
  }

  private criarGraficoEvolution(): void {
    const canvas = document.getElementById('networkEvolutionChartMain') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calcular médias por bimestre
    const media1bim = this.escolas.reduce((sum, e) => sum + e.score_1bim, 0) / this.totalEscolas;
    const media2bim = this.escolas.reduce((sum, e) => sum + e.score_2bim, 0) / this.totalEscolas;
    const media3bim = this.escolas.reduce((sum, e) => sum + e.score_3bim, 0) / this.totalEscolas;

    this.evolutionChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['1º Bimestre', '2º Bimestre', '3º Bimestre'],
        datasets: [{
          label: 'Média da Rede',
          data: [media1bim, media2bim, media3bim],
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          tension: 0.3,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Evolução da Rede: 1º vs 2º vs 3º Bimestre',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            title: {
              display: true,
              text: 'Score Médio'
            }
          }
        }
      }
    });
  }

  ordenarTabela(coluna: string): void {
    if (this.sortColumn === coluna) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = coluna;
      this.sortDirection = 'desc';
    }

    this.escolasOrdenadas.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (coluna) {
        case 'nome':
          valorA = a.nome;
          valorB = b.nome;
          break;
        case 'score_1bim':
          valorA = a.score_1bim;
          valorB = b.score_1bim;
          break;
        case 'score_2bim':
          valorA = a.score_2bim;
          valorB = b.score_2bim;
          break;
        case 'score_3bim':
          valorA = a.score_3bim;
          valorB = b.score_3bim;
          break;
        case 'evolucao':
          valorA = a.score_3bim - a.score_1bim;
          valorB = b.score_3bim - b.score_1bim;
          break;
        case 'tipo':
          valorA = a.tipo;
          valorB = b.tipo;
          break;
        default:
          return 0;
      }

      if (typeof valorA === 'string') {
        return this.sortDirection === 'asc' 
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      return this.sortDirection === 'asc' 
        ? valorA - valorB 
        : valorB - valorA;
    });
  }

  calcularEvolucao(escola: Escola): number {
    return escola.score_3bim - escola.score_1bim;
  }

  getCorEvolucao(evolucao: number): string {
    if (evolucao > 0.5) return 'text-green-600';
    if (evolucao > 0) return 'text-blue-600';
    if (evolucao < -0.5) return 'text-red-600';
    return 'text-yellow-600';
  }

  getIconeEvolucao(evolucao: number): string {
    if (evolucao > 0.5) return '📈';
    if (evolucao > 0) return '↗️';
    if (evolucao < -0.5) return '📉';
    return '→';
  }
}
