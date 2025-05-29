import * as THREE from 'three'
import { useState } from 'react'
import Button from '@mui/material/Button'
import { DXFLoader } from 'three-dxf-loader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

import { Canvas } from '@react-three/fiber'
import { MapControls, Center, Resize } from '@react-three/drei'
import { suspend } from 'suspend-react'





  export default function App() {
    const [file, setFile] = useState()
    const [fileType, setFileType] = useState()  // NEW: Track file type ("dxf" or "obj")

    const handleFile = (event) => setFile(event instanceof DragEvent ? event.dataTransfer.files[0] : event.target.files[0])
    return (
      <>
        <Canvas>
          {file && (
            <Center>
              <Resize scale={3}>
                <Dxf src={file} />
              </Resize>
            </Center>
          )}
          <MapControls screenSpacePanning />
        </Canvas>
        <Button style={{ position: 'absolute', top: 0, left: 0, margin: 10 }} variant="contained" color="primary">
          <input hidden accept=".dxf, .dwg, .obj, .stl" type="file" id="file" onChange={handleFile} />
          <label htmlFor="file">Open DXF</label>
          
        </Button>
      </>
    )
  }

  function Dxf({ src, font = '/helvetiker_regular.typeface.blob', ...props }) {
    const drawing = suspend(async () => {
      const loader = new DXFLoader()
      loader.setFont(font)
      const result = loader.parse(await src.text())
      return result.entity // This is the parsed Group
    }, ['dxf', src, font])
    return <primitive object={drawing} {...props} />
  }
