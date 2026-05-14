"use client"

import { CircleCheck, Edit, Eye, MoreVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ActionRowBtnProps {
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  onActivate?: () => void;
  is_active: boolean;
  /** Если false, при неактивной строке пункт «Активировать» не показывается (например, товар без остатка). */
  showInactiveActivate?: boolean;
}

const ActionRowBtn = ({
  onEdit,
  onView = () => {},
  onDelete = () => {},
  onActivate = () => {},
  is_active,
  showInactiveActivate = true,
}: ActionRowBtnProps) => {
  const handleEdit = () => {
    onEdit?.();
  }
  const handleView = () => {
    onView?.();
  }
  const handleDelete = () => {
    onDelete?.();
  }
  const handleActivate = () => {
    onActivate?.();
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-8 w-8" size="icon" variant="ghost">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={handleView}>
          <Eye />
          Посмотреть
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Edit />
          Редактировать
        </DropdownMenuItem>
        {(is_active || showInactiveActivate) && <DropdownMenuSeparator />}
        {is_active ? (
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <Trash2 />
            Удалить
          </DropdownMenuItem>
        ) : showInactiveActivate ? (
          <DropdownMenuItem onClick={handleActivate}>
            <CircleCheck />
            Активировать
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ActionRowBtn
