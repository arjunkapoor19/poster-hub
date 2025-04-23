import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { useUser } from '@supabase/auth-helpers-react'

const AccountDropdown = () => {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const user = useUser()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className="hidden md:flex">
          <UserRound className="h-5 w-5" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className="z-50 min-w-[150px] bg-white rounded-md shadow-md p-1 border text-sm"
        sideOffset={5}
      >
        <DropdownMenu.Item
          onSelect={() => router.push('/profile')}
          className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md"
        >
          Profile
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={handleLogout}
          className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md text-red-600"
        >
          Logout
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export default AccountDropdown
