import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import { AngularFireStorageModule, BUCKET } from '@angular/fire/compat/storage';
import { AngularFireModule } from '@angular/fire/compat'
import { AngularFirestoreModule } from '@angular/fire/compat/firestore/';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule, AngularFirestoreModule
  ],

  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, ],
  bootstrap: [AppComponent],
})
export class AppModule { }
