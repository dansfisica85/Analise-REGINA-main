import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { EscolaService } from '../services/escola.service';
import { MediasPorTipo } from '../models/escola.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Registrar componentes do Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-comparativo',
  templateUrl: './comparativo.component.html',
  styleUrls: ['./comparativo.component.css']
})
export class ComparativoComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  private charts: { [key: string]: Chart } = {};

  // Dados
  mediasPorTipo: MediasPorTipo | null = null;
  totalEscolas = 0;
  diferencaMedia = 0;
  melhorPerformance = '';
  taxaExcelenciaPEI = 0;
  taxaExcelenciaRegular = 0;
  loading = true;

  // Cores consistentes
  private readonly CORES = {
    pei: '#3b82f6',
    regular: '#10b981',
    fundoPei: 'rgba(59, 130, 246, 0.1)',
    fundoRegular: 'rgba(16, 185, 129, 0.1)'
  };

  constructor(private escolaService: EscolaService) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  ngAfterViewInit(): void {
    // Gráficos serão criados após os dados carregarem
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destruirGraficos();
  }

  private carregarDados(): void {
    this.escolaService.calcularMediasPorTipo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(medias => {
        if (medias) {
          this.mediasPorTipo = medias;
          this.totalEscolas = medias.pei.count + medias.regular.count;
          this.diferencaMedia = medias.pei.score_medio - medias.regular.score_medio;
          this.melhorPerformance = this.diferencaMedia > 0 ? '🏛️ PEI' : '🏫 Regular';
          
          // Calcular taxa de excelência (score >= 85)
          this.taxaExcelenciaPEI = this.calcularTaxaExcelencia(medias.pei.escolas);
          this.taxaExcelenciaRegular = this.calcularTaxaExcelencia(medias.regular.escolas);
          
          this.loading = false;
          
          // Criar gráficos após dados carregarem
          setTimeout(() => this.criarGraficos(), 100);
        }
      });
  }

  private calcularTaxaExcelencia(escolas: any[]): number {
    const excelentes = escolas.filter(e => e.score_super_bi >= 85).length;
    return escolas.length > 0 ? (excelentes / escolas.length) * 100 : 0;
  }

  private criarGraficos(): void {
    if (!this.mediasPorTipo) return;

    this.criarGraficoComparativo();
    this.criarRadarComparativo();
    this.criarGraficoEvolucao();
    this.criarGraficoDistribuicao();
  }

  private destruirGraficos(): void {
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
    this.charts = {};
  }

  private criarGraficoComparativo(): void {
    const canvas = document.getElementById('graficoComparacaoGeral') as HTMLCanvasElement;
    if (!canvas || !this.mediasPorTipo) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Frequência', 'Rendimento', 'Aprovação', 'Plataformas', 'Score BI'],
        datasets: [{
          label: 'Escolas PEI',
          data: [
            this.mediasPorTipo.pei.frequencia_media,
            this.mediasPorTipo.pei.rendimento_medio * 10,
            this.mediasPorTipo.pei.aprovacao_media,
            this.mediasPorTipo.pei.plataformas_media,
            this.mediasPorTipo.pei.score_medio
          ],
          backgroundColor: this.CORES.pei,
          borderColor: this.CORES.pei,
          borderWidth: 1
        }, {
          label: 'Escolas Regulares',
          data: [
            this.mediasPorTipo.regular.frequencia_media,
            this.mediasPorTipo.regular.rendimento_medio * 10,
            this.mediasPorTipo.regular.aprovacao_media,
            this.mediasPorTipo.regular.plataformas_media,
            this.mediasPorTipo.regular.score_medio
          ],
          backgroundColor: this.CORES.regular,
          borderColor: this.CORES.regular,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Comparativo PEI vs Regular'
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Pontuação'
            }
          }
        }
      }
    };

    this.charts['graficoComparacaoGeral'] = new Chart(canvas, config);
  }

  private criarRadarComparativo(): void {
    const canvas = document.getElementById('radarComparativo') as HTMLCanvasElement;
    if (!canvas || !this.mediasPorTipo) return;

    const config: ChartConfiguration = {
      type: 'radar',
      data: {
        labels: ['Frequência', 'Rendimento', 'Aprovação', 'Plataformas', 'Engajamento'],
        datasets: [{
          label: 'PEI',
          data: [
            this.mediasPorTipo.pei.frequencia_media,
            this.mediasPorTipo.pei.rendimento_medio * 10,
            this.mediasPorTipo.pei.aprovacao_media,
            this.mediasPorTipo.pei.plataformas_media,
            80 // Engajamento estimado
          ],
          borderColor: this.CORES.pei,
          backgroundColor: this.CORES.fundoPei,
          pointBackgroundColor: this.CORES.pei
        }, {
          label: 'Regular',
          data: [
            this.mediasPorTipo.regular.frequencia_media,
            this.mediasPorTipo.regular.rendimento_medio * 10,
            this.mediasPorTipo.regular.aprovacao_media,
            this.mediasPorTipo.regular.plataformas_media,
            75 // Engajamento estimado
          ],
          borderColor: this.CORES.regular,
          backgroundColor: this.CORES.fundoRegular,
          pointBackgroundColor: this.CORES.regular
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Radar Comparativo'
          }
        },
        scales: {
          r: {
            angleLines: { display: true },
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    };

    this.charts['radarComparativo'] = new Chart(canvas, config);
  }

  private criarGraficoEvolucao(): void {
    const canvas = document.getElementById('graficoEvolucaoTemporal') as HTMLCanvasElement;
    if (!canvas || !this.mediasPorTipo) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: ['1º Bimestre', '2º Bimestre'],
        datasets: [{
          label: 'PEI - Frequência',
          data: [91.5, this.mediasPorTipo.pei.frequencia_media],
          borderColor: this.CORES.pei,
          backgroundColor: this.CORES.fundoPei,
          tension: 0.4
        }, {
          label: 'Regular - Frequência',
          data: [84.2, this.mediasPorTipo.regular.frequencia_media],
          borderColor: this.CORES.regular,
          backgroundColor: this.CORES.fundoRegular,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Evolução da Frequência por Bimestre'
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
          }
        }
      }
    };

    this.charts['graficoEvolucaoTemporal'] = new Chart(canvas, config);
  }

  private criarGraficoDistribuicao(): void {
    const canvas = document.getElementById('graficoDistribuicao') as HTMLCanvasElement;
    if (!canvas || !this.mediasPorTipo) return;

    const pei = this.mediasPorTipo.pei.escolas;
    const regular = this.mediasPorTipo.regular.escolas;

    const config: ChartConfiguration = {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Escolas PEI',
          data: pei.map((escola, index) => ({
            x: index + 1,
            y: escola.score_super_bi
          })),
          backgroundColor: this.CORES.pei,
          borderColor: this.CORES.pei,
          pointRadius: 8
        }, {
          label: 'Escolas Regulares',
          data: regular.map((escola, index) => ({
            x: index + 1,
            y: escola.score_super_bi
          })),
          backgroundColor: this.CORES.regular,
          borderColor: this.CORES.regular,
          pointRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribuição de Scores por Escola'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Escolas'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Score Super BI'
            },
            min: 70,
            max: 95
          }
        }
      }
    };

    this.charts['graficoDistribuicao'] = new Chart(canvas, config);
  }

  // Métodos auxiliares para o template
  formatarNumero(valor: number | undefined, casasDecimais: number = 1): string {
    return valor?.toFixed(casasDecimais) || '--';
  }

  ordenarEscolas(escolas: any[]): any[] {
    return [...escolas].sort((a, b) => b.score_super_bi - a.score_super_bi);
  }
}
