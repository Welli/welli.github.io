import { Component, ElementRef, Input, ViewChild, OnInit } from '@angular/core';
import { ModalComponent } from './modal/modal.component';
import { BsModalService } from 'ngx-bootstrap/modal';

interface Player {
	id: number;
	name: string;
	// points: number;
	isDealer: boolean;
}

interface Round {
	pointsPerPlayer: Record<number, number>;
}

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	@ViewChild('winModal')
	private winModal: ElementRef<HTMLDialogElement>;

	pointsToWin: number = 1000;
	private winningPlayers: Player[] = [];

	rounds: Round[] = [];
	players: Player[] = [];
	playerCount: number = 0;

	constructor(private modalService: BsModalService) { }

	ngOnInit() {
	}

	async start(playerCount: string | number) {
		this.reset();
		this.playerCount = playerCount as number;

		if (this.playerCount < 2) {
			window.alert('Mind. 2 Spieler erforderlich!');
			this.playerCount = 0;
			return;
		}

		const players: Player[] = [];

		for (let i = 0; i < this.playerCount; i++) {
			const playerName = await this.getModalText('Spieler ' + (i + 1));

			if (!playerName) {
				this.reset();
				return;
			}

			players.push({ id: i, name: playerName, isDealer: false });
		}

		players.at(this.getRandomInRange(0, this.playerCount - 1)).isDealer = true;

		this.players = [...players];
	}

	softReset() {
		this.rounds = [];
		this.winningPlayers = [];
	}

	reset() {
		this.softReset();
		this.players = [];
	}

	async addPoints() {
		const round: Round = { pointsPerPlayer: {} };
		const pointsPerPlayer: Map<number, number> = new Map();
		for (const player of this.players) {
			const points = Number(await this.getModalNumber('Punkte für ' + player.name));

			if (points === null) {
				return;
			}

			pointsPerPlayer.set(player.id, points);
		}

		const prevRound: Round = this.rounds.at(-1);

		pointsPerPlayer.forEach((points, id) => {
			if (prevRound) {
				round.pointsPerPlayer[id] = prevRound.pointsPerPlayer[id] + points;
			} else {
				round.pointsPerPlayer[id] = points;
			}
		});

		this.rounds.push(round);

		Object.keys(round.pointsPerPlayer).map(key => Number(key)).forEach((key: number) => {
			const pointsPerPlayer = round.pointsPerPlayer[key];

			if (pointsPerPlayer >= this.pointsToWin) {
				const player = this.players.find(p => p.id === key);

				this.winningPlayers.push(player);
			}
		});

		if (this.winningPlayers.length > 0) {
			this.winModal.nativeElement.showModal();
		}

		this.setDealer(false);
	}

	deleteRound() {
		this.rounds.pop();
		this.winningPlayers = [];

		this.setDealer(true);
	}

	// Rotate dealer
	private setDealer(isRoundDeleted: boolean) {
		const currentDealerIndex = this.players.findIndex(p => p.isDealer);
		this.players.at(currentDealerIndex).isDealer = false;

		let nextDealerIndex = currentDealerIndex + (isRoundDeleted ? -1 : 1);

		if (nextDealerIndex < 0 || nextDealerIndex >= this.playerCount) {
			nextDealerIndex = isRoundDeleted ? this.players.length - 1 : 0;
		}

		this.players.at(nextDealerIndex).isDealer = true;
	}

	getWinningPlayerNames(): string {
		return this.winningPlayers.map((player) => player.name).join(', ');
	}

	private getModalText(message: string): Promise<string> {
		return this.showModal(message, false) as Promise<string>;
	}

	private getModalNumber(message: string): Promise<number> {
		return this.showModal(message, true) as Promise<number>;
	}

	private showModal(message: string, isNumber: boolean): Promise<string> | Promise<number> {
		const modal = this.modalService.show(ModalComponent, { initialState: { modalTitle: message, useNumbers: isNumber }, backdrop: false, animated: false, ignoreBackdropClick: true, class: 'modal-dialog-centered' });
		modal.content.setFocus();

		if (isNumber) {
			return new Promise<number>((resolve, reject) => modal.content.numberResult.subscribe((result) => {
				modal.hide();
				modal.onHidden.subscribe(() => {
					return resolve(result);
				});
			}));
		} else {
			return new Promise<string>((resolve, reject) => modal.content.textResult.subscribe((result) => {
				modal.hide();
				modal.onHidden.subscribe(() => {
					return resolve(result);
				});
			}));
		}
	}

	private getRandomInRange(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1) + min)
	}
}
