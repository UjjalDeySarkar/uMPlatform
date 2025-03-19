"use client";
import { secondaryBtnStyles, successBtnStyles } from "@/app/commonStyles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { grayFieldColor } from "@/consts/colors";
import { useModalDialog } from "@/hooks/useModalDialog";
import { cn } from "@/lib/utils";

import { Ellipsis, GripVertical } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { createPortal } from "react-dom";

interface Props {
  field: string;
  title?: string;
  description?: string;
  options: ICustomFieldData[];
  hiddenDescription?: boolean;
  setOptions?: Dispatch<SetStateAction<ICustomFieldData[]>>;
  embeddedCreateOptionEle?: ReactNode;
}

export const CustomFieldOptions = ({
  field,
  options,
  title,
  description,
  hiddenDescription,
  setOptions,
  embeddedCreateOptionEle,
}: Props) => {
  return (
    <>
      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-lg py-3">{title || "Options"}</h1>
          <Button className={cn(successBtnStyles)}>Create New Options</Button>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {description}
            </p>
          )}

          <div className="border rounded-sm"></div>
        </div>
      </div>
    </>
  );
};
