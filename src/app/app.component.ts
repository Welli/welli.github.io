import { Component, ElementRef, Input, ViewChild } from '@angular/core';

interface Player {
	id: number;
	name: string;
	points: number;
}

interface Round {
	pointsPerPlayer: Record<number, number>;
}

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	@ViewChild('winModal')
	private winModal: ElementRef<HTMLDialogElement>;

	pointsToWin: number = 1000;
	private winningPlayers: Player[] = [];

	rounds: Round[] = [];
	players: Player[] = [];
	private playerCount: number = 0;

	start(playerCount: string | number) {
		this.reset();
		this.playerCount = playerCount as number;

		if (this.playerCount < 2) {
			window.alert('Mind. 2 Spieler erforderlich!');
			this.playerCount = 0;
			return;
		}

		for (let i = 0; i < this.playerCount; i++) {
			const playerName = window.prompt('Spieler ' + (i + 1));

			if (!playerName) {
				this.reset();
				return;
			}

			this.players.push({ id: i, name: playerName, points: 0 });
		}
	}

	reset() {
		this.players = [];
		this.rounds = [];
		this.winningPlayers = [];
	}

	setPoints() {
		const round: Round = { pointsPerPlayer: {} };
		const pointsPerPlayer: Map<number, number> = new Map();
		for (const player of this.players) {
			const points = this.promptNumber('Punkte für ' + player.name);

			if (points === null) {
				return;
			}

			pointsPerPlayer.set(player.id, points);
		}

		pointsPerPlayer.forEach((points, id) => {
			const player = this.players.find((p) => p.id === id);
			player.points += points;
			round.pointsPerPlayer[id] = player.points;
		});

		this.rounds.push(round);

		if (this.players.some((player) => player.points >= this.pointsToWin)) {
			const winningPoints = this.players
				.slice()
				.sort((a, b) => b.points - a.points)[0].points;
			this.winningPlayers = this.players.filter(
				(player) => player.points === winningPoints
			);

			this.winModal.nativeElement.showModal();
		}
	}

	getWinningPlayerNames(): string {
		return this.winningPlayers.map((player) => player.name).join(', ');
	}

	promptNumber(message: string): number {
		const val = window.prompt(message);

		if (!val) {
			return null;
		}

		const nr: number = parseInt(val);
		if (Number.isNaN(nr)) {
			return this.promptNumber(message);
		}

		return nr;
	}
}
