namespace Trains.Track {
    export class CircularTrackPiece implements Trains.Track.ITrackPiece {

        readonly id: number;
        readonly type = Trains.Game.trackTypes.circular;
        readonly radius: number;
        readonly startAngle: number;
        readonly endAngle: number;
        readonly startCoordinate: Trains.Maths.IPoint;
        readonly endCoordinate: Trains.Maths.IPoint;
        readonly center: Trains.Maths.IPoint;
        readonly length: number;
        readonly clockwise: boolean;
        readonly maxSpeed: number;

        constructor(id: number, center: Trains.Maths.IPoint, radius: number, startCoordinate: Trains.Maths.IPoint, endCoordinate: Trains.Maths.IPoint, clockwise: boolean) {
            this.id = id;
            this.center = center;
            this.radius = radius;
            this.startCoordinate = startCoordinate;
            this.endCoordinate = endCoordinate;
            this.clockwise = clockwise;
            this.startAngle = Trains.Maths.normaliseAngle(Trains.Maths.getAngleBetweenPoints(center, startCoordinate));
            this.endAngle = Trains.Maths.normaliseAngle(Trains.Maths.getAngleBetweenPoints(center, endCoordinate));

            if (clockwise && this.endAngle < this.startAngle) {
                this.endAngle += 2*Math.PI
            } else if (!clockwise && this.endAngle > this.startAngle) {
                this.endAngle -= 2*Math.PI
            }

            this.length = Math.abs(radius * (this.endAngle - this.startAngle));

            // The higher the handling value, the faster trains can go round corners
            let handling = 1;
            this.maxSpeed = Math.min(1, Trains.Game.maxSpeed - 1/(handling*this.radius*this.radius));
        }

        getPosition(percent: number): IPositionAndAngle {
            let angleOnCircle = this.startAngle + percent * (this.endAngle - this.startAngle);
            return {
                angle: angleOnCircle + (this.clockwise ? (Math.PI) : -Math.PI)/2,
                point: {
                    x: this.center.x + this.radius * Math.cos(angleOnCircle),
                    y: this.center.y + this.radius * Math.sin(angleOnCircle)
                }
            }
        }


    }
}
