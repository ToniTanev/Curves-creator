import * as THREE from 'three';
import {BezierCurve, CubicHermiteCurves, offsetPoints} from "../Math.js";
import {drawPolygon} from "../Visualizer.js";
import {deleteObject} from "../MemoryManagement.js";
import {scene} from "../CurveCreator.js";


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

    assignParent()
    {
        for( const meshPoint of this.meshPoints )
        {
            meshPoint.parentCurve = this;
        }
    }

    findIndex( obj )
    {
        let inx = -1;

        if( obj.parentCurve === this )
        {
            for( let i = 0; i < this.meshPoints.length; i++ )
            {
                if( this.meshPoints[ i ] === obj )
                {
                    inx = i;
                    break;
                }
            }
        }

        return inx;
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

        for( const vector of this.visualVectors )
        {
            deleteObject( vector );
        }

        this.controlPoints = [];
        this.meshPoints = [];
        this.controlVectors = [];
        this.visualVectors = [];

        this.clearPolys();
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

    assignParent()
    {
        for( const meshPoint of this.meshPoints )
        {
            meshPoint.parentCurve = this;
        }

        for( const visualVector of this.visualVectors )
        {
            visualVector.parentCurve = this;

            visualVector.traverse( child =>
            {
                if ( child instanceof THREE.Mesh )
                {
                    child.parentCurve = this;
                }
            }
            );
        }
    }

    findIndex( obj )
    {
        let inx = -1;

        if( obj.parentCurve === this )
        {
            if( isCurvePointObj( obj ) )
            {
                for( let i = 0; i < this.meshPoints.length; i++ )
                {
                    if( this.meshPoints[ i ] === obj )
                    {
                        inx = i;
                        break;
                    }
                }
            }
            else // it is a visual vector obj
            {
                for( let i = 0; i < this.visualVectors.length; i++ )
                {
                    if( this.visualVectors[ i ] === obj || this.visualVectors[ i ] === obj.parent )
                    {
                        inx = i;
                        break;
                    }
                }
            }
        }

        return inx;
    }
}

export function isCurvePointObj( obj )
{
    return obj.parentCurve !== undefined && obj.parent === scene && obj.children.length === 0;
}

export function isCurveVectorObj( obj )
{
    return obj.parentCurve !== undefined && !isCurvePointObj( obj );
}

export function isHermiteCurveObj( obj )
{
    return obj.meshPoints !== undefined && obj.visualVectors !== undefined;
}