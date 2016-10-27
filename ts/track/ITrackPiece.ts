namespace Trains.Track {
    export interface ITrackPiece {
        id: number;
        length: number;
        type: string;
        maxSpeed: number;
        getPosition(percent: number): IPositionAndAngle;
    }
}
