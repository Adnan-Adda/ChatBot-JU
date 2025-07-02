import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { LLMUsageScoreboard } from "../stats/llm-usage-scoreboard"
import { IconChevronDown } from "@tabler/icons-react"

interface QuickSettingsProps {}

export const QuickSettings: FC<QuickSettingsProps> = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 text-lg">
          <span>{t("Leader Board")}</span>
          <IconChevronDown size={20} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="min-w-[300px] max-w-[500px]"
        align="start"
      >
        <div className="pt-2">
          <LLMUsageScoreboard />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}