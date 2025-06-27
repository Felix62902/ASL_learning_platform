import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TeachableMachineComponent } from './teachable-machine/teachable-machine.component';
import { LandingComponent } from './public/landing/landing.component';

@NgModule({
  declarations: [
    AppComponent,
    TeachableMachineComponent,
    LandingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
