import React, { useState } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { generateCode } from './CodeGenerator'
import GeneratedCodeDisplay from './CodeGeneratorCode'

interface FieldType {
  value: string
  label: string
}

const fieldTypes: FieldType[] = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
  { value: 'date', label: 'Date' },
  { value: 'number', label: 'Number' },
]

export interface FormField {
  id: string
  type: string
  label: string
  name: string
  description: string
  isOptional: boolean
  isDisabled: boolean
  defaultValue: string
  options?: { label: string; value: string }[]
}

interface FieldProps {
  field: FormField
  updateField: (id: string, updates: Partial<FormField>) => void
  removeField: (id: string) => void
}

const TextInputField: React.FC<FieldProps> = ({ field, updateField }) => {
  return (
    <>
      <Label>Label*</Label>
      <Input
        value={field.label}
        onChange={(e) => {
          const label = e.target.value
          updateField(field.id, {
            label,
            name: label.toLowerCase().replace(/\s+/g, '_'),
          })
        }}
        className='mb-2'
        required
      />
      <Label>Description</Label>
      <Textarea
        value={field.description}
        onChange={(e) => updateField(field.id, { description: e.target.value })}
        className='mb-2'
      />
      <div className='flex items-center mb-2'>
        <Label className='mr-2'>Optional</Label>
        <Switch
          checked={field.isOptional}
          onCheckedChange={(checked) =>
            updateField(field.id, { isOptional: checked })
          }
        />
      </div>
      <div className='flex items-center mb-2'>
        <Label className='mr-2'>Disabled</Label>
        <Switch
          checked={field.isDisabled}
          onCheckedChange={(checked) =>
            updateField(field.id, { isDisabled: checked })
          }
        />
      </div>
      <Label>Default Value</Label>
      <Input
        value={field.defaultValue}
        onChange={(e) =>
          updateField(field.id, { defaultValue: e.target.value })
        }
        className='mb-2'
      />
    </>
  )
}

