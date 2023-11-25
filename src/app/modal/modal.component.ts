import { Component, ElementRef, EventEmitter, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';

@Component({
	selector: 'app-modal',
	templateUrl: './modal.component.html',
	styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
	@ViewChild('inputValue', { static: true })
	private inputField: ElementRef<HTMLInputElement>;

	@Input()
	modalTitle: string;

	@Input()
	useNumbers: boolean = false;

	textResult: EventEmitter<string> = new EventEmitter();
	numberResult: EventEmitter<number> = new EventEmitter();

	constructor(public bsModalRef: BsModalRef) { }

	public setFocus() {
		this.inputField.nativeElement.focus();
	}

	submit(value: string | number) {
		if (this.useNumbers) {
			if (value?.toString().length > 0 && !Number.isNaN(value)) {
				this.numberResult.emit(value as number)
			}
		} else {
			this.textResult.emit(value as string);
		}
	}
}
