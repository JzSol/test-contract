'use client'

import dynamic from 'next/dynamic'
import SignButton from '../components/SignButton'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-semibold">Text Signer</h1>
      <WalletMultiButton />
      <SignButton />
    </main>
  )
}
