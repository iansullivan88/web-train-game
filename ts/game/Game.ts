namespace Trains.Game {

    export const stateIds = {
        boot: "boot",
        build: "build",
        drive: "drive"
    };

    export const images = {
        background: '/assets/textures/grass.png',
        trackMarker: '/assets/building/marker.png',
        steamTrain: '/assets/trains/steam.png',
        smoke1: '/assets/smoke/smoke1.png',
        smoke2: '/assets/smoke/smoke2.png'
    };

    export const width = 1024;
    export const height = 768;

    export const maxSpeed = 200;

    export const trackTypes = {
        straight: 'straight',
        circular: 'circular'
    };

    export class Game {
        private game: Phaser.Game;

        constructor(container: HTMLElement) {

            let gameState: IGameState = {
                railway: null
            };

            this.game = new Phaser.Game(width, height, Phaser.AUTO, container);
            this.game.state.add(stateIds.boot, new States.BootState());
            this.game.state.add(stateIds.build, new States.BuildState(gameState));
            this.game.state.add(stateIds.drive, new States.DriveState(gameState));
        }

        getPhaserGame(): Phaser.Game {
            return this.game;
        }

        start() {
            this.game.state.start(stateIds.boot);
        }
    }
}
