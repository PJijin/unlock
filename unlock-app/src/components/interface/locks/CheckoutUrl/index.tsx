import { Button, Modal, Tabs } from '@unlock-protocol/ui'
import { useRouter } from 'next/router'
import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { PaywallConfigType as PaywallConfig } from '@unlock-protocol/core'
import { CheckoutPreview } from './elements/CheckoutPreview'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import {
  useCheckoutConfigRemove,
  useCheckoutConfigUpdate,
  useCheckoutConfigsByUser,
} from '~/hooks/useCheckoutConfig'
import { FaTrash as TrashIcon, FaSave as SaveIcon } from 'react-icons/fa'
import { useLockSettings } from '~/hooks/useLockSettings'
import { useQuery } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { BasicConfigForm } from './elements/BasicConfigForm'
import { LocksForm } from './elements/LocksForm'
import { ChooseConfiguration, CheckoutConfig } from './ChooseConfiguration'

const Header = () => {
  return (
    <header className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Checkout Builder</h1>
      <span className="text-base text-gray-700">
        Customize your membership checkout experience. The preview on the left
        is updated in realtime.
      </span>
    </header>
  )
}

export const CheckoutUrlPage = () => {
  const router = useRouter()
  const query = router.query
  const { lock: lockAddress, network } = query ?? {}
  const [isDeleteConfirmation, setDeleteConfirmation] = useState(false)
  const { getIsRecurringPossible } = useLockSettings()
  const {
    isPlaceholderData: isRecurringSettingPlaceholder,
    data: recurringSetting,
  } = useQuery(
    ['isRecurringPossible', network, lockAddress],
    async () => {
      return getIsRecurringPossible({
        lockAddress: lockAddress!.toString(),
        network: Number(network!),
      })
    },
    {
      placeholderData: {
        isRecurringPossible: false,
        oneYearRecurring: 0,
        gasRefund: 0,
      },
      enabled: Boolean(network && lockAddress),
    }
  )

  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfig>({
    id: null as null | string,
    name: 'config',
    config: {
      locks:
        network && lockAddress
          ? {
              [lockAddress as string]: {
                network: parseInt(`${network!}`),
                skipRecipient: true,
              },
            }
          : {},
      icon: '',
      pessimistic: true,
      skipRecipient: true,
    },
  })

  const DEFAULT_CONFIG = useMemo(() => {
    const recurringPayments = recurringSetting?.isRecurringPossible
      ? recurringSetting.oneYearRecurring
      : undefined
    return {
      locks:
        network && lockAddress
          ? {
              [lockAddress as string]: {
                network: parseInt(`${network!}`),
                skipRecipient: true,
                recurringPayments,
              },
            }
          : {},
      icon: '',
      pessimistic: true,
      skipRecipient: true,
    } as PaywallConfig
  }, [recurringSetting, lockAddress, network])

  const {
    isLoading: isLoadingConfigList,
    data: checkoutConfigList,
    refetch: refetchConfigList,
  } = useCheckoutConfigsByUser()

  const { mutateAsync: updateConfig, isLoading: isConfigUpdating } =
    useCheckoutConfigUpdate()

  const { mutateAsync: removeConfig, isLoading: isConfigRemoving } =
    useCheckoutConfigRemove()

  // retrieve recurringPayments when lock is present in url
  useEffect(() => {
    if (
      (!lockAddress && !network) ||
      isRecurringSettingPlaceholder ||
      isLoadingConfigList ||
      (checkoutConfigList || [])?.length > 0
    )
      return
    const getDefaultConfig = async (): Promise<void> => {
      const recurringPayments = recurringSetting?.isRecurringPossible
        ? recurringSetting.oneYearRecurring
        : undefined

      setCheckoutConfig((state) => {
        if (state.config.locks[lockAddress as string]) {
          // set recurring value
          state.config.locks[lockAddress as string].recurringPayments =
            recurringPayments
        }

        return {
          ...state,
          config: {
            ...state.config,
          },
        }
      })
    }
    getDefaultConfig()
  }, [
    lockAddress,
    network,
    isRecurringSettingPlaceholder,
    recurringSetting,
    isLoadingConfigList,
    checkoutConfigList,
  ])

  const onConfigSave = useCallback(async () => {
    const updated = await updateConfig({
      config: checkoutConfig.config,
      name: checkoutConfig.name,
      id: checkoutConfig.id,
    })
    setCheckoutConfig({
      id: updated.id,
      name: updated.name,
      config: updated.config as PaywallConfig,
    })
    ToastHelper.success('Configuration updated.')
    await refetchConfigList()
  }, [checkoutConfig, updateConfig, refetchConfigList])

  const onConfigRemove = useCallback<MouseEventHandler<HTMLButtonElement>>(
    async (event) => {
      event.preventDefault()
      if (!checkoutConfig.id) {
        setDeleteConfirmation(false)
        return
      }
      await removeConfig(checkoutConfig.id)
      const { data: list } = await refetchConfigList()
      const result = list?.[0]
      setCheckoutConfig({
        id: result?.id || null,
        name: result?.name || 'config',
        config: (result?.config as PaywallConfig) || DEFAULT_CONFIG,
      })
      setDeleteConfirmation(false)
    },
    [
      checkoutConfig,
      removeConfig,
      refetchConfigList,
      DEFAULT_CONFIG,
      setDeleteConfirmation,
    ]
  )
  useEffect(() => {
    const checkout = checkoutConfigList?.[0]
    if (!checkout) return

    setCheckoutConfig({
      id: checkout.id,
      name: checkout.name,
      config: checkout.config as PaywallConfig,
    })
  }, [checkoutConfigList])

  const onAddLocks = (locks: any) => {
    setCheckoutConfig((state) => {
      return {
        ...state,
        config: {
          ...state.config,
          locks,
        },
      }
    })
  }

  const onBasicConfigChange = (fields: Partial<PaywallConfig>) => {
    const hasDefaultLock =
      Object.keys(fields?.locks ?? {}).length === 0 && lockAddress && network

    if (hasDefaultLock) {
      fields = {
        ...fields,
        locks: {
          [lockAddress as string]: {
            network: parseInt(`${network!}`),
          },
        },
      }
    }

    setCheckoutConfig((state) => {
      return {
        ...state,
        config: {
          ...state.config,
          ...fields,
        },
      }
    })
  }

  const TopBar = () => {
    return (
      <Button variant="borderless" aria-label="arrow back">
        <ArrowBackIcon
          size={20}
          className="cursor-pointer"
          onClick={() => router.back()}
        />
      </Button>
    )
  }

  const hasRecurringPlaceholder =
    !!lockAddress && !!network && isRecurringSettingPlaceholder

  return (
    <>
      <Modal isOpen={isDeleteConfirmation} setIsOpen={setDeleteConfirmation}>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Delete {checkoutConfig.name}</h1>
          <span className="text-base text-gray-700">
            Are you sure you want to delete this checkout configuration? This
            will break any links that use this configuration and cannot be
            undone.
          </span>
          <div className="grid w-full">
            <Button
              loading={isConfigRemoving}
              iconLeft={<TrashIcon />}
              onClick={onConfigRemove}
            >
              Delete {checkoutConfig.name}
            </Button>
          </div>
        </div>
      </Modal>
      <TopBar />
      <div className="z-[1] flex flex-col w-full min-h-screen gap-8 pt-10 pb-20 md:flex-row relative">
        <div className="z-0 order-2 md:w-1/2 md:order-1">
          <CheckoutPreview
            id={checkoutConfig.id}
            paywallConfig={checkoutConfig.config}
          />
        </div>
        <div className="z-0 flex flex-col order-1 gap-5 md:gap-10 md:w-1/2 md:order-2">
          <Header />
          <Tabs
            tabs={[
              {
                title: 'Choose a configuration',
                description:
                  'Create a new configuration or continue enhance the existing one for your checkout modal',
                children: (
                  <div className="flex items-center w-full gap-4 p-2">
                    <div className="w-full">
                      <ChooseConfiguration
                        disabled={isConfigUpdating}
                        items={
                          (checkoutConfigList as unknown as CheckoutConfig[]) ||
                          ([] as CheckoutConfig[])
                        }
                        onChange={async ({ config, ...rest }) => {
                          const option = {
                            ...rest,
                            config: config || DEFAULT_CONFIG,
                          }
                          setCheckoutConfig(option)
                          if (!option.id) {
                            const response = await updateConfig(option)
                            setCheckoutConfig({
                              id: response.id,
                              config: response.config as PaywallConfig,
                              name: response.name,
                            })
                            await refetchConfigList()
                          }
                        }}
                        value={checkoutConfig}
                      />
                      <Button
                        className="ml-auto"
                        disabled={!checkoutConfig.id}
                        iconLeft={<TrashIcon />}
                        onClick={(event) => {
                          event.preventDefault()
                          setDeleteConfirmation(true)
                        }}
                        size="small"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ),
              },
              {
                title: 'Configure the basics',
                description:
                  'Customize the checkout modal interaction & additional behavior',
                children: (
                  <BasicConfigForm
                    onChange={onBasicConfigChange}
                    defaultValues={checkoutConfig.config}
                  />
                ),
              },
              {
                title: 'Configured locks',
                description:
                  'Select the locks that you would like to featured in this configured checkout modal',
                children: (
                  <LocksForm
                    onChange={onAddLocks}
                    locks={checkoutConfig.config?.locks}
                  />
                ),
                button: {
                  loading: isConfigUpdating,
                  disabled: hasRecurringPlaceholder,
                  iconLeft: <SaveIcon />,
                },
                onNextLabel: 'Save',
                onNext: async () => await onConfigSave(),
              },
            ]}
          />
        </div>
      </div>
    </>
  )
}
