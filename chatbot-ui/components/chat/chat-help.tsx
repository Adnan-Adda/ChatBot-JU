import useHotkey from "@/lib/hooks/use-hotkey"
import {
  IconBrandGithub,
  IconBrandX,
  IconHelpCircle,
  IconQuestionMark
} from "@tabler/icons-react"
import Link from "next/link"
import { FC, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Announcements } from "../utility/announcements"

interface ChatHelpProps {}

export const ChatHelp: FC<ChatHelpProps> = ({}) => {
  useHotkey("/", () => setIsOpen(prevState => !prevState))

  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <IconQuestionMark className="bg-primary text-secondary size-[24px] cursor-pointer rounded-full p-0.5 opacity-60 hover:opacity-50 lg:size-[30px] lg:p-1" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex space-x-2">


            <Link
              className="cursor-pointer hover:opacity-50"
              href="https://github.com/Adnan-Adda/ChatBot-JU"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandGithub />
            </Link>
          </div>

          <div className="flex space-x-2">
            <Announcements />

            <Link
              className="cursor-pointer hover:opacity-50"
              href="/help"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconHelpCircle size={24} />
            </Link>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
