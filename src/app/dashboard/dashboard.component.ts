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
  sortColumn: string = 'score_super_bi';
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

    // TODO: Add resumo$ and mediasPorTipo$ observables to EscolaService if needed
    // this.escolaService.resumo$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(resumo => {
    //     this.resumo = resumo;
    //   });

    // this.escolaService.mediasPorTipo$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(medias => {
    //     this.mediasPorTipo = medias;
    //   });
  }

  private calcularKPIs(): void {
    if (this.escolas.length === 0) return;

    this.totalEscolas = this.escolas.length;
    
    // Frequência média do 2º bimestre
    const somaFreq = this.escolas.reduce((sum, e) => sum + (e.frequencia_2bi || 0), 0);
    this.frequenciaMedia = somaFreq / this.totalEscolas;
    
    // Score médio (score_super_bi)
    const somaScore = this.escolas.reduce((sum, e) => sum + (e.score_super_bi || 0), 0);
    this.scoreMedio = somaScore / this.totalEscolas;
    
    // Melhoria geral (1º vs 2º bimestre)
    const somaFreq1 = this.escolas.reduce((sum, e) => sum + (e.frequencia_1bi || 0), 0);
    const mediaFreq1 = somaFreq1 / this.totalEscolas;
    this.melhoriaGeral = this.frequenciaMedia - mediaFreq1;
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
            label: 'Frequência 1º Bi',
            data: escolasOrdenadas.map(e => e.frequencia_1bi),
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          },
          {
            label: 'Frequência 2º Bi',
            data: escolasOrdenadas.map(e => e.frequencia_2bi),
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          },
          {
            label: 'Score Super BI',
            data: escolasOrdenadas.map(e => e.score_super_bi),
            backgroundColor: 'rgba(139, 92, 246, 0.7)',
            borderColor: 'rgba(139, 92, 246, 1)',
            borderWidth: 1,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Performance Geral - 26 Escolas',
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
            max: 100,
            title: {
              display: true,
              text: 'Frequência (%)'
            }
          },
          y1: {
            beginAtZero: true,
            max: 100,
            position: 'right',
            title: {
              display: true,
              text: 'Score Super BI'
            },
            grid: {
              drawOnChartArea: false
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
    const mediaFreq1 = this.escolas.reduce((sum, e) => sum + e.frequencia_1bi, 0) / this.totalEscolas;
    const mediaFreq2 = this.escolas.reduce((sum, e) => sum + e.frequencia_2bi, 0) / this.totalEscolas;
    const mediaRend1 = this.escolas.reduce((sum, e) => sum + e.rendimento_1bi, 0) / this.totalEscolas;
    const mediaRend2 = this.escolas.reduce((sum, e) => sum + e.rendimento_2bi, 0) / this.totalEscolas;

    this.evolutionChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['1º Bimestre', '2º Bimestre'],
        datasets: [
          {
            label: 'Frequência Média',
            data: [mediaFreq1, mediaFreq2],
            borderColor: 'rgba(99, 102, 241, 1)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: 'Rendimento Médio',
            data: [mediaRend1, mediaRend2],
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            pointRadius: 6,
            pointHoverRadius: 8,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Evolução da Rede: 1º vs 2º Bimestre',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Frequência (%)'
            }
          },
          y1: {
            beginAtZero: true,
            max: 10,
            position: 'right',
            title: {
              display: true,
              text: 'Rendimento'
            },
            grid: {
              drawOnChartArea: false
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
        case 'frequencia_1bi':
          valorA = a.frequencia_1bi;
          valorB = b.frequencia_1bi;
          break;
        case 'frequencia_2bi':
          valorA = a.frequencia_2bi;
          valorB = b.frequencia_2bi;
          break;
        case 'score_super_bi':
          valorA = a.score_super_bi;
          valorB = b.score_super_bi;
          break;
        case 'evolucao':
          valorA = a.frequencia_2bi - a.frequencia_1bi;
          valorB = b.frequencia_2bi - b.frequencia_1bi;
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
    return escola.frequencia_2bi - escola.frequencia_1bi;
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
