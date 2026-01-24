import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Link2 } from "lucide-react";

// Mapping des types d'éléments vers leurs relations possibles
const relationshipMap: Record<string, string[]> = {
  truie: ["saillies", "mises bas", "portées"],
  verrat: ["saillies"],
  saillie: ["mises bas"],
  "mise bas": ["portées"],
  portée: ["lots post-sevrage", "mortalités"],
  "lot post-sevrage": ["pesées", "consommations", "mortalités", "transferts vers engraissement"],
  "lot engraissement": ["pesées", "consommations", "mortalités", "ventes"],
  "stock aliment": ["consommations"],
  vaccination: [],
  traitement: [],
  vente: [],
  dépense: [],
  alerte: [],
  mouvement: [],
};

interface ConstraintErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: string;
  customMessage?: string;
}

export function ConstraintErrorDialog({
  open,
  onOpenChange,
  itemType,
  customMessage,
}: ConstraintErrorDialogProps) {
  const relatedItems = relationshipMap[itemType.toLowerCase()] || [];
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
            <AlertTriangle className="h-7 w-7 text-amber-500" />
          </div>
          <AlertDialogTitle className="text-center font-display text-xl">
            Suppression impossible
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            {customMessage ? (
              <p>{customMessage}</p>
            ) : (
              <>
                <p>
                  Cet(te) <span className="font-semibold text-foreground">{itemType}</span> ne peut pas être supprimé(e) car il/elle est lié(e) à d'autres données dans le système.
                </p>
                {relatedItems.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 text-left">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                      <Link2 className="h-3 w-3" />
                      Données liées possibles
                    </p>
                    <ul className="text-sm space-y-1">
                      {relatedItems.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Veuillez d'abord supprimer ou modifier les éléments liés avant de pouvoir supprimer cet(te) {itemType}.
                </p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="w-full">
            Compris
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
