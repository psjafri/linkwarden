import React, { useState } from "react";
import TextInput from "@/components/TextInput";
import Modal from "../Modal";
import { useTranslation } from "next-i18next";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

type Props = {
  onClose: Function;
  onSubmit: Function;
  oldEmail: string;
  newEmail: string;
};

export default function EmailChangeVerificationModal({
  onClose,
  onSubmit,
  oldEmail,
  newEmail,
}: Props) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");

  return (
    <Modal toggleModal={onClose}>
      <p className="text-xl font-thin">{t("confirm_password")}</p>

      <Separator className="my-3" />

      <div className="flex flex-col gap-5">
        <p>
          {t("password_change_warning")}
          {process.env.NEXT_PUBLIC_STRIPE === "true" && t("stripe_update_note")}
        </p>

        <p>
          {t("sso_will_be_removed_warning", {
            service:
              process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true" ? "Google" : "",
          })}
        </p>

        <div>
          <p>{t("old_email")}</p>
          <p className="text-neutral">{oldEmail}</p>
        </div>

        <div>
          <p>{t("new_email")}</p>
          <p className="text-neutral">{newEmail}</p>
        </div>

        <div className="w-full">
          <p className="mb-2">{t("password")}</p>
          <TextInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••••"
            className="bg-base-200"
            type="password"
            autoFocus
          />
        </div>

        <div className="flex justify-end items-center">
          <Button variant="accent" onClick={() => onSubmit(password)}>
            {t("confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
