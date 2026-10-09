import type { ReactNode } from 'react'
// Read-only adaptation of TailAdmin UserProfile/UserAddressCard.tsx.
export default function InformationCard({ title, fields }: { title: string; fields: { label: string; value: ReactNode }[] }) {
  return <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
    <div className="flex flex-col gap-6 sm:flex-row lg:items-start lg:justify-between"><div className="flex-1">
      <h4 className="text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">{title}</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-7 2xl:gap-x-32">
        {fields.map(field => <div key={field.label}><p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">{field.label}</p><div className="break-words text-sm font-medium text-gray-800 dark:text-white/90">{field.value}</div></div>)}
      </div>
    </div></div>
  </div>
}
