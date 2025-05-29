import * as THREE from 'three'
import { useState, useRef, useEffect } from 'react'
import Button from '@mui/material/Button'
import { DXFLoader } from 'three-dxf-loader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { Canvas } from '@react-three/fiber'
import { MapControls, OrbitControls, Center, Resize } from '@react-three/drei'
import { suspend } from 'suspend-react'

export default function App() {
  const [file, setFile] = useState()
  const [fileType, setFileType] = useState()
  const controlsRef = useRef()

  const handleFile = (event, type) => {
    const selectedFile = event instanceof DragEvent
      ? event.dataTransfer.files[0]
      : event.target.files[0]
    setFile(selectedFile)
    setFileType(type)
  }

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset() // Reset controls when file changes
    }
  }, [file])

  return (
    <>
      <Canvas>
        {/* Conditionally add lights for OBJ */}
        {fileType === 'obj' && (
          <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
          </>
        )}

        {file && (
          <Center>
            <Resize scale={3}>
              {fileType === 'dxf' && <Dxf src={file} />}
              {fileType === 'obj' && <ObjModel src={file} />}
            </Resize>
          </Center>
        )}

        {/* Conditionally render controls */}
        {fileType === 'obj'
          ? <OrbitControls ref={controlsRef} />
          : <MapControls ref={controlsRef} screenSpacePanning />
        }
      </Canvas>

      {/* Buttons */}
      <Button style={{ position: 'absolute', top: 0, left: 0, margin: 10 }} variant="contained" color="primary">
        <input hidden accept=".dxf" type="file" id="file-dxf" onChange={(e) => handleFile(e, 'dxf')} />
        <label htmlFor="file-dxf">Open DXF file</label>
      </Button>

      <Button style={{ position: 'absolute', top: 50, left: 0, margin: 10 }} variant="contained" color="secondary">
        <input hidden accept=".obj" type="file" id="file-obj" onChange={(e) => handleFile(e, 'obj')} />
        <label htmlFor="file-obj">Open OBJ file</label>
      </Button>
    </>
  )
}

function Dxf({ src, font = '/helvetiker_regular.typeface.blob', ...props }) {
  const drawing = suspend(async () => {
    const loader = new DXFLoader()
    loader.setFont(font)
    const result = loader.parse(await src.text())
    return result.entity
  }, ['dxf', src, font])
  return <primitive object={drawing} {...props} />
}

function ObjModel({ src, ...props }) {
  const object = suspend(async () => {
    const loader = new OBJLoader()
    const text = await src.text()
    return loader.parse(text)
  }, ['obj', src])
  return <primitive object={object} {...props} />
}
