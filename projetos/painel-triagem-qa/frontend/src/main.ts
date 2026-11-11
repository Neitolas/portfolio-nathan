import { DatePipe } from '@angular/common';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';

type Severity = 'low' | 'medium' | 'high';
type Status = 'open' | 'triage' | 'resolved';
type Bug = { id: string; title: string; details: string; severity: Severity; status: Status; createdAt: string };

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './triagem.html',
})
class Triage {
  private readonly http = inject(HttpClient);
  readonly bugs = signal<Bug[]>([]);
  readonly search = signal('');
  readonly filter = signal<Status | 'all'>('all');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly changing = signal<string | null>(null);
  readonly error = signal('');
  readonly message = signal('');
  readonly statuses: Record<Status, string> = { open: 'Aberto', triage: 'Em triagem', resolved: 'Resolvido' };
  readonly severities: Record<Severity, string> = { low: 'Baixa', medium: 'Média', high: 'Alta' };
  readonly next: Record<Status, Status> = { open: 'triage', triage: 'resolved', resolved: 'open' };
  readonly nextLabel: Record<Status, string> = { open: 'Iniciar triagem', triage: 'Resolver', resolved: 'Reabrir' };
  readonly counts = computed(() => ({
    open: this.bugs().filter(bug => bug.status === 'open').length,
    triage: this.bugs().filter(bug => bug.status === 'triage').length,
    resolved: this.bugs().filter(bug => bug.status === 'resolved').length,
  }));
  readonly filtered = computed(() => {
    const term = this.search().trim().toLocaleLowerCase('pt-BR');
    const status = this.filter();
    return this.bugs().filter(bug =>
      (status === 'all' || bug.status === status)
      && (bug.title + ' ' + bug.details).toLocaleLowerCase('pt-BR').includes(term));
  });
  readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)] }),
    details: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
    severity: new FormControl<Severity>('medium', { nonNullable: true }),
  });

  constructor() { void this.load(); }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try { this.bugs.set(await firstValueFrom(this.http.get<Bug[]>('/api/bugs'))); }
    catch { this.error.set('Falha ao carregar os defeitos. Confira se a API está em execução e tente novamente.'); }
    finally { this.loading.set(false); }
  }

  updateFilter(value: string): void {
    if (value === 'open' || value === 'triage' || value === 'resolved') this.filter.set(value);
    else this.filter.set('all');
  }

  async create(): Promise<void> {
    const value = this.form.getRawValue();
    if (this.form.invalid || this.saving() || this.changing() || value.title.trim().length < 3) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.message.set('');
    try {
      const bug = await firstValueFrom(this.http.post<Bug>('/api/bugs', value));
      this.bugs.update(list => [bug, ...list]);
      this.form.reset({ title: '', details: '', severity: 'medium' });
      this.filter.set('all');
      this.search.set('');
      this.message.set('Defeito registrado.');
    } catch { this.error.set('Falha ao registrar. Confira os dados e tente novamente.'); }
    finally { this.saving.set(false); }
  }

  async change(bug: Bug): Promise<void> {
    if (this.changing() || this.saving()) return;
    const status = this.next[bug.status];
    this.changing.set(bug.id);
    this.error.set('');
    this.message.set('');
    try {
      await firstValueFrom(this.http.patch<void>('/api/bugs/' + bug.id + '/status', { status }));
      this.bugs.update(list => list.map(item => item.id === bug.id ? { ...item, status } : item));
      this.message.set('Status atualizado.');
    } catch { this.error.set('Falha ao atualizar o status. Tente novamente.'); }
    finally { this.changing.set(null); }
  }
}

bootstrapApplication(Triage, { providers: [provideHttpClient()] }).catch(error => console.error(error));
