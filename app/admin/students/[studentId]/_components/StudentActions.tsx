"use client";

import { LoaderCircleIcon, ShieldBanIcon, ShieldCheckIcon, UserMinusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  blockStudent,
  removeStudentFromCourse,
  unblockStudent,
} from "../actions";

type StudentAccessActionsProps = {
  studentId: string;
  studentName: string;
  banned: boolean;
  banReason: string | null;
};

export function StudentAccessActions({
  studentId,
  studentName,
  banned,
  banReason,
}: StudentAccessActionsProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleBlock() {
    startTransition(async () => {
      const response = await blockStudent({ studentId, reason });

      if (response.status === "error") {
        toast.error(response.message);
        return;
      }

      setDialogOpen(false);
      setReason("");
      if (response.data?.notificationSent === false) {
        toast.warning(response.message);
      } else {
        toast.success(response.message);
      }
      router.refresh();
    });
  }

  function handleUnblock() {
    startTransition(async () => {
      const response = await unblockStudent(studentId);

      if (response.status === "error") {
        toast.error(response.message);
        return;
      }

      setDialogOpen(false);
      if (response.data?.notificationSent === false) {
        toast.warning(response.message);
      } else {
        toast.success(response.message);
      }
      router.refresh();
    });
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {banned ? (
            <ShieldCheckIcon className="size-5 text-primary" />
          ) : (
            <ShieldBanIcon className="size-5 text-destructive" />
          )}
          Account Access
        </CardTitle>
      </CardHeader>

      <CardContent>
        {banned ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
              <p className="font-medium text-destructive">
                This student is blocked
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Reason: {banReason || "No reason provided"}
              </p>
            </div>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    className="w-full rounded-xl"
                  />
                }
              >
                <ShieldCheckIcon /> Unblock Student
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Unblock {studentName}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The student will be allowed to sign in again. Previously
                    removed course access will remain removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
                  <Button type="button" disabled={pending} onClick={handleUnblock}>
                    {pending ? <LoaderCircleIcon className="animate-spin" /> : null}
                    {pending ? "Unblocking..." : "Unblock Student"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="block-reason">Reason for blocking</Label>
              <Textarea
                id="block-reason"
                value={reason}
                maxLength={200}
                disabled={pending}
                placeholder="Describe the policy violation or reason..."
                onChange={(event) => setReason(event.target.value)}
                className="min-h-24 resize-none rounded-xl"
              />
              <p className="text-right text-xs text-muted-foreground">
                {reason.length}/200
              </p>
            </div>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={pending || reason.trim().length < 3}
                    className="w-full rounded-xl bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
                  />
                }
              >
                <ShieldBanIcon /> Block Student
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Block {studentName}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The student will be signed out from every device and will
                    not be able to sign in until an admin unblocks them.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={pending}
                    className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
                    onClick={handleBlock}
                  >
                    {pending ? <LoaderCircleIcon className="animate-spin" /> : null}
                    {pending ? "Blocking..." : "Block Student"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type RemoveCourseAccessButtonProps = {
  studentId: string;
  studentName: string;
  enrollmentId: string;
  courseSlug: string;
  courseTitle: string;
};

export function RemoveCourseAccessButton({
  studentId,
  studentName,
  enrollmentId,
  courseSlug,
  courseTitle,
}: RemoveCourseAccessButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      const response = await removeStudentFromCourse({
        studentId,
        enrollmentId,
        courseSlug,
      });

      if (response.status === "error") {
        toast.error(response.message);
        return;
      }

      setOpen(false);
      toast.success(response.message);
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          />
        }
      >
        <UserMinusIcon /> Remove Access
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove course access?</AlertDialogTitle>
          <AlertDialogDescription>
            {studentName} will lose access to “{courseTitle}”. Payment and
            enrollment history will be retained for records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={handleRemove}
          >
            {pending ? <LoaderCircleIcon className="animate-spin" /> : null}
            {pending ? "Removing..." : "Remove Access"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
