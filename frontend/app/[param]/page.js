"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { param } = useParams();

  useEffect(() => {
    if (!param || param === "login" || param === "register") return;
    window.location.replace(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/${param}`);
  }, [param]);

  return null;
}