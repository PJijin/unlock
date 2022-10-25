import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { RiDeleteBack2Line as DeleteIcon } from 'react-icons/ri'
import { ComponentProps } from 'react'
import { Attribute } from '../utils'

export function AddStatModal({
  isOpen,
  setIsOpen,
}: ComponentProps<typeof Modal>) {
  const { control, register } = useFormContext()
  const {
    fields: stats,
    append: appendStat,
    remove: removeStat,
  } = useFieldArray({
    control,
    name: 'stats',
  })

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="grid gap-6">
        <header className="space-y-2 text-brand-dark">
          <h3 className="text-xl font-bold">Add Stats </h3>
          <p>
            This custom attribute will be shown as numbers. Members can use it
            as filter.
          </p>
        </header>
        <div className="space-y-2">
          {stats.map((item, index) => (
            <div key={item.id} className="flex items-end w-full gap-2">
              <Input
                label="Type"
                type="text"
                placeholder="type"
                {...register(`stats.${index}.trait_type`)}
              />
              <div className="space-y-1 max-w-[50%] mb-1.5">
                <label htmlFor="value"> Value </label>
                <div className="grid items-center grid-cols-3 px-2 border border-gray-400 rounded-lg">
                  <input
                    type="number"
                    placeholder="0"
                    {...register(`stats.${index}.value`)}
                    id="value"
                    className="box-border flex-1 block w-full p-2 text-base border-none outline-none focus:outline-none"
                  />
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    of
                  </div>
                  <input
                    type="number"
                    placeholder="10"
                    {...register(`stats.${index}.max_value`)}
                    className="box-border flex-1 block w-full p-2 text-base border-none outline-none"
                  />
                </div>
              </div>
              <button
                className="mb-5 hover:fill-brand-ui-primary"
                aria-label="remove"
                onClick={(event) => {
                  event.preventDefault()
                  removeStat(index)
                }}
              >
                <DeleteIcon size={24} className="fill-inherit" />
              </button>
            </div>
          ))}
          <Button
            onClick={(event) => {
              event.preventDefault()
              appendStat({
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
