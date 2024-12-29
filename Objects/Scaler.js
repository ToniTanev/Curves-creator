import * as THREE from 'three';

export class Scaler
{
    constructor( height )
    {
        this.height = height;
        this.geometry = null;
        this.resetGeometry( height, false );
    }

    show( shouldShow = true )
    {
        if( this.geometry )
        {
            if( shouldShow )
            {
                scene.add( this.geometry );
            }
            else
            {
                scene.remove( this.geometry );
            }
        }
    }
    resetGeometry( height, shouldShow )
    {
        const material = new THREE.MeshBasicMaterial( { color: 'yellow' } );

        const cylGeometry = new THREE.CylinderGeometry( 0.5, 0.5, height, 32 );
        const cylinder = new THREE.Mesh( cylGeometry, material );
        cylinder.translateY( height / 2 );

        const boxGeometry = new THREE.BoxGeometry( 1.5, 0.8, 1.5 );
        const box = new THREE.Mesh( boxGeometry, material );
        box.translateY( height );

        const scaler = new THREE.Group;
        scaler.name = "scaler";
        cylinder.name = "scaler";
        box.name = "scaler";

        scaler.add( cylinder );
        scaler.add( box );

        this.geometry = scaler;

        this.show( shouldShow );
    }
}