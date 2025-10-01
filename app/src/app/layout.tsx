import './globals.css'
import type { Metadata } from 'next'
import { WalletProviderRoot } from '../providers/WalletProvider'

export const metadata: Metadata = {
  title: 'Text Signer',
  description: 'Pay 0.04 SOL to sign a text on Solana',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProviderRoot>
          {children}
        </WalletProviderRoot>
      </body>
    </html>
  )
}
