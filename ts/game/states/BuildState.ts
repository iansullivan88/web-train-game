namespace Trains.Game.States {
    export class BuildState {

        private gameState: Trains.Game.IGameState;
        private background: Phaser.TileSprite;
        private trackPoints: Trains.Track.ITrackPoint[];
        private currentId: number = 0;
        private railwayGraphics: Phaser.Graphics;
        private previewPiece: Phaser.Graphics;
        private previewPoint: Trains.Track.ITrackPoint;

        public readonly isBuildState = true;

        constructor(gameState: Trains.Game.IGameState) {
            this.gameState = gameState;
        }

        create(game: Phaser.Game) {
            this.background = game.add.tileSprite(0, 0, Trains.Game.width, Trains.Game.height, Trains.Game.images.background);
            this.background.inputEnabled = true;
            this.railwayGraphics = game.add.graphics(0, 0);
            this.previewPiece = game.add.graphics(0, 0);
            this.previewPiece.alpha = 0.5;
            this.trackPoints = [];
        }

        // Update handles mouse events. I'd like to make this event rather than state based.
        update(game: Phaser.Game) {
            let pointer = game.input.activePointer;
            if (!pointer) {
                return;
            }

            if (!this.previewPoint && pointer.isUp) {
                // No need to do anything
                return;
            }
            else if (this.previewPoint && pointer.isDown) {
                // We are previewing a track piece, update the preview point
                this.previewPoint.point.x = pointer.position.x;
                this.previewPoint.point.y = pointer.position.y;
            } else if (!this.previewPoint && pointer.isDown) {
                // If this is the first press, create the first point
                if (!this.trackPoints.length) {
                    this.trackPoints.push(this.createNextPoint(pointer));
                    this.drawMarkerAtPoint(game, this.trackPoints[0]);
                }
                // The pointer has just been pressed, create a preview point
                this.previewPoint = this.createNextPoint(pointer);

            } else if (this.previewPoint && pointer.isUp) {
                // Press has finished, save the point
                this.trackPoints.push(this.previewPoint);
                this.drawMarkerAtPoint(game, this.previewPoint);
                this.previewPoint = null;
            }

            this.redrawRailway(game);
        }

        private redrawRailway(game: Phaser.Game){
            var pointsAndPreview: Trains.Track.ITrackPoint[];
            if (this.previewPoint) {
                pointsAndPreview = this.trackPoints.slice();
                pointsAndPreview.push(this.previewPoint);
            } else {
                pointsAndPreview = this.trackPoints;
            }

            this.gameState.railway = Trains.Track.buildRailway(pointsAndPreview);
            this.railwayGraphics.clear();
            Trains.Game.Track.drawRailway(this.railwayGraphics, this.gameState.railway);
        }

        private drawMarkerAtPoint(game: Phaser.Game, point: Trains.Track.ITrackPoint) {
            let sprite = game.add.image(
                point.point.x,
                point.point.y,
                Trains.Game.images.trackMarker);

            sprite.anchor.set(0.5);
        }

        private createNextPoint(pointer: Phaser.Pointer): Trains.Track.ITrackPoint {
            return {
                id: ++this.currentId,
                point: {
                    x: pointer.position.x,
                    y: pointer.position.y
                }
            };
        }
    }
}
