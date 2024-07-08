
import { scene } from "./CurveCreator";

function drawPolygon( points, color ) {

    for(let i = 0; i < points.size - 1; i++)
    {
        const material = new THREE.LineBasicMaterial( { color: color } );

        const currLinePoints = [ points[i], points[i + 1] ];
        const geometry = new THREE.BufferGeometry().setFromPoints( currLinePoints );

        const line = new THREE.Line( geometry, material );

        scene.add( line );
    }
}
