import * as THREE from 'three';
import {scene} from "./CurveCreator.js";

export function deleteObject( object )
{
    scene.remove( object );

    object.traverse( child =>
        {
        if ( child instanceof THREE.Mesh )
        {
            child.geometry.dispose();
            child.material.dispose();
        }
        }
    );
}