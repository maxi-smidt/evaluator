import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// just a test

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
