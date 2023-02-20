import { Button, Input } from '@unlock-protocol/ui'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { useActor } from '@xstate/react'
import { useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { useStorageService } from '~/utils/withStorageService'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { UnlockAccountService } from './unlockAccountMachine'
import Link from 'next/link'

interface Props {
  unlockAccountService: UnlockAccountService
}

export function EnterEmail({ unlockAccountService }: Props) {
  const [_, send] = useActor(unlockAccountService)
  const [showWallets, setShowWallets] = useState(true)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm()
  const storageService = useStorageService()
  const [isContinuing, setIsContinuing] = useState(false)

  async function onSubmit({ email }: FieldValues) {
    try {
      setIsContinuing(true)
      const existingUser = await storageService.userExist(email)
      send({
        type: 'SUBMIT_USER',
        email,
        existingUser,
      })
      setIsContinuing(false)
      send('CONTINUE')
    } catch (error) {
      if (error instanceof Error) {
        setError('email', {
          type: 'value',
          message: error.message,
        })
      }
      setIsContinuing(false)
    }
  }

  return (
    <div className="h-full flex flex-col justify-between">
      {!showWallets && (
        <>
          <main className="px-6 pb-2 space-y-2 overflow-auto h-full">
            <h3 className="font-bold ml-0.5">
              Login or create your Unlock account
            </h3>
            <form id="enter-email" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Let's start with your email address:"
                type="email"
                size="small"
                placeholder="jane.doe@example.com"
                required
                error={errors?.email?.message as unknown as string}
                {...register('email', {
                  required: true,
                })}
              />
            </form>
            <p className="ml-0.5 text-xs">
              This step enables you to log-in or create an{' '}
              <Link
                href="https://docs.unlock-protocol.com/tools/sign-in-with-ethereum/unlock-accounts"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-ui-main-500"
              >
                Unlock account
              </Link>
              . If you already have a crypto wallet, please connect it now.
            </p>
          </main>
          <footer className="px-6 pt-6 border-t grid items-center">
            <Button
              loading={isContinuing}
              form="enter-email"
              disabled={isContinuing}
              type="submit"
            >
              {isContinuing ? 'Continuing' : 'Continue'}
            </Button>
            <PoweredByUnlock />
          </footer>
        </>
      )}
    </div>
  )
}
