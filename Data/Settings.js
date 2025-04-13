
export class BezierSettings
{
    constructor()
    {
        this.showControlPoly = false;
        this.controlPolyColor = 'orange';
        this.curveColor = 'green';
        this.pointScale = 1;
        this.pointColor = 'red';
    }

    copyFrom( other )
    {
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
        this.showControlPoly = false;
        this.controlPolyColor = 'orange';
        this.curveColor = 'green';
        this.pointScale = 1;
        this.pointColor = 'red';
        this.vectorScale = 1;
        this.vectorColor = 'yellow';
    }

    copyFrom( other )
    {
        this.showControlPoly = other.showControlPoly;
        this.controlPolyColor = other.controlPolyColor;
        this.curveColor = other.curveColor;
        this.pointScale = other.pointScale;
        this.pointColor = other.pointColor;
        this.vectorScale = other.vectorScale;
        this.vectorColor = other.vectorColor;
    }
}

export class SphereSettings
{
    constructor()
    {
        this.scale = 1;
        this.color = 'blue';
    }
}