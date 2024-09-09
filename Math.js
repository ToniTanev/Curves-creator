import * as THREE from 'three';

function slerp( u, v, t )
{
    // copy vectors, so that we don't modify the originals
    const u1 = new THREE.Vector3( u.x, u.y, u.z );
    const v1 = new THREE.Vector3( v.x, v.y, v.z );

    const angleBetween = u1.angleTo( v1 );
    const nom = u1.multiplyScalar( Math.sin( angleBetween * ( 1 - t ) ) ).add( v1.multiplyScalar( Math.sin( angleBetween * t ) ) );
    return nom.divideScalar( Math.sin( angleBetween ) );
}

const epsilonOffset = 0.07;
export class BezierCurve
{
    constructor( controlPoints )
    {
        this.controlPoints = controlPoints;
    }

    generateCurve()
    {
        const curvePoints = [];
        for( let t = 0.0; t <= 1.0; t += 0.01 )
        {
            curvePoints.push( this.generatePoint( t ) );
        }

        return curvePoints;
    }
    generatePoint( t )
    {
        const steps = this.controlPoints.length - 1;
        let prevPoints = this.controlPoints;

        for( let i = 0; i < steps; i++ )
        {
            const currPoints = [];
            for( let j = 0; j < prevPoints.length - 1; j++ )
            {
                currPoints.push( slerp( prevPoints[j], prevPoints[j + 1], t ) );
            }

            prevPoints = currPoints;
        }

        const resultPt = prevPoints[ 0 ];
        const normalized = new THREE.Vector3( resultPt.x, resultPt.y, resultPt.z ).normalize();
        const epsilonOffsetVec = normalized.multiplyScalar( epsilonOffset );

        // slightly offset the curve points to avoid Z fight with the sphere
        // the offset is in the direction of the sphere normal at that point
        // the normal coincides with the curve point itself when the curve point is on the sphere which is centered at (0, 0, 0)
        return resultPt.add( epsilonOffsetVec );
    }
}