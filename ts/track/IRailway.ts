namespace Trains.Track {
    export interface IRailway {
        allTrackPieces: ITrackPiece[];
        trackPieces: { [id: number]: ITrackPiece};
        connections: { [id: number]: number };
    }
}
