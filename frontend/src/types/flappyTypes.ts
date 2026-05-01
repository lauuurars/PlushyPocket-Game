export interface ObstacleData {
    typeIndex: number;
    rotation: number;
    topPos?: number;
    bottomPos?: number;
    width: number;
    height: number;
}

export interface Column {
    id: number;
    x: number;
    top?: ObstacleData;
    bottom?: ObstacleData;
    lastPosUsed?: 'top' | 'bottom';
}