import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ResumeData } from '../models/resume.model';

@Injectable({
  providedIn: 'root',
})
export class ResumeDataService {
  private resumeDataSubject = new BehaviorSubject<ResumeData | null>(null);
  public resumeData$ = this.resumeDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadResumeData(): Observable<ResumeData> {
    console.log('Loading resume data from assets/data/resume.json');
    return this.http.get<ResumeData>('assets/data/resume.json').pipe(
      tap((data) => {
        console.log('Resume data loaded:', data);
        this.resumeDataSubject.next(data);
      }),
      catchError((error) => {
        console.error('Error loading resume data:', error);
        throw error;
      })
    );
  }

  getResumeData(): ResumeData | null {
    return this.resumeDataSubject.value;
  }

  setResumeData(data: ResumeData): void {
    this.resumeDataSubject.next(data);
  }
}
