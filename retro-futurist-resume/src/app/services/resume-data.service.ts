import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ResumeData } from '../models/resume.model';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root',
})
export class ResumeDataService {
  private resumeDataSubject = new BehaviorSubject<ResumeData | null>(null);
  public resumeData$ = this.resumeDataSubject.asObservable();

  private currentResumeId: string | null = null;
  private resumeNotFoundSubject = new BehaviorSubject<boolean>(false);
  public resumeNotFound$ = this.resumeNotFoundSubject.asObservable();

  constructor(
    private http: HttpClient,
    private languageService: LanguageService,
  ) {}

  loadResumeData(resumeId?: string, language?: string): Observable<ResumeData> {
    // Reset not found state
    this.resumeNotFoundSubject.next(false);

    // Get current language if not provided
    const lang = language || this.languageService.getCurrentLanguage();

    // Default to 'resume' if no ID provided
    const fileName = resumeId || 'francois_ringler';
    this.currentResumeId = fileName;

    // Build path with language folder: assets/resumes/{lang}/{fileName}.json
    const resumePath = `assets/resumes/${lang}/${fileName}.json`;

    return this.http.get<ResumeData>(resumePath).pipe(
      tap((data) => {
        this.resumeDataSubject.next(data);
        this.resumeNotFoundSubject.next(false);
      }),
      catchError((error) => {
        // Mark as not found
        this.resumeNotFoundSubject.next(true);
        this.resumeDataSubject.next(null);
        return throwError(() => new Error('Resume not found'));
      }),
    );
  }

  getResumeData(): ResumeData | null {
    return this.resumeDataSubject.value;
  }

  setResumeData(data: ResumeData): void {
    this.resumeDataSubject.next(data);
  }

  getCurrentResumeId(): string | null {
    return this.currentResumeId;
  }

  isResumeNotFound(): boolean {
    return this.resumeNotFoundSubject.value;
  }
}
