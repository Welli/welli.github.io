import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ModalComponent } from './modal/modal.component';

import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
	declarations: [AppComponent, ModalComponent],
	imports: [BrowserModule, FormsModule, ModalModule.forRoot()],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule { }
