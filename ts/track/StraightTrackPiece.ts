namespace Trains.Track {
    export class StraightTrackPiece implements Trains.Track.ITrackPiece {
        readonly id: number;
        readonly type = Trains.Game.trackTypes.straight;
        readonly angle: number
        readonly startCoordinate: Trains.Maths.IPoint
        readonly endCoordinate: Trains.Maths.IPoint
        readonly length: number;
        readonly dx: number;
        readonly dy: number;
        readonly maxSpeed: number = Trains.Game.maxSpeed;

        constructor(id: number, angle: number, startCoordinate: Trains.Maths.IPoint, endCoordinate: Trains.Maths.IPoint) {
            this.id = id;
            this.angle = angle;
            this.startCoordinate = startCoordinate;
            this.endCoordinate = endCoordinate;

            this.dx = endCoordinate.x - startCoordinate.x;
            this.dy = endCoordinate.y - startCoordinate.y;
            this.length = Math.sqrt(this.dx*this.dx + this.dy*this.dy);
        }

        getPosition(percent:number): IPositionAndAngle {
            return {
                angle: this.angle,
                point: {
                    x: this.startCoordinate.x + percent*this.dx,
                    y: this.startCoordinate.y + percent*this.dy
                }
            };
        }
    }
}
