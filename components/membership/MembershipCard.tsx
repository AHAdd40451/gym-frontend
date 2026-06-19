"use client";

import type { CSSProperties } from "react";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";

type CardTemplate = {
  cardTitle?: string;
  gymName?: string;
  logoUrl?: string;
  footerText?: string;

  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;

  backgroundType?: "color" | "image";
  backgroundColor?: string;
  backgroundImageUrl?: string;

  showMemberName?: boolean;
  showPlanName?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showCardNumber?: boolean;
  showQrCode?: boolean;
  showBarcode?: boolean;
};

type MemberCardData = {
  memberName?: string;
  planName?: string;
  phone?: string;
  email?: string;
  cardNumber?: string;
};

type MembershipCardProps = {
  template: CardTemplate;
  member: MemberCardData;
};

export default function MembershipCard({
  template,
  member,
}: MembershipCardProps) {
  const cardValue = member.cardNumber || "GYM-123456-ABCD";

  const backgroundStyle: CSSProperties =
    template.backgroundType === "image" && template.backgroundImageUrl
      ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url(${template.backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {
          backgroundColor: template.backgroundColor || "#111827",
        };

  return (
    <div
      className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl p-5 shadow-xl"
      style={{
        ...backgroundStyle,
        color: template.textColor || "#ffffff",
      }}
    >
      <div
        className="absolute right-0 top-0 h-28 w-28 rounded-bl-full opacity-25"
        style={{ backgroundColor: template.primaryColor || "#f59e0b" }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
              {template.cardTitle || "Membership Card"}
            </p>

            <h3 className="mt-1 text-xl font-bold">
              {template.gymName || "Your Gym Name"}
            </h3>
          </div>

          {template.logoUrl ? (
            <img
              src={template.logoUrl}
              alt="Gym Logo"
              className="h-14 w-14 rounded-full border border-white/30 object-cover"
            />
          ) : (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold"
              style={{
                backgroundColor: template.primaryColor || "#f59e0b",
              }}
            >
              G
            </div>
          )}
        </div>

        <div className="mt-6 space-y-2 text-sm">
          {template.showMemberName !== false && (
            <p>
              <span className="opacity-70">Member:</span>{" "}
              <span className="font-semibold">
                {member.memberName || "Ahmed Khan"}
              </span>
            </p>
          )}

          {template.showPlanName !== false && (
            <p>
              <span className="opacity-70">Plan:</span>{" "}
              <span className="font-semibold">
                {member.planName || "Monthly Plan"}
              </span>
            </p>
          )}

          {template.showPhone !== false && (
            <p>
              <span className="opacity-70">Phone:</span>{" "}
              <span className="font-semibold">
                {member.phone || "0300-1234567"}
              </span>
            </p>
          )}

          {template.showEmail !== false && (
            <p>
              <span className="opacity-70">Email:</span>{" "}
              <span className="font-semibold">
                {member.email || "member@email.com"}
              </span>
            </p>
          )}

          {template.showCardNumber !== false && (
            <p>
              <span className="opacity-70">Card ID:</span>{" "}
              <span className="font-mono font-semibold">{cardValue}</span>
            </p>
          )}
        </div>

        {(template.showQrCode !== false || template.showBarcode) && (
          <div className="mt-6 flex items-end justify-between gap-4">
            {template.showQrCode !== false && (
              <div className="rounded-lg bg-white p-2">
                <QRCodeSVG
                  value={cardValue}
                  size={90}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={false}
                />
              </div>
            )}

            {template.showBarcode && (
              <div className="flex flex-1 justify-center overflow-hidden rounded-lg bg-white px-2 py-2">
                <Barcode
                  value={cardValue}
                  width={1.2}
                  height={45}
                  displayValue={false}
                  margin={0}
                  background="#ffffff"
                  lineColor="#000000"
                />
              </div>
            )}
          </div>
        )}

        <p className="mt-5 text-xs opacity-75">
          {template.footerText || "Valid only for registered member"}
        </p>
      </div>
    </div>
  );
}