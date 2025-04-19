
export const defaultPointColor = "#ff0000";
export const defaultVectorColor = "#ffff00";

export class BezierSettings
{
    constructor()
    {
        this.stickToSphere = true;
        this.showControlPoly = false;
        this.controlPolyColor = "#ffa500";
        this.curveColor = "#00ff00";
        this.pointScale = 1;
        this.pointColor = defaultPointColor;
    }

    copyFrom( other )
    {
        this.stickToSphere = other.stickToSphere;
        this.showControlPoly = other.showControlPoly;
        this.controlPolyColor = other.controlPolyColor;
        this.curveColor = other.curveColor;
        this.pointScale = other.pointScale;
        this.pointColor = other.pointColor;
    }
}

export class HermiteSettings
{
    constructor()
    {
        this.stickToSphere = true;
        this.showControlPoly = false;
        this.controlPolyColor = "#ffa500";
        this.curveColor = "#00ff00";
        this.pointScale = 1;
        this.pointColor = defaultPointColor;
        this.vectorScale = 1;
        this.vectorColor = defaultVectorColor;
    }

    copyFrom( other )
    {
        this.stickToSphere = other.stickToSphere;
        this.showControlPoly = other.showControlPoly;
        this.controlPolyColor = other.controlPolyColor;
        this.curveColor = other.curveColor;
        this.pointScale = other.pointScale;
        this.pointColor = other.pointColor;
        this.vectorScale = other.vectorScale;
        this.vectorColor = other.vectorColor;
    }
}
