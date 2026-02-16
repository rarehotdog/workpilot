import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Button } from './button';

export const AlertDialog = Dialog;
export const AlertDialogTrigger = DialogTrigger;
export const AlertDialogPortal = DialogPortal;
export const AlertDialogOverlay = DialogOverlay;

export function AlertDialogContent(props: React.ComponentProps<typeof DialogContent>) {
  return <DialogContent data-slot="alert-dialog-content" {...props} />;
}

export function AlertDialogHeader(props: React.ComponentProps<typeof DialogHeader>) {
  return <DialogHeader data-slot="alert-dialog-header" {...props} />;
}

export function AlertDialogFooter(props: React.ComponentProps<typeof DialogFooter>) {
  return <DialogFooter data-slot="alert-dialog-footer" {...props} />;
}

export function AlertDialogTitle(props: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle data-slot="alert-dialog-title" {...props} />;
}

export function AlertDialogDescription(props: React.ComponentProps<typeof DialogDescription>) {
  return <DialogDescription data-slot="alert-dialog-description" {...props} />;
}

export function AlertDialogAction(props: React.ComponentProps<typeof Button>) {
  return <Button data-slot="alert-dialog-action" {...props} />;
}

export function AlertDialogCancel(props: React.ComponentProps<typeof Button>) {
  return <Button data-slot="alert-dialog-cancel" variant="outline" {...props} />;
}
