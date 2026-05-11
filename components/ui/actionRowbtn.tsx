"use client"

import { Edit, Eye, MoreVertical, Trash2 } from "lucide-react"
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
}

const ActionRowBtn = ({ onEdit, onView = () => {}, onDelete = () => {} }: ActionRowBtnProps) => {
  const handleEdit = () => {
    onEdit?.();
  }
  const handleView = () => {
    onView?.();
  }
  const handleDelete = () => {
    onDelete?.();
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
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          <Trash2 />
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ActionRowBtn
