import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-legacy-page',
  templateUrl: './legacy-page.component.html',
  styleUrls: ['./legacy-page.component.css']
})
export class LegacyPageComponent implements OnInit {
  htmlContent: SafeHtml | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const name = params.get('name') || 'index';
      this.loadPage(name);
    });
  }

  loadPage(name: string) {
    this.loading = true;
    this.error = null;
    const path = `assets/pages/${name}.html`;
    this.http.get(path, { responseType: 'text' }).subscribe({
      next: html => {
        // Atenção: estamos confiando no conteúdo estático copiado para assets.
        this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(html);
        this.loading = false;
      },
      error: err => {
        this.error = `Não foi possível carregar ${path} (HTTP ${err.status})`;
        this.loading = false;
      }
    });
  }
}
