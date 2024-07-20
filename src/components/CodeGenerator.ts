import { FormField } from './FormBuilder'

interface GeneratedCode {
  typescript: string
  javascript: string
}

const generateImports = (
  usedComponents: Set<string>,
  isNextJs: boolean
): string => `
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
${isNextJs ? "import Link from 'next/link'" : ''}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
${usedComponents.has('Input') ? "import { Input } from '@/components/ui/input'" : ''}
${usedComponents.has('Textarea') ? "import { Textarea } from '@/components/ui/textarea'" : ''}
${usedComponents.has('Checkbox') ? "import { Checkbox } from '@/components/ui/checkbox'" : ''}
${usedComponents.has('RadioGroup') ? "import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'" : ''}
${
  usedComponents.has('Select')
    ? `
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'`
    : ''
}
${
  usedComponents.has('Calendar')
    ? `
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'`
    : ''
}
import { cn } from '@/lib/utils'
`

const generateSchema = (fields: FormField[]): string => {
  let schema = `const formSchema = z.object({\n`
  fields.forEach((field) => {
    const { type, name, label, isOptional } = field
    let schemaField = `  ${name}: z.`
    switch (type) {
      case 'text':
      case 'textarea':
        schemaField += `string()`
        if (!isOptional) {
          schemaField += `.min(1, { message: "${label} is required" })`
        }
        break
      case 'number':
        schemaField += `string()`
        if (!isOptional) {
          schemaField += `.min(1, { message: "${label} is required" })`
        }
        break
      case 'date':
        schemaField += `date()`
        break
      case 'checkbox':
        schemaField += `boolean()`
        break
      case 'select':
      case 'radio':
        schemaField += `enum([${field.options?.map((o) => `'${o.value}'`).join(', ')}])`
        break
    }
    if (isOptional) {
      schemaField += `.optional()`
    }
    schema += schemaField + ',\n'
  })
  schema += '});\n\n'
  return schema
}

const generateFormFields = (fields: FormField[]): string => {
  return fields
    .map(
      (field) => `
        <FormField
          control={form.control}
          name="${field.name}"
          render={({ field }) => (
            <FormItem>
              ${field.type !== 'checkbox' ? `<FormLabel>${field.label}</FormLabel>` : ''}
              <FormControl>
                ${generateInputComponent(field)}
              </FormControl>
              ${field.description ? `<FormDescription>${field.description}</FormDescription>` : ''}
              <FormMessage />
            </FormItem>
          )}
        />
      `
    )
    .join('\n')
}

const generateInputComponent = (field: FormField): string => {
  switch (field.type) {
    case 'text':
    case 'number':
      return `<Input {...field} type="${field.type}" disabled={form.formState.isSubmitting || ${field.isDisabled}} />`
    case 'textarea':
      return `<Textarea {...field} disabled={form.formState.isSubmitting || ${field.isDisabled}} />`
    case 'checkbox':
      return `
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={form.formState.isSubmitting || ${field.isDisabled}}
            id={field.name}
          />
          <label
            htmlFor={field.name}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            ${field.label}
          </label>
        </div>
      `
    case 'radio':
      return `
        <RadioGroup 
          onValueChange={field.onChange} 
          defaultValue={field.value} 
          disabled={form.formState.isSubmitting || ${field.isDisabled}}
        >
          ${field.options
            ?.map(
              (option) => `
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="${option.value}" id="${field.name}-${option.value}" />
              <FormLabel htmlFor="${field.name}-${option.value}">${option.label}</FormLabel>
            </div>
          `
            )
            .join('')}
        </RadioGroup>
      `
    case 'select':
      return `
        <Select 
          onValueChange={field.onChange} 
          defaultValue={field.value}
          disabled={form.formState.isSubmitting || ${field.isDisabled}}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            ${field.options
              ?.map(
                (option) =>
                  `<SelectItem value="${option.value}">${option.label}</SelectItem>`
              )
              .join('')}
          </SelectContent>
        </Select>
      `
    case 'date':
      return `
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
              disabled={form.formState.isSubmitting || ${field.isDisabled}}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={field.onChange}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      `
    default:
      return ''
  }
}

export const generateCode = (
  fields: FormField[],
  formName: string,
  formDescription: string,
  isNextJs: boolean
): GeneratedCode => {
  const usedComponents = new Set<string>([
    'Button',
    'Form',
    'FormField',
    'FormItem',
    'FormLabel',
    'FormControl',
    'FormDescription',
    'FormMessage',
  ])

  fields.forEach((field) => {
    switch (field.type) {
      case 'text':
      case 'number':
        usedComponents.add('Input')
        break
      case 'textarea':
        usedComponents.add('Textarea')
        break
      case 'checkbox':
        usedComponents.add('Checkbox')
        break
      case 'radio':
        usedComponents.add('RadioGroup')
        usedComponents.add('RadioGroupItem')
        break
      case 'select':
        usedComponents.add('Select')
        usedComponents.add('SelectContent')
        usedComponents.add('SelectItem')
        usedComponents.add('SelectTrigger')
        usedComponents.add('SelectValue')
        break
      case 'date':
        usedComponents.add('Calendar')
        usedComponents.add('Popover')
        usedComponents.add('PopoverContent')
        usedComponents.add('PopoverTrigger')
        break
    }
  })

  const imports = generateImports(usedComponents, isNextJs)
  const schema = generateSchema(fields)
  const formFields = generateFormFields(fields)

  const component = `
export function ${formName.replace(/\s+/g, '')}() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ${fields
        .map((f) => {
          if (f.type === 'checkbox') {
            return `${f.name}: false`
          } else if (f.type === 'date') {
            return `${f.name}: undefined`
          }
          return `${f.name}: '${f.defaultValue || ''}' || undefined`
        })
        .join(',\n      ')}
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: Implement form submission
    console.log(values);
  }

  return (
    <Card className="w-full pt-12 mx-12">
      <CardHeader>
        <CardTitle>${formName}</CardTitle>
        <CardDescription>${formDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            ${formFields}
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
`

  const typescript = imports + schema + component
  const javascript = typescript
    .replace(/: z\.infer<typeof formSchema>/g, '')
    .replace(/<z\.infer<typeof formSchema>>/g, '')

  return { typescript, javascript }
}
