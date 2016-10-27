namespace Trains.Game.States {
    export class DriveState {

        private gameState: Trains.Game.IGameState;
        private background: Phaser.TileSprite;
        private railwayGraphics: Phaser.Graphics;
        private trackPieces: Trains.Track.ITrackPiece[];
        private trainState: Trains.Engines.ITrainState;
        private train: Phaser.Image;
        private smokeEmitter: Phaser.Particles.Arcade.Emitter;

        constructor(gameState: Trains.Game.IGameState) {
            this.gameState = gameState;
        }

        create(game: Phaser.Game) {
            this.background = game.add.tileSprite(0, 0, Trains.Game.width, Trains.Game.height, Trains.Game.images.background);
            this.railwayGraphics = game.add.graphics(0, 0);
            Trains.Game.Track.drawRailway(this.railwayGraphics, this.gameState.railway);
            this.train = game.add.image(0, 0, Trains.Game.images.steamTrain);
            this.train.anchor.setTo(0.5, 0.5);

            this.smokeEmitter = game.add.emitter(0, 0, 50);
            this.smokeEmitter.emitX = 0;
            this.smokeEmitter.emitY = 0;
            this.smokeEmitter.setSize(3,3);
            this.smokeEmitter.gravity = 0;
            this.smokeEmitter.maxRotation = 20;
            this.smokeEmitter.minRotation = -20;
            this.smokeEmitter.maxParticleSpeed = new Phaser.Point(30, 30);
            this.smokeEmitter.minParticleSpeed = new Phaser.Point(-30, -30);
            this.smokeEmitter.makeParticles(Trains.Game.images.smoke1);
            this.smokeEmitter.setAlpha(1, 0, 5000, Phaser.Easing.Quadratic.In);
            this.smokeEmitter.setScale(0, 3, 0, 3, 5000);

            this.trainState = {
                trackAndPosition: {
                    trackPiece: this.gameState.railway.allTrackPieces[0],
                    position: 0
                },
                speed: 150
            };

            this.updatePosition(0);

            this.smokeEmitter.start(false, 5000, 10);
        }

        update(game: Phaser.Game) {
            // elapsed is wall clock time
            let dt = game.time.elapsedMS / 1000;
            this.updatePosition(dt);
        }

        private updatePosition(dt: number) {
            this.trainState = Trains.Engines.move(this.trainState, this.gameState.railway, dt);

            let position = this.trainState.trackAndPosition.trackPiece.getPosition(this.trainState.trackAndPosition.position);
            this.train.x = position.point.x;
            this.train.y = position.point.y;
            this.train.rotation = position.angle

            this.smokeEmitter.x = position.point.x;
            this.smokeEmitter.y = position.point.y;
        }
    }
}
