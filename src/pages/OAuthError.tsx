import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { detectInAppBrowser } from "@/lib/inAppBrowser";
import temploLogo from "@/assets/templo-logo.png";

/**
 * Tela de retorno amigável quando o broker OAuth da Lovable falha
 * (ex.: "State verification failed"). Hoje o usuário fica preso na página
 * do broker; oferecemos um caminho de volta + dica quando for navegador in-app.
 */
export default function OAuthError() {
  const { language } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const code = params.get("error") || "invalid_request";
  const description = params.get("error_description") || params.get("message");
  const { isInApp, name } = detectInAppBrowser();

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + "/auth");
    } catch {
      /* noop */
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={temploLogo} alt="Templo Sagrado" className="h-14 mx-auto mb-2" />
          <div className="flex justify-center mb-2">
            <AlertTriangle className="h-8 w-8 text-amber-500" aria-hidden />
          </div>
          <CardTitle>{t("oauth_error.title", language)}</CardTitle>
          <CardDescription>{t("oauth_error.subtitle", language)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isInApp && (
            <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 text-sm">
              <p className="font-medium mb-1">{t("oauth_error.inapp_title", language)}</p>
              <p className="text-muted-foreground">
                {t("oauth_error.inapp_body", language)}
                {name ? ` (${name})` : ""}
              </p>
              <Button variant="outline" size="sm" className="mt-2" onClick={copyLink}>
                {t("oauth_error.copy_link", language)}
              </Button>
            </div>
          )}

          <div className="rounded-md bg-muted/50 p-3 text-xs font-mono text-muted-foreground break-all">
            <div>error: {code}</div>
            {description && <div className="mt-1">{description}</div>}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate("/auth")} className="w-full">
              {t("oauth_error.try_email", language)}
            </Button>
            <Button variant="outline" onClick={() => navigate("/auth")} className="w-full">
              {t("oauth_error.try_again", language)}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
