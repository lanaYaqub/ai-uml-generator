'use client'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { RefreshCw, ZoomIn, ZoomOut, RotateCw, Download, Copy } from 'lucide-react'
import plantumlEncoder from 'plantuml-encoder'
import { useEffect, useState } from 'react'

const UMLViewer = ({
  umlCode,
  isGenerating,
  setImage,
}: {
  umlCode: string
  isGenerating: boolean
  setImage: (url: string) => void
}) => {
  const [generatedImage, setGeneratedImage] = useState('')
  const [imageReady, setImageReady] = useState(false)

  useEffect(() => {
    async function generateUML() {
      const encodedUML = plantumlEncoder.encode(umlCode)
      const plantUMLServer = 'https://www.plantuml.com/plantuml/svg/'
      const url = plantUMLServer + encodedUML
      setImage(url)
      setGeneratedImage(url)
      setImageReady(false) // Reset readiness when generating new image
    }

    generateUML()
  }, [umlCode])

  const downloadDiagram = async () => {
    if (!generatedImage) return
    const response = await fetch(generatedImage)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'uml-diagram.svg'
    link.click()
  }

  const copyURL = async () => {
    if (!generatedImage) {
      alert('Diagram not ready to copy yet.')
      return
    }

    try {
      await navigator.clipboard.writeText(generatedImage)
      alert('Diagram URL copied to clipboard!')
    } catch (err) {
      console.error('Copy failed:', err)
      alert('Failed to copy URL. Try manually.')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-muted/30 rounded-md p-4 cursor-grab">
      {isGenerating ? (
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="animate-spin h-8 w-8" />
          <p>Generating diagram...</p>
        </div>
      ) : (
        <TransformWrapper smooth>
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Controls */}
              <div className="flex gap-2 mb-2">
                <button onClick={zoomIn} className="p-2 bg-gray-200 rounded-md">
                  <ZoomIn />
                </button>
                <button onClick={zoomOut} className="p-2 bg-gray-200 rounded-md">
                  <ZoomOut />
                </button>
                <button
                  onClick={() => {
                    if (imageReady) resetTransform()
                  }}
                  className="p-2 bg-gray-200 rounded-md"
                >
                  <RotateCw />
                </button>
                <button onClick={downloadDiagram} className="p-2 bg-gray-200 rounded-md">
                  <Download />
                </button>
                <button onClick={copyURL} className="p-2 bg-gray-200 rounded-md">
                  <Copy />
                </button>
              </div>

              {/* Diagram Image */}
              <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                <div>
                  {umlCode?.length > 0 ? (
                    <img
                      src={generatedImage}
                      alt="UML Diagram Preview"
                      className="max-w-full max-h-full object-contain"
                      onLoad={() => setImageReady(true)}
                    />
                  ) : (
                    <p>No diagram available</p>
                  )}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      )}
    </div>
  )
}

export default UMLViewer
