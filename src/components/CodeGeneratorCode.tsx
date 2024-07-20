import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface GeneratedCodeDisplayProps {
  isOpen: boolean
  onClose: () => void
  typescriptCode: string
  javascriptCode: string
}

export const GeneratedCodeDisplay: React.FC<GeneratedCodeDisplayProps> = ({
  isOpen,
  onClose,
  typescriptCode,
  javascriptCode,
}) => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('typescript')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: 'Copied to clipboard',
          description: 'The code has been copied to your clipboard.',
        })
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err)
        toast({
          title: 'Failed to copy',
          description: 'An error occurred while copying the code.',
          variant: 'destructive',
        })
      })
  }

  return (
    <div className='fixed inset-0 z-50 bg-background/80 backdrop-blur-sm'>
      <div className='fixed inset-4 z-50 overflow-hidden'>
        <Card className='w-full h-full flex flex-col'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='text-2xl font-bold'>Generated Code</CardTitle>
            <Button variant='ghost' size='icon' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </CardHeader>
          <CardContent className='flex-grow overflow-hidden'>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='h-full flex flex-col'
            >
              <TabsList className='mb-2'>
                <TabsTrigger value='typescript'>TypeScript</TabsTrigger>
                <TabsTrigger value='javascript'>JavaScript</TabsTrigger>
              </TabsList>
              <div className='flex-grow overflow-hidden'>
                <TabsContent value='typescript' className='h-full'>
                  <CodeDisplay
                    code={typescriptCode}
                    language='typescript'
                    onCopy={copyToClipboard}
                  />
                </TabsContent>
                <TabsContent value='javascript' className='h-full'>
                  <CodeDisplay
                    code={javascriptCode}
                    language='javascript'
                    onCopy={copyToClipboard}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface CodeDisplayProps {
  code: string
  language: string
  onCopy: (text: string) => void
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({
  code,
  language,
  onCopy,
}) => (
  <div className='relative h-full'>
    <div className='h-full w-full overflow-auto rounded-md border'>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          height: '100%',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
    <Button
      className='absolute top-2 right-2 z-10'
      variant='secondary'
      size='sm'
      onClick={() => onCopy(code)}
    >
      <Copy className='h-4 w-4 mr-2' />
      Copy
    </Button>
  </div>
)

export default GeneratedCodeDisplay
