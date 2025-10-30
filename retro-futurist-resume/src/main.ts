import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpLoaderFactory } from './app/services/translation-loader';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'fr',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
  ],
}).catch((err) => console.error(err));
