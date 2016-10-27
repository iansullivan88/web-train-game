namespace Trains.Maths {
    export interface IPoint {
        x: number
        y: number
    }

    export function getGradient(from: IPoint, to: IPoint): number {
        return (to.y - from.y) / (to.x - from.x);
    }

    export function getVectorAngle(vector: IPoint): number {
        return Math.atan2(vector.y, vector.x);
    }

    export function getAngleBetweenPoints(from: IPoint, to: IPoint): number {
        return Trains.Maths.getVectorAngle({
            y: to.y - from.y,
            x: to.x - from.x
        });
    }

    export function normaliseAngle(angle: number) {
        return angle + Math.ceil( -angle / (2 * Math.PI) ) * 2 * Math.PI;
    }
}
