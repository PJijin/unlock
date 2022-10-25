import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { RiDeleteBack2Line as DeleteIcon } from 'react-icons/ri'
import { ComponentProps } from 'react'
import { Attribute } from '../utils'

export function AddPropertyModal({
  isOpen,
  setIsOpen,
}: ComponentProps<typeof Modal>) {
  const { control, register } = useFormContext()
  const {
    fields: properties,
    append: appendProperty,
    remove: removeProperty,
  } = useFieldArray({
    control,
    name: 'properties',
  })

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="grid gap-6">
        <header className="space-y-2 text-brand-dark">
          <h3 className="text-xl font-bold"> Add Properties </h3>
          <p>
            This custom attribute will shows up underneath of the NFT image in
            Opensea.
          </p>
        </header>
        <div className="space-y-2">
          {properties.map((item, index) => (
            <div key={item.id} className="flex items-end w-full gap-2">
              <Input
                label="Type"
                type="text"
                placeholder="type"
                {...register(`properties.${index}.trait_type`)}
              />
              <Input
                label="Name"
                type="text"
                placeholder="name"
                {...register(`properties.${index}.value`)}
              />
              <button
                className="mb-5 hover:fill-brand-ui-primary"
                aria-label="remove"
                onClick={(event) => {
                  event.preventDefault()
                  removeProperty(index)
                }}
              >
                <DeleteIcon size={24} className="fill-inherit" />
              </button>
            </div>
          ))}
          <Button
            onClick={(event) => {
              event.preventDefault()
              appendProperty({
                trait_type: '',
                value: '',
              })
            }}
            size="small"
            variant="outlined-primary"
          >
            Add property
          </Button>
        </div>
        <Button
          onClick={(event) => {
            event.preventDefault()
            setIsOpen(false)
          }}
        >
          Save
        </Button>
      </div>
    </Modal>
  )
}

export function Property({ trait_type, value }: Attribute) {
  return (
    <div className="flex flex-col items-center justify-center w-40 h-40 p-4 border rounded-xl aspect-1">
      <h4 className="text-lg font-bold"> {trait_type}</h4>
      <p>{value}</p>
    </div>
  )
}
