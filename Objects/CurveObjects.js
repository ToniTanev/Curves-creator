import {BezierCurve, CubicHermiteCurves, offsetPoints} from "../Math.js";
import {drawPolygon} from "../Visualizer.js";
import {deleteObject} from "../MemoryManagement.js";


export class BezierCurveObject
{
    constructor()
    {
        this.controlPoints = [];
        this.meshPoints = [];

        this.poly = null;
        this.controlPoly = null;
    }

    clearPolys()
    {
        deleteObject( this.poly );
        deleteObject( this.controlPoly );

        this.poly = null;
        this.controlPoly = null;
    }

    clearAll()
    {
        for( const point of this.meshPoints )
        {
            deleteObject( point );
        }

        this.controlPoints = [];
        this.meshPoints = [];

        this.clearPolys();
    }

    redrawPolys()
    {
        this.clearPolys();

        if( this.controlPoints.length >= 2 )
        {
            const curve = new BezierCurve( this.controlPoints );

            const curvePoints = curve.generateCurve();

            offsetPoints( curvePoints );

            this.poly = drawPolygon( curvePoints, 'green' );

            const controlPointsCopy = [];
            for( let i = 0; i < this.controlPoints.length; i++ )
            {
                controlPointsCopy.push( this.controlPoints[ i ].clone() );
            }

            offsetPoints( controlPointsCopy );

            this.controlPoly = drawPolygon( controlPointsCopy, 'orange' );
        }
    }
}

export class HermiteCurveObject
{
    constructor()
    {
        this.controlPoints = [];
        this.meshPoints = [];
        this.controlVectors = [];
        this.visualVectors = [];

        this.poly = null;
        this.controlPoly = null;
    }

    redrawPolys()
    {
        deleteObject( this.poly );
        deleteObject( this.controlPoly );

        if( this.controlPoints.length >= 2 && this.controlPoints.length === this.controlVectors.length )
        {
            const curve = new CubicHermiteCurves( this.controlPoints, this.controlVectors );

            const curvePoints = curve.generateCurves();

            offsetPoints( curvePoints );

            this.poly = drawPolygon( curvePoints, 'green' );
        }
    }
}