const OptionsField: React.FC<FieldProps> = ({ field, updateField }) => {
  const addOption = () => {
    const newOption = { label: '', value: '' }
    const newOptions = [...(field.options || []), newOption]
    updateField(field.id, { options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = [...(field.options || [])]
    newOptions.splice(index, 1)
    updateField(field.id, { options: newOptions })
  }

  const updateOption = (index: number, label: string, value: string) => {
    const newOptions = [...(field.options || [])]
    newOptions[index] = { label, value }
    updateField(field.id, { options: newOptions })
  }

  const validateOptions = () => {
    const nonEmptyOptions = field.options?.filter(
      (option) => option.label.trim() !== '' && option.value.trim() !== ''
    )
    if (nonEmptyOptions && nonEmptyOptions.length > 0) {
      updateField(field.id, { options: nonEmptyOptions })
    } else {
      updateField(field.id, {
        options: [{ label: 'Option 1', value: 'option_1' }],
      })
    }
  }

  return (
    <>
      <TextInputField
        field={field}
        updateField={updateField}
        removeField={() => {}}
      />
      <div className='space-y-2'>
        <Label>Options</Label>
        {field.options?.map((option, index) => (
          <div key={index} className='flex items-center space-x-2'>
            <Input
              value={option.label}
              onChange={(e) => {
                const label = e.target.value
                updateOption(
                  index,
                  label,
                  label.toLowerCase().replace(/\s+/g, '_')
                )
              }}
              placeholder='Option label'
              onBlur={validateOptions}
            />
            <Button
              variant='ghost'
              size='icon'
              onClick={() => removeOption(index)}
              disabled={field.options!.length <= 1}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        ))}
        <Button onClick={addOption} variant='outline' size='sm'>
          <Plus className='h-4 w-4 mr-2' /> Add Option
        </Button>
      </div>
    </>
  )
}

const FormBuilder: React.FC = () => {
  const [fields, setFields] = useState<FormField[]>([])
  const [selectedType, setSelectedType] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [generatedTypescript, setGeneratedTypescript] = useState<string>('')
  const [generatedJavascript, setGeneratedJavascript] = useState<string>('')
  const [isCodeDisplayOpen, setIsCodeDisplayOpen] = useState<boolean>(false)
  const [formName, setFormName] = useState<string>('')
  const [formDescription, setFormDescription] = useState<string>('')
  const [isNextJs, setIsNextJs] = useState<boolean>(true)

  const addField = () => {
    if (selectedType) {
      const newName = `field_${Date.now()}`
      const newField: FormField = {
        id: `field-${Date.now()}`,
        type: selectedType,
        label: '',
        name: newName,
        description: '',
        isOptional: false,
        isDisabled: false,
        defaultValue: '',
      }

      if (selectedType === 'select' || selectedType === 'radio') {
        newField.options = [{ label: 'Option 1', value: 'option_1' }]
      }

      setFields([...fields, newField])
      setSelectedType('')
      setError('')
    } else {
      setError('Please select a field type before adding.')
    }
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(
      fields.map((field) => {
        if (field.id === id) {
          const updatedField = { ...field, ...updates }
          if (updates.label) {
            updatedField.name = ensureUniqueName(
              updatedField.label.toLowerCase().replace(/\s+/g, '_'),
              id
            )
          }
          return updatedField
        }
        return field
      })
    )
  }

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id))
  }

  const ensureUniqueName = (name: string, currentId: string): string => {
    let uniqueName = name
    let counter = 1
    while (
      fields.some(
        (field) => field.id !== currentId && field.name === uniqueName
      )
    ) {
      uniqueName = `${name}_${counter}`
      counter++
    }
    return uniqueName
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(fields)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    setFields(items)
  }

  const handleGenerateCode = () => {
    if (fields.length === 0) {
      setError('Please add at least one field before generating code.')
      return
    }

    // Validate options for select and radio fields
    const updatedFields = fields.map((field) => {
      if (field.type === 'select' || field.type === 'radio') {
        const nonEmptyOptions = field.options?.filter(
          (option) => option.label.trim() !== '' && option.value.trim() !== ''
        )
        if (!nonEmptyOptions || nonEmptyOptions.length === 0) {
          return {
            ...field,
            options: [{ label: 'Option 1', value: 'option_1' }],
          }
        }
        return { ...field, options: nonEmptyOptions }
      }
      return field
    })

    setFields(updatedFields)

    const { typescript, javascript } = generateCode(
      updatedFields,
      formName,
      formDescription,
      isNextJs
    )
    setGeneratedTypescript(typescript)
    setGeneratedJavascript(javascript)
    setIsCodeDisplayOpen(true)
  }

  return (
    <div className='container mx-auto py-24 '>
      <Card className='w-full mx-auto border-0'>
        <CardHeader>
          <CardTitle className='text-3xl font-bold'>Form Builder</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className='space-y-4 mb-6'>
            <div>
              <Label>Form Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder='Enter form name'
                className='mt-1'
              />
            </div>
            <div>
              <Label>Form Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder='Enter form description'
                className='mt-1'
              />
            </div>
            <div className='flex items-center space-x-2'>
              <Label>Use Next.js</Label>
              <Switch checked={isNextJs} onCheckedChange={setIsNextJs} />
            </div>
          </div>
          <div className='flex mb-4'>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Select field type' />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addField} className='ml-2'>
              Add Field
            </Button>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId='fields'>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className='space-y-4'
                >
                  {fields.map((field, index) => (
                    <Draggable
                      key={field.id}
                      draggableId={field.id}
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className='p-4'
                        >
                          <CardHeader className='flex flex-row items-center justify-between p-2'>
                            <CardTitle className='text-lg'>{`${
                              field.type.charAt(0).toUpperCase() +
                              field.type.slice(1)
                            } Field`}</CardTitle>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => removeField(field.id)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </CardHeader>
                          <CardContent>
                            {field.type === 'select' ||
                            field.type === 'radio' ? (
                              <OptionsField
                                field={field}
                                updateField={updateField}
                                removeField={removeField}
                              />
                            ) : (
                              <TextInputField
                                field={field}
                                updateField={updateField}
                                removeField={removeField}
                              />
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Button onClick={handleGenerateCode} className='mt-6'>
            Generate Code
          </Button>
        </CardContent>
      </Card>

      <GeneratedCodeDisplay
        isOpen={isCodeDisplayOpen}
        onClose={() => setIsCodeDisplayOpen(false)}
        typescriptCode={generatedTypescript}
        javascriptCode={generatedJavascript}
      />
    </div>
  )
}

export default FormBuilder
