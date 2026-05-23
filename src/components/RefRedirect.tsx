import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { setSS, SS } from "@/lib/session";

const RefRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const nav = useNavigate();
  useEffect(() => {
    if (code) setSS(SS.referredByCode, code);
    nav("/", { replace: true });
  }, [code, nav]);
  return null;
};

export default RefRedirect;
